export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: string
}

export class ChatService {
  async sendMessageStream(
    message: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void,
    model: string = 'gemini-2.5-flash-lite',
    temperature?: number,
    topP?: number,
    systemPrompt?: string
  ): Promise<void> {
    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          model,
          useStreaming: true,
          useMCPTools: false, // Disabled for now
          temperature,
          topP,
          systemPrompt
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()

            if (data === '[DONE]') {
              onComplete()
              return
            }

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.type === 'ai_chunk' && parsed.content) {
                onChunk(parsed.content)
              } else if (parsed.type === 'complete') {
                onComplete()
                return
              } else if (parsed.type === 'error') {
                onError(parsed.error)
                return
              }
            } catch (e) {
              // Ignore parsing errors for malformed chunks
              console.warn('Failed to parse chunk:', data)
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat service error:', error)
      onError(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }

  async sendMessage(message: string, model: string = 'gemini-2.5-flash-lite', temperature?: number, topP?: number, systemPrompt?: string): Promise<string> {
    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          model,
          useStreaming: false,
          useMCPTools: false, // Disabled for now
          temperature,
          topP,
          systemPrompt
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      return data.response || 'No response received'
    } catch (error) {
      console.error('Chat service error:', error)
      throw error instanceof Error ? error : new Error('An unknown error occurred')
    }
  }
}

export const chatService = new ChatService()
