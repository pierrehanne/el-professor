// Hook: Image Generation
import { useState } from 'react';
import { ImageService } from '../services/imageService';
import { ImageGenerationRequestDto, GeneratedImage } from '@/app/backend/application/dto/ImageGeneration.dto';

export interface UseImageGenerationReturn {
  generateImage: (request: ImageGenerationRequestDto) => Promise<void>;
  isGenerating: boolean;
  generatedImages: GeneratedImage[];
  lastTextResponse: string | null;
  error: string | null;
  errorType: string | null;
  clearImages: () => void;
  clearError: () => void;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [lastTextResponse, setLastTextResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);

  const generateImage = async (request: ImageGenerationRequestDto) => {
    try {
      setIsGenerating(true);
      setError(null);
      setErrorType(null);
      
      const response = await ImageService.generateImage(request);
      
      // Add new images to the beginning of the array
      setGeneratedImages(prev => [...response.images, ...prev]);
      setLastTextResponse(response.textResponse || null);
      
    } catch (err) {
      let errorMessage = 'Failed to generate image';
      let errorType = 'general_error';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Parse error response if it's a structured error
        try {
          const errorData = JSON.parse(err.message);
          if (errorData.error) {
            errorMessage = errorData.error;
            errorType = errorData.type || 'general_error';
          }
        } catch {
          // If parsing fails, use the original error message
          if (err.message.includes('quota') || err.message.includes('429')) {
            errorType = 'quota_exceeded';
            errorMessage = 'Daily image generation limit reached. Please try again tomorrow or upgrade your plan.';
          } else if (err.message.includes('model') || err.message.includes('503')) {
            errorType = 'model_unavailable';
            errorMessage = 'Image generation is not available in your region or account.';
          }
        }
      }
      
      setError(errorMessage);
      setErrorType(errorType);
      console.error('Image generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearImages = () => {
    setGeneratedImages([]);
    setLastTextResponse(null);
  };

  const clearError = () => {
    setError(null);
    setErrorType(null);
  };

  return {
    generateImage,
    isGenerating,
    generatedImages,
    lastTextResponse,
    error,
    errorType,
    clearImages,
    clearError
  };
}