// Value Object: AI Model
export class AIModel {
  private static readonly VALID_MODELS = [
    // text
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    // image
    'gemini-2.5-flash-preview-image',
    'gemini-2.5-flash-image',

  ] as const;

  constructor(private readonly value: string) {
    if (!AIModel.isValid(value)) {
      throw new Error(`Invalid AI model: ${value}`);
    }
  }

  static create(value: string): AIModel {
    return new AIModel(value);
  }

  static isValid(value: string): boolean {
    return AIModel.VALID_MODELS.includes(value as any);
  }

  static getDefault(): AIModel {
    return new AIModel('gemini-2.5-flash-lite');
  }

  static getAllModels(): readonly string[] {
    return AIModel.VALID_MODELS;
  }

  static getTextModels(): readonly string[] {
    return AIModel.VALID_MODELS.filter(model => !model.includes('image'));
  }

  static getImageModels(): readonly string[] {
    return AIModel.VALID_MODELS.filter(model => model.includes('image'));
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AIModel): boolean {
    return this.value === other.value;
  }

  isFlash(): boolean {
    return this.value.includes('flash');
  }

  isPro(): boolean {
    return this.value.includes('pro');
  }

  isLite(): boolean {
    return this.value.includes('lite');
  }

  isImageModel(): boolean {
    return this.value === 'gemini-2.5-flash-preview-image';
  }

  toString(): string {
    return this.value;
  }
}