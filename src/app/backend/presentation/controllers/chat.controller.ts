// Chat Controller - Presentation Layer (Clean Architecture)
import { NextRequest, NextResponse } from 'next/server';
import { SendChatMessageUseCase } from '../../application/use-cases/SendChatMessage.usecase';
import { GetAvailableModelsUseCase } from '../../application/use-cases/GetAvailableModels.usecase';
import { GetMCPStatusUseCase } from '../../application/use-cases/GetMCPStatus.usecase';
import { aiRepository } from '../../infrastructure/repositories/AIRepository';
import { mcpRepository } from '../../infrastructure/repositories/MCPRepository';
import { ChatRequestDto } from '../../application/dto/ChatRequest.dto';
import { validateEnvConfig } from '../../infrastructure/config/environment.config';

// Validate environment on startup
validateEnvConfig();

class ChatController {
  private sendChatMessageUseCase: SendChatMessageUseCase;
  private getAvailableModelsUseCase: GetAvailableModelsUseCase;
  private getMCPStatusUseCase: GetMCPStatusUseCase;

  constructor() {
    this.sendChatMessageUseCase = new SendChatMessageUseCase(aiRepository, mcpRepository);
    this.getAvailableModelsUseCase = new GetAvailableModelsUseCase();
    this.getMCPStatusUseCase = new GetMCPStatusUseCase(mcpRepository);
  }

  async handleChatMessage(request: NextRequest): Promise<NextResponse> {
    try {
      const body: ChatRequestDto = await request.json();

      if (!body.message?.trim()) {
        return NextResponse.json(
          { error: 'Message is required' },
          { status: 400 }
        );
      }

      if (body.useStreaming) {
        return this.handleStreamingResponse(body);
      } else {
        return this.handleDirectResponse(body);
      }

    } catch (error) {
      console.error('Chat controller error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  private async handleStreamingResponse(request: ChatRequestDto): Promise<NextResponse> {
    const encoder = new TextEncoder();
    
    const sendChatMessageUseCase = this.sendChatMessageUseCase;
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await sendChatMessageUseCase.executeStreaming(request, (chunk) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'ai_chunk',
              content: chunk
            })}\n\n`));
          });

          // Send completion signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete'
          })}\n\n`));

        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  private async handleDirectResponse(request: ChatRequestDto): Promise<NextResponse> {
    try {
      const result = await this.sendChatMessageUseCase.execute(request);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Direct response error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }

  async getAvailableModels(): Promise<NextResponse> {
    try {
      const result = await this.getAvailableModelsUseCase.execute();
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get models error:', error);
      return NextResponse.json(
        { error: 'Failed to get available models' },
        { status: 500 }
      );
    }
  }

  async getMCPStatus(model?: string): Promise<NextResponse> {
    try {
      const result = await this.getMCPStatusUseCase.execute(model);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get MCP status error:', error);
      return NextResponse.json(
        { error: 'Failed to get MCP status' },
        { status: 500 }
      );
    }
  }
}

// Export singleton instance
export const chatController = new ChatController();