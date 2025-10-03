// Hook for managing Gemini model selection
'use client';

import { useState, useEffect } from 'react';

export interface AvailableModel {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
}

export function useModels() {
  const [models, setModels] = useState<AvailableModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/models');
      
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      
      const data = await response.json();
      setModels(data.models);
      setSelectedModel(data.default);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const changeModel = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(modelId);
    }
  };

  const getSelectedModel = () => {
    return models.find(m => m.id === selectedModel);
  };

  return {
    models,
    selectedModel,
    changeModel,
    getSelectedModel,
    loading,
    error,
    refetch: fetchModels
  };
}