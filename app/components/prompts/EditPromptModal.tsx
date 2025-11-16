'use client';

import { updatePrompt } from '@/app/actions/prompts';
import { useState } from 'react';

interface Prompt {
  id: string;
  type: string;
  name: string;
  systemPrompt: string;
  useExtendedThinking: boolean;
  thinkingBudget: number | null;
  useWebSearch: boolean;
  model: string;
  maxTokens: number;
  temperature: number;
}

export default function EditPromptModal({
  prompt,
  isOpen,
  onClose
}: {
  prompt: Prompt;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: prompt.name,
    systemPrompt: prompt.systemPrompt,
    useExtendedThinking: prompt.useExtendedThinking,
    thinkingBudget: prompt.thinkingBudget || 2048,
    useWebSearch: prompt.useWebSearch,
    maxTokens: prompt.maxTokens,
    temperature: prompt.temperature,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const result = await updatePrompt(prompt.id, formData);

    if (result.error) {
      setError(result.error);
      setSaving(false);
    } else {
      onClose();
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border-2 border-slate-200 dark:border-slate-800 shadow-2xl my-8">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Edit {prompt.type} Prompt
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Customize how Claude generates {prompt.type.toLowerCase()} content
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Prompt Name */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Prompt Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              System Prompt
              <span className="ml-2 text-xs text-slate-500">This is what tells Claude how to behave</span>
            </label>
            <textarea
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              rows={12}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Enter your custom system prompt here..."
            />
            <p className="text-xs text-slate-500 mt-2">
              Tip: Be specific about tone, style, structure, and what to include/exclude
            </p>
          </div>

          {/* Settings Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Extended Thinking */}
            {prompt.type === 'SCRIPT' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">
                    Extended Thinking
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, useExtendedThinking: !formData.useExtendedThinking })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.useExtendedThinking ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.useExtendedThinking ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Claude thinks deeply before responding
                </p>

                {formData.useExtendedThinking && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Thinking Budget (tokens)
                    </label>
                    <input
                      type="number"
                      min="1024"
                      max="10000"
                      step="512"
                      value={formData.thinkingBudget}
                      onChange={(e) => setFormData({ ...formData, thinkingBudget: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Web Search */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-900 dark:text-white">
                  Web Search
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, useWebSearch: !formData.useWebSearch })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.useWebSearch ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.useWebSearch ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Enable real-time web search (coming soon)
              </p>
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                min="256"
                max="8192"
                step="256"
                value={formData.maxTokens}
                onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-500 mt-1">Maximum length of response</p>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Temperature: {formData.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-1">
                Lower = more focused, Higher = more creative
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
