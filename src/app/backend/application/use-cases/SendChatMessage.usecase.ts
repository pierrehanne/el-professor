// Use Case: Send Chat Message
import { ChatMessage } from '../../domain/entities/ChatMessage.entity';
import { AIModel } from '../../domain/value-objects/AIModel.vo';
import { ChatDomainService } from '../../domain/services/ChatDomainService';
import { IAIRepository } from '../../domain/repositories/IAIRepository';
import { IMCPRepository } from '../../domain/repositories/IMCPRepository';
import { ChatRequestDto, ChatResponseDto } from '../dto/ChatRequest.dto';

export class SendChatMessageUseCase {
  constructor(
    private readonly aiRepository: IAIRepository,
    private readonly mcpRepository: IMCPRepository
  ) {}

  async execute(request: ChatRequestDto): Promise<ChatResponseDto> {
    // Validate and create domain objects
    const userMessage = ChatDomainService.createUserMessage(request.message);
    const model = request.model ? AIModel.create(request.model) : AIModel.getDefault();

    // Initialize MCP (AWS Knowledge MCP Server)
    await this.mcpRepository.initialize(model.getValue());

    let mcpContext = '';
    let toolUsed: { tool: string; reasoning: string } | undefined;

    // Get relevant AWS context if the query is AWS-related
    try {
      mcpContext = await this.mcpRepository.getRelevantContext(request.message);
      if (mcpContext) {
        console.log('📚 Found relevant AWS documentation context');
      }
    } catch (error) {
      console.warn('⚠️ Could not get MCP context:', error);
    }

    // Generate AI response
    const prompt = ChatDomainService.buildPrompt(request.message, mcpContext);
    const aiResponse = await this.aiRepository.generateContent({
      model,
      message: prompt,
      files: request.files,
      temperature: request.temperature,
      topP: request.topP,
      systemPrompt: request.systemPrompt
    });

    // Create assistant message
    const assistantMessage = ChatDomainService.createAssistantMessage(
      aiResponse.content,
      model,
      {
        toolUsed,
        hasContext: !!mcpContext
      }
    );

    return {
      response: assistantMessage.content,
      model: assistantMessage.model!,
      toolUsed: assistantMessage.toolUsed,
      hasContext: assistantMessage.hasContext
    };
  }

  async executeStreaming(
    request: ChatRequestDto,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    // Validate and create domain objects
    const userMessage = ChatDomainService.createUserMessage(request.message);
    const model = request.model ? AIModel.create(request.model) : AIModel.getDefault();

    // Initialize MCP (AWS Knowledge MCP Server)
    await this.mcpRepository.initialize(model.getValue());

    let mcpContext = '';
    let toolUsed: { tool: string; reasoning: string } | undefined;

    // Get relevant AWS context if the query is AWS-related
    try {
      mcpContext = await this.mcpRepository.getRelevantContext(request.message);
      if (mcpContext) {
        console.log('📚 Found relevant AWS documentation context for streaming');
      }
    } catch (error) {
      console.warn('⚠️ Could not get MCP context for streaming:', error);
    }

    // Generate AI response with streaming
    const prompt = ChatDomainService.buildPrompt(request.message, mcpContext);
    await this.aiRepository.generateContentStream(
      {
        model,
        message: prompt,
        files: request.files,
        temperature: request.temperature,
        topP: request.topP,
        systemPrompt: request.systemPrompt
      },
      onChunk
    );
  }
}