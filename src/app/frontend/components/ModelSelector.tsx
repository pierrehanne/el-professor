'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Zap, Brain, Sparkles } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

const MODEL_ICONS = {
  'gemini-2.5-flash-lite': Zap,
  'gemini-2.5-flash': Sparkles,
  'gemini-2.5-pro': Brain,
};

const MODEL_COLORS = {
  'gemini-2.5-flash-lite': 'text-green-600 bg-green-50',
  'gemini-2.5-flash': 'text-blue-600 bg-blue-50',
  'gemini-2.5-pro': 'text-purple-600 bg-purple-50',
};

export function ModelSelector({ selectedModel, onModelChange, className = '' }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/chat/models');
      if (response.ok) {
        const data = await response.json();
        setModels(data.models);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      // Fallback to default models
      setModels([
        {
          id: 'gemini-2.5-flash-lite',
          name: 'Flash Lite',
          description: 'Fastest & most efficient',
          isDefault: true
        },
        {
          id: 'gemini-2.5-flash',
          name: 'Flash',
          description: 'Balanced performance',
          isDefault: false
        },
        {
          id: 'gemini-2.5-pro',
          name: 'Pro',
          description: 'Most capable',
          isDefault: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const selectedModelData = models.find(m => m.id === selectedModel);
  const SelectedIcon = selectedModelData ? MODEL_ICONS[selectedModelData.id as keyof typeof MODEL_ICONS] : Sparkles;

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg h-8 w-24 ${className}`}></div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${MODEL_COLORS[selectedModel as keyof typeof MODEL_COLORS] || 'text-gray-600 bg-gray-50'}`}>
          <SelectedIcon className="w-3 h-3" />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {selectedModelData?.name || 'Flash Lite'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">
                Choose AI Model
              </div>
              {models.map((model) => {
                const Icon = MODEL_ICONS[model.id as keyof typeof MODEL_ICONS] || Sparkles;
                const isSelected = model.id === selectedModel;
                
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onModelChange(model.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md text-left transition-colors ${
                      isSelected 
                        ? 'bg-purple-50 text-purple-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isSelected 
                        ? 'bg-purple-100 text-purple-600' 
                        : MODEL_COLORS[model.id as keyof typeof MODEL_COLORS] || 'text-gray-600 bg-gray-50'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{model.name}</span>
                        {isSelected && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {model.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-100 px-3 py-2 bg-gray-50">
              <div className="text-xs text-gray-500">
                💡 Pro models are more capable but slower
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Compact version for mobile
export function CompactModelSelector({ selectedModel, onModelChange, className = '' }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/chat/models');
      if (response.ok) {
        const data = await response.json();
        setModels(data.models);
      }
    } catch (error) {
      setModels([
        { id: 'gemini-2.5-flash-lite', name: 'Lite', description: 'Fastest', isDefault: true },
        { id: 'gemini-2.5-flash', name: 'Flash', description: 'Balanced', isDefault: false },
        { id: 'gemini-2.5-pro', name: 'Pro', description: 'Most capable', isDefault: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={`animate-pulse bg-gray-200 rounded h-6 w-16 ${className}`}></div>;
  }

  return (
    <select
      value={selectedModel}
      onChange={(e) => onModelChange(e.target.value)}
      className={`text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500 ${className}`}
    >
      {models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  );
}