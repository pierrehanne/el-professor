// Enhanced chat hook with model selection and MCP integration
'use client';

import { useState, useCallback } from 'react';

export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    model?: string;
    toolUsed?: {
        tool: string;
        reasoning: string;
    };
    hasContext?: boolean;
}

export interface ChatOptions {
    model?: string;
    useStreaming?: boolean;
    useMCPTools?: boolean;
}

export function useEnhancedChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentResponse, setCurrentResponse] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    const sendMessage = useCallback(async (
        content: string,
        options: ChatOptions = {}
    ) => {
        const {
            model = 'gemini-2.5-flash-lite',
            useStreaming = true,
            useMCPTools = true
        } = options;

        // Add user message
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content,
            role: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);
        setCurrentResponse('');

        try {
            if (useStreaming) {
                await handleStreamingResponse(content, model, useMCPTools, userMessage.id);
            } else {
                await handleDirectResponse(content, model, useMCPTools, userMessage.id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
        }
    }, []);

    const handleStreamingResponse = async (
        content: string,
        model: string,
        useMCPTools: boolean,
        userMessageId: string
    ) => {
        setIsStreaming(true);

        const response = await fetch('/api/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: content,
                model,
                useStreaming: true,
                useMCPTools
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response stream');
        }

        let assistantMessage: ChatMessage = {
            id: `${userMessageId}-response`,
            content: '',
            role: 'assistant',
            timestamp: new Date(),
            model
        };

        let mcpContent = '';
        let aiContent = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            switch (data.type) {
                                case 'tool_usage':
                                    assistantMessage.toolUsed = {
                                        tool: data.tool,
                                        reasoning: data.reasoning
                                    };
                                    break;

                                case 'mcp_chunk':
                                    mcpContent += data.content;
                                    setCurrentResponse(mcpContent + aiContent);
                                    break;

                                case 'ai_chunk':
                                    aiContent += data.content;
                                    setCurrentResponse(mcpContent + aiContent);
                                    break;

                                case 'complete':
                                    assistantMessage.content = mcpContent + aiContent;
                                    assistantMessage.hasContext = !!mcpContent;
                                    setMessages(prev => [...prev, assistantMessage]);
                                    setCurrentResponse('');
                                    return;

                                case 'error':
                                    throw new Error(data.error);
                            }
                        } catch (parseError) {
                            console.warn('Failed to parse SSE data:', parseError);
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    };

    const handleDirectResponse = async (
        content: string,
        model: string,
        useMCPTools: boolean,
        userMessageId: string
    ) => {
        const response = await fetch('/api/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: content,
                model,
                useStreaming: false,
                useMCPTools
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        const data = await response.json();

        const assistantMessage: ChatMessage = {
            id: `${userMessageId}-response`,
            content: data.response,
            role: 'assistant',
            timestamp: new Date(),
            model: data.model,
            toolUsed: data.toolUsed,
            hasContext: data.hasContext
        };

        setMessages(prev => [...prev, assistantMessage]);
    };

    const clearMessages = useCallback(() => {
        setMessages([]);
        setCurrentResponse('');
        setError(null);
    }, []);

    const stopGeneration = useCallback(() => {
        setIsLoading(false);
        setIsStreaming(false);
        setCurrentResponse('');
    }, []);

    return {
        messages,
        isLoading,
        isStreaming,
        error,
        currentResponse,
        sendMessage,
        clearMessages,
        stopGeneration
    };
}