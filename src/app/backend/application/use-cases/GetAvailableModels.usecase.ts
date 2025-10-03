// Use Case: Get Available Models
import { AIModel } from '../../domain/value-objects/AIModel.vo';
import { ModelDto } from '../dto/ChatRequest.dto';

export class GetAvailableModelsUseCase {
  private static readonly MODEL_METADATA = {
    'gemini-2.5-flash-lite': {
      name: 'Gemini 2.5 Flash Lite',
      description: 'Fastest and most efficient for simple tasks',
      isDefault: true
    },
    'gemini-2.5-flash': {
      name: 'Gemini 2.5 Flash',
      description: 'Fast and efficient for most tasks',
      isDefault: false
    },
    'gemini-2.5-pro': {
      name: 'Gemini 2.5 Pro',
      description: 'Most capable for complex reasoning and analysis',
      isDefault: false
    }
  } as const;

  async execute(): Promise<{ models: ModelDto[]; default: string }> {
    const availableModels = AIModel.getTextModels(); // Only return text models for chat
    const defaultModel = AIModel.getDefault();

    const models: ModelDto[] = availableModels.map(modelId => ({
      id: modelId,
      name: GetAvailableModelsUseCase.MODEL_METADATA[modelId as keyof typeof GetAvailableModelsUseCase.MODEL_METADATA].name,
      description: GetAvailableModelsUseCase.MODEL_METADATA[modelId as keyof typeof GetAvailableModelsUseCase.MODEL_METADATA].description,
      isDefault: GetAvailableModelsUseCase.MODEL_METADATA[modelId as keyof typeof GetAvailableModelsUseCase.MODEL_METADATA].isDefault
    }));

    return {
      models,
      default: defaultModel.getValue()
    };
  }
}