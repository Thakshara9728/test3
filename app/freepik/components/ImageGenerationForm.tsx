'use client';

import { useState } from 'react';

interface ImageGenerationFormProps {
  onGenerate: (prompt: string, aspectRatio: string, negativePrompt?: string) => void;
  loading: boolean;
}

const aspectRatios = [
  { value: '1:1', label: '1:1 (Square)', icon: '⬜' },
  { value: '16:9', label: '16:9 (Landscape)', icon: '▭' },
  { value: '9:16', label: '9:16 (Portrait)', icon: '▯' },
  { value: '4:3', label: '4:3 (Classic)', icon: '▬' },
  { value: '3:4', label: '3:4 (Portrait)', icon: '▮' },
];

const examplePrompts = [
  'A serene mountain landscape at sunset with vibrant colors',
  'Futuristic city skyline with neon lights and flying cars',
  'Cute cartoon robot playing with a puppy in a garden',
  'Abstract geometric pattern with bold colors and gradients',
  'Professional product photography of a luxury watch',
];

export default function ImageGenerationForm({ onGenerate, loading }: ImageGenerationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate(prompt, aspectRatio, negativePrompt || undefined);
  };

  const useExamplePrompt = (example: string) => {
    setPrompt(example);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Main Prompt */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          What do you want to create?
        </label>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your image in detail... (e.g., A peaceful beach at sunset with palm trees and golden sand)"
              className="w-full px-6 py-4 text-base rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              rows={4}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Example Prompts */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 mr-2">Examples:</span>
          {examplePrompts.slice(0, 3).map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => useExamplePrompt(example)}
              disabled={loading}
              className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-full transition-colors disabled:opacity-50"
            >
              {example.substring(0, 30)}...
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.value}
              type="button"
              onClick={() => setAspectRatio(ratio.value)}
              disabled={loading}
              className={`relative px-4 py-3 rounded-xl border-2 transition-all ${
                aspectRatio === ratio.value
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-700'
              } disabled:opacity-50`}
            >
              <div className="text-2xl mb-1">{ratio.icon}</div>
              <div className="text-xs font-medium">{ratio.value}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Negative Prompt (Optional)
            </label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="What to avoid in the image (e.g., blurry, distorted, low quality)"
              className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Describe elements you don't want to see in the generated image
            </p>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        type="submit"
        disabled={loading || !prompt.trim()}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-pink-600 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Generating...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Images
          </>
        )}
      </button>
    </form>
  );
}
