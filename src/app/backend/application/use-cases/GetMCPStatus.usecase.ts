// Use Case: Get MCP Status
import { AIModel } from '../../domain/value-objects/AIModel.vo';
import { IMCPRepository } from '../../domain/repositories/IMCPRepository';
import { MCPStatusDto } from '../dto/ChatRequest.dto';

export class GetMCPStatusUseCase {
  constructor(private readonly mcpRepository: IMCPRepository) {}

  async execute(model?: string): Promise<MCPStatusDto> {
    // Validate model if provided
    const aiModel = model ? AIModel.create(model) : AIModel.getDefault();
    
    // Initialize MCP repository
    await this.mcpRepository.initialize(aiModel.getValue());

    // Get server status and tools
    const [servers, tools] = await Promise.all([
      this.mcpRepository.getServerStatus(),
      this.mcpRepository.getAvailableTools()
    ]);

    return {
      servers: servers.map(server => ({
        name: server.name,
        type: server.type,
        toolCount: server.toolCount
      })),
      tools: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        serverName: tool.serverName,
        serverType: tool.serverType
      })),
      currentModel: aiModel.getValue()
    };
  }
}