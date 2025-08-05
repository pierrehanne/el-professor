import json
from pathlib import Path
from agent.mcp_agent import MCPAgentException


class ConfigLoader:
    """
    Loads and validates JSON-based configuration files.
    """

    def __init__(self, base_path: str = "."):
        """
        initializes the config loader with an optional base path.

        Args:
            base_path (str): Optional root directory for config files.
        """
        self.base_path = Path(base_path)

    def _load_json(self, file_name: str) -> dict:
        """
        internal method to load a JSON file from disk.

        Args:
            file_name (str): Name of the JSON file to load.

        Returns:
            dict: Parsed JSON content.

        Raises:
            FileNotFoundError: If the file does not exist.
            json.JSONDecodeError: If the file is not valid JSON.
        """
        file_path = self.base_path / file_name
        if not file_path.is_file():
            raise FileNotFoundError(f"Config file not found: {file_path}")

        with file_path.open("r", encoding="utf-8") as f:
            return json.load(f)

    def load_mcp_server_config(self, file_name: str = "mcp_server.json") -> dict:
        """
        Loads MCP server configuration from a JSON file.

        Args:
            file_name (str): File name for the MCP config.

        Returns:
            dict: MCP server config.

        Raises:
            MCPAgentException: If the config is invalid.
        """
        config = self._load_json(file_name)
        servers = config.get("mcpServers")
        if not servers:
            raise MCPAgentException("No 'mcpServers' key found in config file.")
        return servers

    def load_model_limits(self, file_name: str = "gemini_model.json") -> dict:
        """
        Loads model limits from a JSON file.

        Args:
            file_name (str): File name for the model limit config.

        Returns:
            dict: Model limit configuration.
        """
        return self._load_json(file_name)
