// Domain Service: Chat Business Logic
import { ChatMessage } from '../entities/ChatMessage.entity';
import { AIModel } from '../value-objects/AIModel.vo';

export interface ToolDecision {
  shouldUseTool: boolean;
  tool?: string;
  reasoning: string;
}

export class ChatDomainService {
  static shouldUseMCPTools(message: string, availableTools: any[]): ToolDecision {
    if (availableTools.length === 0) {
      return {
        shouldUseTool: false,
        reasoning: 'No MCP tools available'
      };
    }

    const messageLower = message.toLowerCase();
    
    // Business rules for tool usage
    const awsKeywords = ['aws', 'amazon', 'lambda', 's3', 'ec2', 'bedrock'];
    const terraformKeywords = ['terraform', 'infrastructure', 'deploy'];
    const diagramKeywords = ['diagram', 'architecture', 'draw', 'visualize'];
    
    if (awsKeywords.some(keyword => messageLower.includes(keyword))) {
      return {
        shouldUseTool: true,
        tool: 'aws-documentation',
        reasoning: 'Query contains AWS-related keywords, using AWS documentation tools'
      };
    }
    
    if (terraformKeywords.some(keyword => messageLower.includes(keyword))) {
      return {
        shouldUseTool: true,
        tool: 'terraform',
        reasoning: 'Query contains Terraform-related keywords, using Terraform tools'
      };
    }
    
    if (diagramKeywords.some(keyword => messageLower.includes(keyword))) {
      return {
        shouldUseTool: true,
        tool: 'diagram',
        reasoning: 'Query requests diagram creation, using diagram tools'
      };
    }

    return {
      shouldUseTool: false,
      reasoning: 'No relevant tools found for this query'
    };
  }

  static buildPrompt(message: string, context?: string): string {
    const basePrompt = "You are El Profesor, a knowledgeable AI assistant.";
    
    if (!context) {
      return `${basePrompt} Answer the following question:\n\n${message}`;
    }

    return `${basePrompt} You have access to specialized tools and documentation.

Context from MCP tools:
${context}

User question: ${message}

Please provide a comprehensive answer using the context provided above. If the context is relevant, incorporate it into your response. If not, answer based on your general knowledge.`;
  }

  static validateMessage(content: string): void {
    if (!content || !content.trim()) {
      throw new Error('Message content cannot be empty');
    }

    if (content.length > 10000) {
      throw new Error('Message content too long (max 10000 characters)');
    }
  }

  static createUserMessage(content: string): ChatMessage {
    this.validateMessage(content);
    return ChatMessage.create(content, 'user');
  }

  static createAssistantMessage(
    content: string,
    model: AIModel,
    options: {
      toolUsed?: { tool: string; reasoning: string };
      hasContext?: boolean;
    } = {}
  ): ChatMessage {
    return ChatMessage.create(content, 'assistant', {
      model: model.getValue(),
      ...options
    });
  }
}