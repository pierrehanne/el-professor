import { NextRequest } from 'next/server'
import { chatController } from '@/app/backend/controllers/chat-controller'

export async function POST(request: NextRequest) {
  return chatController.handleChatMessage(request)
}
