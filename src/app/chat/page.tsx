'use client'

import { useChat } from '@/app/frontend/hooks/use-chat'
import { ModelSelector } from '@/app/frontend/components/ModelSelector'
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Trash2, 
  Paperclip, 
  Image, 
  FileText, 
  File,
  Menu,
  X,
  Settings,
  Sliders,
  MessageSquare,
  Home,
  Info,
  RotateCcw,
  Palette
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Typing animation component
const TypingIndicator = () => (
  <div className="flex items-center space-x-1 px-4 py-3">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  </div>
)

export default function ChatPage() {
  const [input, setInput] = useState('')

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { 
    messages, 
    isLoading, 
    selectedModel, 
    setSelectedModel, 

    temperature,
    setTemperature,
    topP,
    setTopP,
    systemPrompt,
    setSystemPrompt,
    sendMessage, 
    clearMessages 
  } = useChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput('')
    await sendMessage(message)
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">El Profesor</h1>
                <p className="text-xs text-gray-500">AI Education Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <Home className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900">Home</span>
                </Link>
                <Link href="/image" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <Palette className="w-5 h-5 text-gray-400 group-hover:text-pink-500" />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900">Image Generator</span>
                </Link>
                <button 
                  onClick={clearMessages}
                  disabled={messages.length === 0}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                  <span className="text-sm text-gray-600 group-hover:text-red-600">Clear Chat</span>
                </button>
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">AI Model</h3>
              <ModelSelector 
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                className="w-full"
              />
            </div>

            {/* Advanced Settings */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Advanced Settings</h3>
                <button
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <Sliders className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              {showAdvancedSettings && (
                <div className="space-y-4">
                  {/* Temperature Control */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-600">
                        Creativity Level
                      </label>
                      <span className="text-xs text-gray-500">{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(temperature - 0.1) / 0.9 * 100}%, #e5e7eb ${(temperature - 0.1) / 0.9 * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Focused</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  {/* Top-P Control */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-600">
                        Response Variety
                      </label>
                      <span className="text-xs text-gray-500">{topP}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={topP}
                      onChange={(e) => setTopP(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #f97316 0%, #f97316 ${(topP - 0.1) / 0.9 * 100}%, #e5e7eb ${(topP - 0.1) / 0.9 * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Narrow</span>
                      <span>Wide</span>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Quick Presets</p>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => {
                          setTemperature(0.1);
                          setTopP(0.7);
                        }}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      >
                        🎯 Factual
                      </button>
                      <button
                        onClick={() => {
                          setTemperature(0.7);
                          setTopP(0.9);
                        }}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      >
                        ⚖️ Balanced
                      </button>
                      <button
                        onClick={() => {
                          setTemperature(0.8);
                          setTopP(0.9);
                        }}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      >
                        🎨 Creative
                      </button>
                    </div>
                  </div>

                  {/* System Prompt */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-600">
                        Custom Instructions
                      </label>
                      {systemPrompt && (
                        <button
                          onClick={() => setSystemPrompt('')}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <textarea
                      value={systemPrompt}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 500) {
                          setSystemPrompt(value);
                        }
                      }}
                      placeholder="e.g., You are a helpful coding assistant. Always provide code examples..."
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400">
                        Define AI personality & behavior
                      </p>
                      <span className="text-xs text-gray-400">
                        {systemPrompt.length}/500
                      </span>
                    </div>
                    
                    {/* System Prompt Presets */}
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">Quick Templates</p>
                      <div className="space-y-1">
                        <button
                          onClick={() => setSystemPrompt('You are a helpful coding assistant. Always provide clear, well-commented code examples and explain your solutions step by step.')}
                          className="w-full text-left px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                        >
                          👨‍💻 Coding Assistant
                        </button>
                        <button
                          onClick={() => setSystemPrompt('You are an AWS cloud expert. Provide detailed explanations about AWS services, best practices, and architecture recommendations.')}
                          className="w-full text-left px-2 py-1 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 rounded transition-colors"
                        >
                          ☁️ AWS Expert
                        </button>
                        <button
                          onClick={() => setSystemPrompt('You are a patient teacher. Break down complex topics into simple, easy-to-understand explanations with examples.')}
                          className="w-full text-left px-2 py-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded transition-colors"
                        >
                          🎓 Patient Teacher
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Chat Statistics</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Messages:</span>
                  <span>{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Model:</span>
                  <span className="truncate ml-2">
                    {selectedModel.includes('lite') ? '⚡ Flash Lite' : 
                     selectedModel.includes('pro') ? '🧠 Pro' : '✨ Flash'}
                  </span>
                </div>
                {systemPrompt && (
                  <div className="flex justify-between">
                    <span>Custom Instructions:</span>
                    <span className="text-purple-600">🎯 Active</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold gradient-text">El Profesor</span>
          </div>
          <div className="w-10"></div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col bg-white min-h-0">
          {/* Messages Area - This will scroll */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto w-full space-y-6">
              {/* Clean empty state - no welcome message */}

              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-2xl ${message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                      }`}
                  >
                    {message.role === 'user' ? (
                      <div>
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        {message.model && (
                          <div className="flex items-center space-x-1 mb-2 text-xs text-gray-400">
                            <span>
                              {message.model.includes('lite') ? '⚡' : message.model.includes('pro') ? '🧠' : '✨'}
                            </span>
                            <span>
                              {message.model.includes('lite') ? 'Flash Lite' : 
                               message.model.includes('pro') ? 'Pro' : 'Flash'}
                            </span>
                          </div>
                        )}
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-gray-900">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-gray-900">{children}</h3>,
                            p: ({ children }) => <p className="mb-2 leading-relaxed text-gray-900">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-gray-900">{children}</li>,
                            code: ({ children, className }) => {
                              const isInline = !className
                              return isInline ? (
                                <code className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                                  {children}
                                </code>
                              ) : (
                                <code className="block bg-gray-200 p-3 rounded-lg text-sm font-mono text-gray-800 overflow-x-auto">
                                  {children}
                                </code>
                              )
                            },
                            pre: ({ children }) => <div className="mb-2">{children}</div>,
                            strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                            em: ({ children }) => <em className="italic text-gray-900">{children}</em>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl">
                    <TypingIndicator />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - This stays fixed */}
          <div className="border-t border-gray-200 bg-white p-6 flex-shrink-0">
            <div className="max-w-4xl mx-auto w-full">
              <form onSubmit={handleSubmit} className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-xl hover:from-purple-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>

              <div className="flex items-center justify-center mt-4">
                <p className="text-xs text-gray-400">
                  El Profesor can make mistakes. Please verify important information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}