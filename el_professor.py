import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

from agent.mcp_agent import MCPAgent, MCPAgentException, ModelUsageTracker
from utils.loader import ConfigLoader

# Load environment variables from .env file
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in environment variables")

# Config and usage tracker globals (loaded on startup)
config_loader = ConfigLoader(base_path="configs")  # adjust path as needed
model_limits= {}
server_configs = {}
usage_tracker: ModelUsageTracker

class PromptRequest(BaseModel):
    prompt: str

@asynccontextmanager
async def lifespan(_app: FastAPI):
    global model_limits, server_configs, usage_tracker
    try:
        server_configs = config_loader.load_mcp_server_config()
        model_limits = config_loader.load_model_limits()
        usage_tracker = ModelUsageTracker(model_limits)
        yield
    except Exception as e:
        raise RuntimeError(f"Failed to load configs: {e}")

app = FastAPI(title="El Professor MCP Agent API", lifespan=lifespan)

@app.post("/generate")
async def generate(request: PromptRequest):
    try:
        # Select the best model based on usage limits
        selected_model = await MCPAgent.select_model(model_limits, usage_tracker)
        await usage_tracker.increment_usage(selected_model)

        # Create MCPAgent with loaded configs
        agent = MCPAgent(api_key=API_KEY, model=selected_model, server_configs=server_configs)

        # Run the agent asynchronously with the prompt
        response = await agent.run(request.prompt)

        # Extract generated text safely
        text = response.text
        return {"model": selected_model, "response": text}

    except MCPAgentException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")
