import { NextRequest } from 'next/server'
import { imageController } from '@/app/backend/presentation/controllers/image.controller'

export async function POST(request: NextRequest) {
  return imageController.handleImageGeneration(request)
}