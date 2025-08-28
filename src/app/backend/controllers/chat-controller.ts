import { NextRequest } from 'next/server'
import { validateEnvConfig } from '../config/env-config'
import { AIService } from '../services/ai-service'
import { mcpService } from '../services/mcp-service'

export class ChatController {
  private aiService: AIService

  constructor() {
    // Validate environment configuration
    validateEnvConfig()
    this.aiService = new AIService()
  }

  async handleChatStream(request: NextRequest): Promise<Response> {
    try {
      const { message } = await request.json()

      if (!message || typeof message !== 'string') {
        return new Response(JSON.stringify({ error: 'Message is required and must be a string' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Get enhanced context from MCP servers
      const mcpContext = await mcpService.getRelevantContext(message)

      // Capture aiService reference for use in stream
      const aiService = this.aiService

      // Create a readable stream for Server-Sent Events
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Generate streaming response
            for await (const chunk of aiService.generateContentStream(message, mcpContext)) {
              const data = JSON.stringify({ content: chunk })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }

            // Send completion signal
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            console.error('Streaming error:', error)
            const errorData = JSON.stringify({
              error: 'An error occurred while generating the response',
            })
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    } catch (error) {
      console.error('Chat Controller Error:', error)
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  async handleChatMessage(request: NextRequest): Promise<Response> {
    try {
      const { message } = await request.json()

      if (!message || typeof message !== 'string') {
        return new Response(JSON.stringify({ error: 'Message is required and must be a string' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Get enhanced context from MCP servers
      const mcpContext = await mcpService.getRelevantContext(message)

      // Generate response
      const response = await this.aiService.generateContent(message, mcpContext)

      return new Response(JSON.stringify({ response }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Chat Controller Error:', error)
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
}

// Singleton instance
export const chatController = new ChatController()
