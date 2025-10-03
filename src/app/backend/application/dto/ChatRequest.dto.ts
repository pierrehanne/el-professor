// Data Transfer Object: Chat Request
export interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string; // For text files
  base64?: string;  // For images and binary files
  mimeType: string;
}

export interface ChatRequestDto {
  message: string;
  model?: string;
  useStreaming?: boolean;
  useMCPTools?: boolean;
  files?: ProcessedFile[];
  temperature?: number;
  topP?: number;
  systemPrompt?: string;
}

export interface ChatResponseDto {
  response: string;
  model: string;
  toolUsed?: {
    tool: string;
    reasoning: string;
  };
  hasContext?: boolean;
}

export interface ModelDto {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
}

export interface MCPStatusDto {
  servers: Array<{
    name: string;
    type: string;
    toolCount: number;
  }>;
  tools: Array<{
    name: string;
    description?: string;
    serverName: string;
    serverType: string;
  }>;
  currentModel?: string;
}