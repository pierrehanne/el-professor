'use client'

import { ArrowRight, Cloud, Code, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {/* Clean Header */}
      <header className="flex items-center justify-between p-6 max-w-6xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">El Profesor</h1>
            <p className="text-sm text-gray-500">AI Education Assistant</p>
          </div>
        </div>

        <nav className="flex items-center space-x-6">
          <div className="relative group">
            <div className="flex items-center space-x-2 text-orange-500 cursor-pointer">
              <Cloud className="w-4 h-4" />
              <span className="text-sm font-medium">AWS</span>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Enhanced with AWS MCP servers
            </div>
          </div>
          <div className="relative group">
            <div className="flex items-center space-x-2 text-purple-600 cursor-pointer">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Terraform</span>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Powered by Terraform MCP servers
            </div>
          </div>
          <div className="relative group">
            <div className="flex items-center space-x-2 text-green-500 cursor-pointer">
              <Code className="w-4 h-4" />
              <span className="text-sm font-medium">Programming</span>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Connected to programming MCP servers
            </div>
          </div>
          <Link href="/chat">
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              Get Started
            </button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        {/* AI Badge */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Advanced AI</span>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-20">
          <h1 className="text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Master <span className="gradient-text">Cloud & Code</span>
            <br />
            with AI Guidance
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Your personal AI tutor for AWS, Terraform, and programming.
            Get instant answers and accelerate your tech career.
          </p>

          <div className="flex justify-center">
            <Link href="/chat">
              <button className="flex items-center space-x-2 purple-orange text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl">
                <span>Start Learning Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>


      </main>
    </div>
  )
}