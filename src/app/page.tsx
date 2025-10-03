'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {/* Simple Header - Logo Only */}
      <header className="flex justify-center p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">El Profesor</h1>
            <p className="text-sm text-gray-500">AI Education Assistant</p>
          </div>
        </div>
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

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/chat">
              <button className="flex items-center space-x-2 purple-orange text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl">
                <span>Start Learning Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/image">
              <button className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl">
                <Sparkles className="w-5 h-5" />
                <span>Generate Images</span>
              </button>
            </Link>
          </div>
        </div>


      </main>
    </div>
  )
}