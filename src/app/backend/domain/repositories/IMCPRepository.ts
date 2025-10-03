// Repository Interface: MCP Repository
export interface MCPTool {
  name: string;
  description?: string;
  serverName: string;
  serverType: string;
}

export interface MCPServer {
  name: string;
  type: 'http' | 'sse' | 'stdio';
  url: string;
  toolCount: number;
}

export interface ToolExecutionResult {
  content: string;
  toolUsed: {
    tool: string;
    reasoning: string;
  };
}

export interface IMCPRepository {
  initialize(model?: string): Promise<void>;
  getAvailableTools(): Promise<MCPTool[]>;
  getServerStatus(): Promise<MCPServer[]>;
  getRelevantContext(query: string): Promise<string>;
  executeToolStream(
    query: string,
    onChunk: (chunk: string) => void
  ): Promise<ToolExecutionResult | null>;
  cleanup(): Promise<void>;
}