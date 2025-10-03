// Use Case: Generate Image
import { AIModel } from '../../domain/value-objects/AIModel.vo';
import { IAIRepository } from '../../domain/repositories/IAIRepository';
import { ImageGenerationRequestDto, ImageGenerationResponseDto, GeneratedImage } from '../dto/ImageGeneration.dto';

export class GenerateImageUseCase {
  constructor(
    private readonly aiRepository: IAIRepository
  ) {}

  async execute(request: ImageGenerationRequestDto): Promise<ImageGenerationResponseDto> {
    // Use the image generation model
    const model = AIModel.create('gemini-2.5-flash-preview-image');

    console.log('🎨 Generating image with prompt:', request.prompt);
    console.log('📐 Aspect ratio:', request.aspectRatio || '1:1');

    // Generate image using AI repository
    const aiResponse = await this.aiRepository.generateImage({
      model,
      prompt: request.prompt,
      aspectRatio: request.aspectRatio || '1:1',
      responseModalities: request.responseModalities || ['Text', 'Image'],
      inputImages: request.inputImages,
      temperature: request.temperature,
      topP: request.topP
    });

    // Process the response and create GeneratedImage objects
    const images: GeneratedImage[] = aiResponse.images.map((imageData, index) => ({
      id: `img_${Date.now()}_${index}`,
      base64: imageData.base64,
      mimeType: imageData.mimeType || 'image/png',
      aspectRatio: request.aspectRatio || '1:1',
      prompt: request.prompt,
      timestamp: Date.now()
    }));

    return {
      images,
      textResponse: aiResponse.textResponse,
      model: model.getValue()
    };
  }
}