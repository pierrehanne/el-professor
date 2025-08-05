import asyncio
from google import genai
from google.genai import types
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from .tracker import ModelUsageTracker
from utils.logger import Logger

logger = Logger.get_logger(__name__)


class MCPAgentException(Exception):
    """Custom exception for errors raised by MCPAgent."""
    pass

class MCPAgent:
    """
    MCPAgent handles interaction with the MCP server and tools,
    managing request generation, tool calls, and response aggregation.
    """
    def __init__(
        self,
        api_key: str,
        model: str,
        server_configs: dict,
    ):
        """
        initialize the MCPAgent.

        Args:
            api_key (str): API key for authentication with the GenAI client.
            model (str): Model name to use for content generation.
            server_configs (dict): Dictionary of server configuration dictionaries.
        """
        self.client = genai.Client(api_key=api_key)
        self.model = model
        self.server_configs = server_configs
        self.session: ClientSession = None

    def construct_stdio_params(self) -> StdioServerParameters:
        """
        Select the first enabled server config and construct stdio parameters.

        Raises:
            MCPAgentException: If no enabled config is found.

        Returns:
            StdioServerParameters: The stdio server parameters for the enabled config.
        """
        for name, cfg in self.server_configs.items():
            if not cfg.get("disabled", False):
                command = cfg.get("command")
                args = cfg.get("args")
                if command is None or args is None:
                    logger.warning(f"Skipping config '{name}' due to missing command or args")
                    continue
                logger.info(f"Using MCP server config: {name}")
                return StdioServerParameters(
                    command=command,
                    args=args,
                    env=cfg.get("env", {}),
                )
        raise MCPAgentException("No enabled MCP server configuration found.")

    @staticmethod
    async def select_model(model_limits: dict, usage_tracker: ModelUsageTracker) -> str:
        """
        select an available model based on usage limits and priority.

        Args:
            model_limits (dict): Models and their priority/usage limits.
            usage_tracker (ModelUsageTracker): Tracker to check model usage.

        Returns:
            str: Selected model name.

        Raises:
            MCPAgentException: If no suitable model is found.
        """
        models_by_priority = sorted(model_limits.items(), key=lambda item: item[1].get("priority", 999))
        for model_name, limits in models_by_priority:
            if await usage_tracker.can_use(model_name):
                return model_name
        raise MCPAgentException("No available models within usage limits.")

    @staticmethod
    def clean_schema(schema: any) -> any:
        """
        Recursively clean a schema dictionary by removing
        'exclusiveMaximum' and 'exclusiveMinimum' keys which may cause validation issues.

        Args:
            schema (Any): The schema to clean, typically a dict or nested dict/list structure.

        Returns:
            Any: The cleaned schema with excluded keys removed.
        """
        if not isinstance(schema, dict):
            return schema

        cleaned = {}
        for k, v in schema.items():
            if k in ("exclusiveMaximum", "exclusiveMinimum"):
                # Skip keys that may cause validation conflicts
                continue
            if isinstance(v, dict):
                cleaned[k] = MCPAgent.clean_schema(v)
            elif isinstance(v, list):
                cleaned[k] = [MCPAgent.clean_schema(i) if isinstance(i, dict) else i for i in v]
            else:
                cleaned[k] = v
        return cleaned

    @staticmethod
    async def _call_tool_and_get_part(
            session: ClientSession, fc_part: types.FunctionCall
    ) -> types.Part:
        """
        call a single MCP tool asynchronously and convert the response to a Part.

        Args:
            session (ClientSession): The current MCP client session.
            fc_part (types.FunctionCall): The function call object describing tool name and args.

        Returns:
            types.Part: A Part object representing the tool's response, including errors if any.
        """
        tool_name = fc_part.name
        args = fc_part.args or {}
        logger.info(f"Calling MCP tool '{tool_name}' with args: {args}")

        try:
            tool_result = await session.call_tool(tool_name, args)
            if tool_result.isError:
                tool_response = {"error": tool_result.content[0].text}
            else:
                tool_response = {"result": tool_result.content[0].text}
            logger.info(f"Tool '{tool_name}' executed successfully.")
        except Exception as e:
            logger.error(f"Tool execution failed for '{tool_name}': {e}")
            tool_response = {"error": f"Tool execution failed: {e}"}

        return types.Part.from_function_response(name=tool_name, response=tool_response)

    async def agent_loop(
            self,
            prompt: str,
            session: ClientSession
    ) -> types.GenerateContentResponse:
        """
        main agent loop that manages interaction with MCP tools and generates content iteratively.

        Args:
            prompt (str): Initial prompt text to send to the model.
            session (ClientSession): The active client session connected to MCP.

        Returns:
            types.GenerateContentResponse: The final generated content response.
        """
        # Initialize conversation contents with the user's prompt
        contents = [types.Content(role="user", parts=[types.Part(text=prompt)])]
        await session.initialize()

        # Retrieve available MCP tools and clean their input schemas
        mcp_tools = await session.list_tools()
        tools = types.Tool(function_declarations=[
            {
                "name": tool.name,
                "description": tool.description,
                "parameters": self.clean_schema(tool.inputSchema),
            }
            for tool in mcp_tools.tools
        ])

        # Generate initial content response with temperature 0 (deterministic)
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=contents,
            config=types.GenerateContentConfig(
                temperature=0,
                tools=[tools],
            ),
        )
        # Append the generated content to the conversation history
        contents.append(response.candidates[0].content)

        max_tool_turns = 5
        turn_count = 0

        # Loop while there are function calls (tool invocations) and max turns not reached
        while response.function_calls and turn_count < max_tool_turns:
            turn_count += 1

            # Call all requested tools concurrently and collect their responses as Parts
            tool_parts = await asyncio.gather(
                *(self._call_tool_and_get_part(session, fc) for fc in response.function_calls)
            )

            # Append tool responses to conversation history as user parts
            contents.append(types.Content(role="user", parts=tool_parts))
            logger.info(f"Added {len(tool_parts)} tool response parts to history.")

            # Generate further response incorporating tool outputs, using temperature 1.0 for creativity
            logger.info("Generating subsequent response with tool outputs...")
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=1.0,
                    tools=[tools],
                ),
            )
            # Append new generated content to conversation
            contents.append(response.candidates[0].content)

        # Warn if maximum tool invocation turns have been reached
        if turn_count >= max_tool_turns and response.function_calls:
            logger.warning(f"Reached maximum tool turns ({max_tool_turns}). Ending loop.")

        logger.info("Agent loop finished.")
        return response

    async def run(self, prompt: str) -> types.GenerateContentResponse:
        """
        Run the MCP agent session by constructing stdio parameters and managing client lifecycle.

        Args:
            prompt (str): The initial prompt to send to the model.

        Returns:
            types.GenerateContentResponse: The final model response.
        """
        # Build stdio client parameters from configuration
        server_params = self.construct_stdio_params()

        # Use async context managers to manage stdio client and MCP session lifecycle
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                self.session = session
                logger.info(f"Running agent loop with prompt: {prompt}")
                return await self.agent_loop(prompt, session)
