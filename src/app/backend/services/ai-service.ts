import { GoogleGenAI } from '@google/genai'
import { envConfig } from '../config/env-config'

export class AIService {
  private ai: GoogleGenAI

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: envConfig.googleApiKey,
    })
  }

  async *generateContentStream(
    message: string,
    context?: string
  ): AsyncGenerator<string, void, unknown> {
    try {
      const systemPrompt = `You are El Profesor, an AI education assistant specializing in AWS, Terraform, and programming. 
You provide expert guidance, best practices, and practical solutions.

Your expertise includes:
- AWS cloud services, architecture, and certification preparation
- Terraform infrastructure as code and automation
- Programming languages, frameworks, and development best practices

${context ? `Additional context from MCP servers:\n${context}` : ''}

Provide helpful, accurate, and actionable responses. Use examples when appropriate.`

      const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nEl Profesor:`

      const response = await this.ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      })

      for await (const chunk of response) {
        if (chunk.text) {
          yield chunk.text
        }
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      yield 'Sorry, I encountered an error. Please try again.'
    }
  }

  async generateContent(message: string, context?: string): Promise<string> {
    try {
      const systemPrompt = `You are El Profesor, an AI education assistant specializing in AWS, Terraform, and programming. 
You provide expert guidance, best practices, and practical solutions.

Your expertise includes:
- AWS cloud services, architecture, and certification preparation
- Terraform infrastructure as code and automation
- Programming languages, frameworks, and development best practices

${context ? `Additional context from MCP servers:\n${context}` : ''}

Provide helpful, accurate, and actionable responses. Use examples when appropriate.`

      const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nEl Profesor:`

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      })

      return response.text || 'Sorry, I could not generate a response.'
    } catch (error) {
      console.error('AI Service Error:', error)
      return 'Sorry, I encountered an error. Please try again.'
    }
  }
}
