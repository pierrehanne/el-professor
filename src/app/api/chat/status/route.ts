// API route to get MCP server status
import { NextRequest } from 'next/server';
import { chatController } from '@/app/backend/presentation/controllers/chat.controller';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const model = searchParams.get('model') as any;
  
  return chatController.getMCPStatus(model);
}