// AI Repository Implementation
import { GoogleGenAI } from '@google/genai';
import { IAIRepository, GenerateContentOptions, GenerateContentResult, GenerateImageOptions, GenerateImageResult } from '../../domain/repositories/IAIRepository';
import { envConfig } from '../config/environment.config';

export class AIRepository implements IAIRepository {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: envConfig.googleApiKey!,
    });
  }

  async generateContent(options: GenerateContentOptions): Promise<GenerateContentResult> {
    try {
      console.log('🤖 Generating content with model:', options.model.getValue());
      console.log('📝 Message:', options.message);

      if (options.files && options.files.length > 0) {
        console.log('📎 Processing', options.files.length, 'files');
      }

      const parts = this.buildContentParts(options.message, options.files);

      console.log('🌡️ Temperature:', options.temperature ?? 0.7, 'TopP:', options.topP ?? 0.9);

      const config: any = {
        temperature: options.temperature ?? 0.7,
        topP: options.topP ?? 0.9,
      };

      if (options.systemPrompt) {
        config.systemInstruction = options.systemPrompt;
        console.log('🎯 Using system prompt:', options.systemPrompt.substring(0, 100) + '...');
      }

      const response = await this.ai.models.generateContent({
        model: options.model.getValue(),
        contents: [{
          role: 'user',
          parts
        }],
        config
      });

      const content = response.text || 'Sorry, I could not generate a response.';
      console.log('✅ Generated response:', content.substring(0, 100) + '...');

      return {
        content,
        model: options.model.getValue()
      };
    } catch (error) {
      console.error('❌ AI Repository Error:', error);
      return {
        content: 'Sorry, I encountered an error. Please try again.',
        model: options.model.getValue()
      };
    }
  }

  async generateContentStream(
    options: GenerateContentOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      console.log('🔄 Streaming content with model:', options.model.getValue());

      if (options.files && options.files.length > 0) {
        console.log('📎 Processing', options.files.length, 'files for streaming');
      }

      const parts = this.buildContentParts(options.message, options.files);

      console.log('🌡️ Temperature:', options.temperature ?? 0.7, 'TopP:', options.topP ?? 0.9);

      const config: any = {
        temperature: options.temperature ?? 0.7,
        topP: options.topP ?? 0.9,
      };

      if (options.systemPrompt) {
        config.systemInstruction = options.systemPrompt;
        console.log('🎯 Using system prompt for streaming:', options.systemPrompt.substring(0, 100) + '...');
      }

      const response = await this.ai.models.generateContentStream({
        model: options.model.getValue(),
        contents: [{
          role: 'user',
          parts
        }],
        config
      });

      let fullText = '';
      for await (const chunk of response) {
        if (chunk.text) {
          fullText += chunk.text;
          onChunk(chunk.text);
        }
      }

      console.log('✅ Streaming completed. Total length:', fullText.length);
    } catch (error) {
      console.error('❌ AI Repository Streaming Error:', error);
      onChunk('Sorry, I encountered an error. Please try again.');
    }
  }

  private buildContentParts(message: string, files?: any[]): any[] {
    const parts: any[] = [];

    // Add the main message first
    if (message.trim()) {
      parts.push({ text: message });
    }

    if (files && files.length > 0) {
      console.log('📎 Building content parts for', files.length, 'files');

      for (const file of files) {
        if (file.base64 && file.mimeType.startsWith('image/')) {
          // Add image parts for Gemini - images should come after text
          console.log('🖼️ Adding image:', file.name, file.mimeType);
          parts.push({
            inlineData: {
              mimeType: file.mimeType,
              data: file.base64
            }
          });
        } else if (file.content) {
          // Add text content
          console.log('📄 Adding text content:', file.name);
          parts.push({
            text: `\n\n--- Content from ${file.name} ---\n${file.content}\n--- End of ${file.name} ---\n`
          });
        } else if (file.base64 && file.mimeType === 'application/pdf') {
          // For PDFs, add a note that it's attached (Gemini doesn't directly support PDF)
          console.log('📋 Adding PDF reference:', file.name);
          parts.push({
            text: `\n\n[PDF file attached: ${file.name} (${this.formatFileSize(file.size)})]\nNote: Please analyze this PDF document.\n`
          });
        }
      }
    }

    // Ensure we always have at least one text part
    if (parts.length === 0) {
      parts.push({ text: message || 'Please help me with the uploaded content.' });
    }

    return parts;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
    try {
      console.log('🎨 Generating image with model:', options.model.getValue());
      console.log('📝 Prompt:', options.prompt);
      console.log('📐 Aspect ratio:', options.aspectRatio || '1:1');

      // Check if the model is available
      const modelName = options.model.getValue();
      console.log('🔍 Checking model availability:', modelName);

      const parts: any[] = [];

      // Add the main prompt
      parts.push({ text: options.prompt });

      // Add input images if provided (for image editing)
      if (options.inputImages && options.inputImages.length > 0) {
        console.log('🖼️ Processing', options.inputImages.length, 'input images for editing');

        for (const file of options.inputImages) {
          if (file.base64 && file.mimeType.startsWith('image/')) {
            parts.push({
              inlineData: {
                mimeType: file.mimeType,
                data: file.base64
              }
            });
          }
        }
      }

      // Build the generation config
      const config: any = {};

      if (options.responseModalities) {
        config.responseModalities = options.responseModalities;
      }

      if (options.aspectRatio) {
        config.imageConfig = {
          aspectRatio: options.aspectRatio
        };
      }

      console.log('🔧 Generation config:', config);

      const response = await this.ai.models.generateContent({
        model: options.model.getValue(),
        contents: [{
          role: 'user',
          parts
        }],
        config
      });

      const images: Array<{ base64: string; mimeType?: string }> = [];
      let textResponse: string | undefined;

      // Process the response parts
      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];

        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.text) {
              textResponse = part.text;
              console.log('📝 Generated text response:', part.text.substring(0, 100) + '...');
            } else if (part.inlineData && part.inlineData.data) {
              images.push({
                base64: part.inlineData.data,
                mimeType: part.inlineData.mimeType || 'image/png'
              });
              console.log('🖼️ Generated image:', part.inlineData.mimeType);
            }
          }
        }
      }

      if (images.length === 0 && !textResponse) {
        throw new Error('No images or text generated in response');
      }

      console.log('✅ Image generation completed:', images.length, 'images generated');

      return {
        images,
        textResponse,
        model: options.model.getValue()
      };
    } catch (error) {
      console.error('❌ AI Repository Image Generation Error:', error);
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isModelAvailable(model: any): Promise<boolean> {
    // For now, assume all models in our domain are available
    // In a real implementation, you might check with the AI service
    return true;
  }
}

// Export repository instance
export const aiRepository = new AIRepository();
