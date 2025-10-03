// Model selector component for the chat interface
'use client';

import { useModels } from '../hooks/useModels.hook';
import { useMCPStatus } from '../hooks/useMcpStatus.hook';

interface ModelSelectorProps {
  onModelChange?: (modelId: string) => void;
  className?: string;
}

export function ModelSelector({ onModelChange, className = '' }: ModelSelectorProps) {
  const { models, selectedModel, changeModel, loading: modelsLoading } = useModels();
  const { status, loading: statusLoading } = useMCPStatus(selectedModel);

  const handleModelChange = (modelId: string) => {
    changeModel(modelId);
    onModelChange?.(modelId);
  };

  if (modelsLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Model Selection */}
      <div>
        <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-2">
          AI Model
        </label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => handleModelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        
        {/* Model Description */}
        {selectedModel && (
          <p className="mt-1 text-sm text-gray-500">
            {models.find(m => m.id === selectedModel)?.description}
          </p>
        )}
      </div>

      {/* MCP Status */}
      {!statusLoading && status && (
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">MCP Status</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Servers:</span>
              <span className="font-medium">{status.servers.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Available Tools:</span>
              <span className="font-medium">{status.tools.length}</span>
            </div>
            
            {/* Server Types */}
            <div className="pt-2 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium text-blue-600">
                    {status.servers.filter(s => s.info.type === 'http').length}
                  </div>
                  <div className="text-gray-500">HTTP</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-600">
                    {status.servers.filter(s => s.info.type === 'sse').length}
                  </div>
                  <div className="text-gray-500">SSE</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-purple-600">
                    {status.servers.filter(s => s.info.type === 'stdio').length}
                  </div>
                  <div className="text-gray-500">STDIO</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {statusLoading && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for inline use
export function CompactModelSelector({ onModelChange, className = '' }: ModelSelectorProps) {
  const { models, selectedModel, changeModel, loading } = useModels();

  if (loading) {
    return <div className={`h-8 w-32 bg-gray-200 rounded animate-pulse ${className}`}></div>;
  }

  return (
    <select
      value={selectedModel}
      onChange={(e) => {
        changeModel(e.target.value);
        onModelChange?.(e.target.value);
      }}
      className={`px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
    >
      {models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  );
}