// API route to get available Gemini models
import { NextRequest } from 'next/server';
import { chatController } from '@/app/backend/presentation/controllers/chat.controller';

export async function GET(request: NextRequest) {
  return chatController.getAvailableModels();
}