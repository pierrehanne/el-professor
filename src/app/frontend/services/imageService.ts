// Image Generation Service
import { ImageGenerationRequestDto, ImageGenerationResponseDto } from '@/app/backend/application/dto/ImageGeneration.dto';

export class ImageService {
  static async generateImage(request: ImageGenerationRequestDto): Promise<ImageGenerationResponseDto> {
    try {
      console.log('🎨 Sending image generation request:', {
        prompt: request.prompt.substring(0, 100) + '...',
        aspectRatio: request.aspectRatio || '1:1'
      });

      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: ImageGenerationResponseDto = await response.json();
      
      console.log('✅ Image generation successful:', {
        imageCount: result.images.length,
        hasTextResponse: !!result.textResponse
      });

      return result;
    } catch (error) {
      console.error('❌ Image generation service error:', error);
      throw error;
    }
  }
}