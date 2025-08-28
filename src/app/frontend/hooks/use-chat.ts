import { useState, useCallback, useRef } from 'react'
import { ChatMessage, chatService } from '../services/chat-service'

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage.id
  }, [])

  const updateMessage = useCallback((id: string, updater: string | ((prev: string) => string)) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id
          ? { ...msg, content: typeof updater === 'function' ? updater(msg.content) : updater }
          : msg
      )
    )
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      setError(null)
      setIsLoading(true)

      // Add user message
      const userMessage = addMessage({
        role: 'user',
        content: content.trim(),
      })

      // Add assistant message placeholder
      const assistantMessageId = addMessage({
        role: 'assistant',
        content: '',
      })

      try {
        // Create abort controller for this request
        abortControllerRef.current = new AbortController()

        await chatService.sendMessageStream(
          content,
          // On chunk received
          (chunk: string) => {
            updateMessage(assistantMessageId, prev => prev + chunk)
          },
          // On complete
          () => {
            setIsLoading(false)
          },
          // On error
          (errorMessage: string) => {
            setError(errorMessage)
            updateMessage(assistantMessageId, 'Sorry, I encountered an error. Please try again.')
            setIsLoading(false)
          }
        )
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        setError(errorMessage)
        updateMessage(assistantMessageId, 'Sorry, I encountered an error. Please try again.')
        setIsLoading(false)
      }
    },
    [isLoading, addMessage, updateMessage]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    stopGeneration,
  }
}
