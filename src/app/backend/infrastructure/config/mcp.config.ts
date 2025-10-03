// MCP Server Configuration
export interface MCPServerConfig {
  name: string;
  type: 'http' | 'sse' | 'stdio';
  url: string;
  headers?: Record<string, string>;
  timeout?: number;
  description?: string;
}

export const mcpServers: MCPServerConfig[] = [
  {
    name: 'aws-knowledge',
    type: 'http',
    url: 'https://knowledge-mcp.global.api.aws',
    timeout: 30000,
    description: 'AWS Knowledge MCP Server - Provides up-to-date AWS documentation, code samples, and regional availability information',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'El-Profesor-AI-Assistant/1.0'
    }
  }
];

export const getMCPServerByName = (name: string): MCPServerConfig | undefined => {
  return mcpServers.find(server => server.name === name);
};

export const getDefaultMCPServer = (): MCPServerConfig => {
  return mcpServers[0]; // AWS Knowledge server as default
};

export default mcpServers;