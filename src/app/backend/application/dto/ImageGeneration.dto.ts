// Data Transfer Object: Image Generation
export interface ImageGenerationRequestDto {
  prompt: string;
  model?: string;
  aspectRatio?: '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9';
  responseModalities?: ('Text' | 'Image')[];
  inputImages?: ProcessedFile[]; // For image editing
  temperature?: number;
  topP?: number;
}

export interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  base64?: string;
  mimeType: string;
}

export interface ImageGenerationResponseDto {
  images: GeneratedImage[];
  textResponse?: string;
  model: string;
}

export interface GeneratedImage {
  id: string;
  base64: string;
  mimeType: string;
  aspectRatio: string;
  prompt: string;
  timestamp: number;
}