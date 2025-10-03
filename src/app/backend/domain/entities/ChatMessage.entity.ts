// Domain Entity: Chat Message
export class ChatMessage {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly role: 'user' | 'assistant',
    public readonly timestamp: Date,
    public readonly model?: string,
    public readonly toolUsed?: {
      tool: string;
      reasoning: string;
    },
    public readonly hasContext?: boolean
  ) {}

  static create(
    content: string,
    role: 'user' | 'assistant',
    options: {
      model?: string;
      toolUsed?: { tool: string; reasoning: string };
      hasContext?: boolean;
    } = {}
  ): ChatMessage {
    return new ChatMessage(
      Date.now().toString(),
      content,
      role,
      new Date(),
      options.model,
      options.toolUsed,
      options.hasContext
    );
  }

  isFromUser(): boolean {
    return this.role === 'user';
  }

  isFromAssistant(): boolean {
    return this.role === 'assistant';
  }

  hasToolUsage(): boolean {
    return !!this.toolUsed;
  }

  hasExternalContext(): boolean {
    return !!this.hasContext;
  }
}