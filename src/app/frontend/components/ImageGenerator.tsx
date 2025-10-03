'use client'

import { useState } from 'react';
import { useImageGeneration } from '../hooks/use-image-generation';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Settings,
  X
} from 'lucide-react';

const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square (1:1)', resolution: '1024×1024' },
  { value: '16:9', label: 'Landscape (16:9)', resolution: '1344×768' },
  { value: '9:16', label: 'Portrait (9:16)', resolution: '768×1344' },
  { value: '4:3', label: 'Standard (4:3)', resolution: '1184×864' },
  { value: '3:4', label: 'Portrait (3:4)', resolution: '864×1184' },
  { value: '21:9', label: 'Ultrawide (21:9)', resolution: '1536×672' },
] as const;

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<typeof ASPECT_RATIOS[number]['value']>('1:1');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  
  const {
    generateImage,
    isGenerating,
    generatedImages,
    lastTextResponse,
    error,
    errorType,
    clearImages,
    clearError
  } = useImageGeneration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    await generateImage({
      prompt: prompt.trim(),
      aspectRatio,
      temperature,
      topP,
      responseModalities: ['Text', 'Image']
    });
  };

  const downloadImage = (image: any) => {
    const link = document.createElement('a');
    link.href = `data:${image.mimeType};base64,${image.base64}`;
    link.download = `el-profesor-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async (image: any) => {
    try {
      const response = await fetch(`data:${image.mimeType};base64,${image.base64}`);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">AI Image Generator</h1>
            <p className="text-gray-600">Create stunning images with Gemini 2.5 Flash Image</p>
          </div>
        </div>
      </div>

      {/* Generation Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your image
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A photorealistic close-up portrait of a wise owl wearing tiny glasses, sitting in a cozy library filled with ancient books..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500 mt-1">
              Be descriptive! Include details about style, lighting, composition, and mood.
            </p>
          </div>

          {/* Aspect Ratio Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.value}
                  type="button"
                  onClick={() => setAspectRatio(ratio.value)}
                  className={`p-3 rounded-lg border text-sm transition-all ${
                    aspectRatio === ratio.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isGenerating}
                >
                  <div className="font-medium">{ratio.label}</div>
                  <div className="text-xs text-gray-500">{ratio.resolution}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Advanced Settings</span>
            </button>
            
            {showAdvanced && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                {/* Temperature */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-600">
                      Creativity Level
                    </label>
                    <span className="text-sm text-gray-500">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={isGenerating}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Focused</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Top-P */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-600">
                      Response Variety
                    </label>
                    <span className="text-sm text-gray-500">{topP}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={isGenerating}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Narrow</span>
                    <span>Wide</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Image...</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5" />
                <span>Generate Image</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`rounded-xl p-4 flex items-start space-x-3 ${
          errorType === 'quota_exceeded' 
            ? 'bg-yellow-50 border border-yellow-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            errorType === 'quota_exceeded' ? 'text-yellow-500' : 'text-red-500'
          }`} />
          <div className="flex-1">
            <p className={`font-medium ${
              errorType === 'quota_exceeded' ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {errorType === 'quota_exceeded' ? 'Quota Exceeded' : 
               errorType === 'model_unavailable' ? 'Service Unavailable' : 
               'Generation Failed'}
            </p>
            <p className={`text-sm mt-1 ${
              errorType === 'quota_exceeded' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {error}
            </p>
            {errorType === 'quota_exceeded' && (
              <div className="mt-3 text-xs text-yellow-700">
                <p>💡 <strong>Tips to continue:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Wait until tomorrow for quota reset</li>
                  <li>Consider upgrading to a paid plan</li>
                  <li>Use the regular chat feature instead</li>
                </ul>
              </div>
            )}
          </div>
          <button
            onClick={clearError}
            className={`hover:transition-colors ${
              errorType === 'quota_exceeded' 
                ? 'text-yellow-400 hover:text-yellow-600' 
                : 'text-red-400 hover:text-red-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Text Response */}
      {lastTextResponse && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-800 mb-2">AI Response</h3>
          <p className="text-blue-700 text-sm">{lastTextResponse}</p>
        </div>
      )}

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Generated Images</h2>
            <button
              onClick={clearImages}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Clear All</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedImages.map((image) => (
              <div key={image.id} className="group relative">
                <div className="relative overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={`data:${image.mimeType};base64,${image.base64}`}
                    alt={image.prompt}
                    className="w-full h-auto object-cover"
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => downloadImage(image)}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(image)}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>
                
                {/* Image info */}
                <div className="mt-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{image.prompt}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>{image.aspectRatio}</span>
                    <span>{new Date(image.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}