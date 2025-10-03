'use client';

import { useState } from 'react';
import { Settings, X, Info, RotateCcw } from 'lucide-react';
import { ModelSelector } from './ModelSelector';

interface ChatSettingsProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  temperature?: number;
  topP?: number;
  onTemperatureChange?: (temperature: number) => void;
  onTopPChange?: (topP: number) => void;
}

export function ChatSettings({ 
  selectedModel, 
  onModelChange,
  temperature = 0.7,
  topP = 0.9,
  onTemperatureChange,
  onTopPChange
}: ChatSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
        title="Chat Settings"
      >
        <Settings className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:block">Settings</span>
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Chat Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  AI Model
                </label>
                <ModelSelector 
                  selectedModel={selectedModel}
                  onModelChange={onModelChange}
                  className="w-full"
                />
              </div>

              {/* Model Information */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Model Comparison</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>⚡ Flash Lite:</span>
                    <span>Fastest, most efficient</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✨ Flash:</span>
                    <span>Balanced performance</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🧠 Pro:</span>
                    <span>Most capable, slower</span>
                  </div>
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center space-x-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
                </button>
              </div>

              {/* Advanced Settings */}
              {showAdvanced && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  {/* Temperature Control */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Creativity Level (Temperature)
                      </label>
                      <div className="group relative">
                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-10">
                          <div className="font-medium mb-1">What is Temperature?</div>
                          <div>Controls how creative or predictable the AI responses are:</div>
                          <div className="mt-1">
                            • <strong>Low (0.1-0.3):</strong> More focused, consistent, factual<br/>
                            • <strong>Medium (0.4-0.7):</strong> Balanced creativity and accuracy<br/>
                            • <strong>High (0.8-1.0):</strong> More creative, varied, experimental
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => onTemperatureChange?.(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(temperature - 0.1) / 0.9 * 100}%, #e5e7eb ${(temperature - 0.1) / 0.9 * 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Focused (0.1)</span>
                        <span className="font-medium text-gray-700">{temperature}</span>
                        <span>Creative (1.0)</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {temperature <= 0.3 && "🎯 Focused: More predictable and factual responses"}
                        {temperature > 0.3 && temperature <= 0.7 && "⚖️ Balanced: Good mix of accuracy and creativity"}
                        {temperature > 0.7 && "🎨 Creative: More varied and experimental responses"}
                      </div>
                    </div>
                  </div>

                  {/* Top-P Control */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Response Variety (Top-P)
                      </label>
                      <div className="group relative">
                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-10">
                          <div className="font-medium mb-1">What is Top-P?</div>
                          <div>Controls the range of words the AI considers:</div>
                          <div className="mt-1">
                            • <strong>Low (0.1-0.5):</strong> Uses only the most likely words<br/>
                            • <strong>Medium (0.6-0.8):</strong> Balanced word selection<br/>
                            • <strong>High (0.9-1.0):</strong> Considers more word options
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={topP}
                        onChange={(e) => onTopPChange?.(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #f97316 0%, #f97316 ${(topP - 0.1) / 0.9 * 100}%, #e5e7eb ${(topP - 0.1) / 0.9 * 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Narrow (0.1)</span>
                        <span className="font-medium text-gray-700">{topP}</span>
                        <span>Wide (1.0)</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {topP <= 0.5 && "🔍 Narrow: Uses only the most confident word choices"}
                        {topP > 0.5 && topP <= 0.8 && "📊 Balanced: Good variety while staying relevant"}
                        {topP > 0.8 && "🌈 Wide: Considers many word options for variety"}
                      </div>
                    </div>
                  </div>

                  {/* Reset to Defaults */}
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => {
                        onTemperatureChange?.(0.7);
                        onTopPChange?.(0.9);
                      }}
                      className="flex items-center space-x-2 px-3 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Defaults</span>
                    </button>
                  </div>

                  {/* Presets */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-700 mb-2">Quick Presets</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          onTemperatureChange?.(0.1);
                          onTopPChange?.(0.7);
                        }}
                        className="px-2 py-1 text-xs bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                      >
                        🎯 Factual
                      </button>
                      <button
                        onClick={() => {
                          onTemperatureChange?.(0.7);
                          onTopPChange?.(0.9);
                        }}
                        className="px-2 py-1 text-xs bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                      >
                        ⚖️ Balanced
                      </button>
                      <button
                        onClick={() => {
                          onTemperatureChange?.(0.8);
                          onTopPChange?.(0.9);
                        }}
                        className="px-2 py-1 text-xs bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                      >
                        🎨 Creative
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Settings (Future) */}
              <div className="bg-green-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-green-700 mb-1">✅ Available Now</h3>
                <p className="text-xs text-green-600">
                  • File upload and analysis<br/>
                  • Model selection<br/>
                  • Temperature and Top-P control
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}