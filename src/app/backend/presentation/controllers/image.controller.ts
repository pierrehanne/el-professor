// Image Controller - Presentation Layer (Clean Architecture)
import { NextRequest, NextResponse } from 'next/server';
import { GenerateImageUseCase } from '../../application/use-cases/GenerateImage.usecase';
import { aiRepository } from '../../infrastructure/repositories/AIRepository';
import { ImageGenerationRequestDto } from '../../application/dto/ImageGeneration.dto';
import { validateEnvConfig } from '../../infrastructure/config/environment.config';

// Validate environment on startup
validateEnvConfig();

class ImageController {
  private generateImageUseCase: GenerateImageUseCase;

  constructor() {
    this.generateImageUseCase = new GenerateImageUseCase(aiRepository);
  }

  async handleImageGeneration(request: NextRequest): Promise<NextResponse> {
    try {
      const body: ImageGenerationRequestDto = await request.json();

      if (!body.prompt?.trim()) {
        return NextResponse.json(
          { error: 'Prompt is required for image generation' },
          { status: 400 }
        );
      }

      console.log('🎨 Image generation request:', {
        prompt: body.prompt.substring(0, 100) + '...',
        aspectRatio: body.aspectRatio || '1:1',
        hasInputImages: !!(body.inputImages && body.inputImages.length > 0)
      });

      const result = await this.generateImageUseCase.execute(body);
      
      return NextResponse.json(result);

    } catch (error) {
      console.error('Image generation controller error:', error);
      
      // Handle specific error types
      const errorMessage = error instanceof Error ? error.message : 'Image generation failed';
      
      // Check for quota exceeded errors
      if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        return NextResponse.json(
          { 
            error: 'Quota exceeded for image generation',
            details: 'You have reached your daily limit for image generation. Please try again tomorrow or upgrade your plan.',
            type: 'quota_exceeded'
          },
          { status: 429 }
        );
      }
      
      // Check for model availability errors
      if (errorMessage.includes('model') && errorMessage.includes('not found')) {
        return NextResponse.json(
          { 
            error: 'Image generation model not available',
            details: 'The image generation feature may not be available in your region or account.',
            type: 'model_unavailable'
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: 'Please check your prompt and try again',
          type: 'general_error'
        },
        { status: 500 }
      );
    }
  }
}

// Export singleton instance
export const imageController = new ImageController();