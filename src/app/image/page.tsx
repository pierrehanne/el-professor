'use client'

import { ImageGenerator } from '@/app/frontend/components/ImageGenerator'
import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

export default function ImagePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/chat"
                className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                Chat Assistant
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        <ImageGenerator />
      </main>
    </div>
  )
}