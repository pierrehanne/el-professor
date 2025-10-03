// Repository Interface: AI Repository
import { AIModel } from '../value-objects/AIModel.vo';
import { ProcessedFile } from '../../application/dto/ChatRequest.dto';

export interface GenerateContentOptions {
  model: AIModel;
  message: string;
  context?: string;
  streaming?: boolean;
  files?: ProcessedFile[];
  temperature?: number;
  topP?: number;
  systemPrompt?: string;
}

export interface GenerateContentResult {
  content: string;
  model: string;
}

export interface GenerateImageOptions {
  model: AIModel;
  prompt: string;
  aspectRatio?: '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9';
  responseModalities?: ('Text' | 'Image')[];
  inputImages?: ProcessedFile[];
  temperature?: number;
  topP?: number;
}

export interface GenerateImageResult {
  images: Array<{
    base64: string;
    mimeType?: string;
  }>;
  textResponse?: string;
  model: string;
}

export interface IAIRepository {
  generateContent(options: GenerateContentOptions): Promise<GenerateContentResult>;
  generateContentStream(
    options: GenerateContentOptions,
    onChunk: (chunk: string) => void
  ): Promise<void>;
  generateImage(options: GenerateImageOptions): Promise<GenerateImageResult>;
  isModelAvailable(model: AIModel): Promise<boolean>;
}