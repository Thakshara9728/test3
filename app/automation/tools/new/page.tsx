'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClaudeTool } from '@/app/actions/claude-tool';

export default function NewToolPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mainPrompt: '',
    firstMessagePrompt: '',
    continuePartsPrompt: '',
    model: 'claude-sonnet-4-5-20250929',
    useExtendedThinking: true,
    thinkingBudget: 10000,
    useUltraThink: false,
    useWebSearch: true,
    usePromptCaching: true,
    maxTokens: 16000,
    temperature: 1.0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await createClaudeTool(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success && result.tool) {
        router.push(`/automation/tools/${result.tool.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create tool');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/automation/tools"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Tools
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Create New Claude Tool
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Configure your tool with three prompts and Claude API settings
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tool Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My Claude Tool"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what this tool does..."
                />
              </div>
            </div>
          </div>

          {/* Prompts */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Prompts Configuration
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Main Prompt (System) *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  The main system prompt that defines the tool's behavior and personality
                </p>
                <textarea
                  required
                  value={formData.mainPrompt}
                  onChange={(e) => setFormData({ ...formData, mainPrompt: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="You are a helpful AI assistant..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  First Message Prompt *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  The initial message to start the conversation
                </p>
                <textarea
                  required
                  value={formData.firstMessagePrompt}
                  onChange={(e) => setFormData({ ...formData, firstMessagePrompt: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Let's start working on..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Continue Parts Prompt *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  The prompt used when continuing or extending the conversation
                </p>
                <textarea
                  required
                  value={formData.continuePartsPrompt}
                  onChange={(e) => setFormData({ ...formData, continuePartsPrompt: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please continue from where we left off..."
                />
              </div>
            </div>
          </div>

          {/* API Settings */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Claude API Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Model
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <optgroup label="Claude 4 (Latest)">
                    <option value="claude-sonnet-4-5-20250929">Claude Sonnet 4.5</option>
                    <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                    <option value="claude-opus-4-20250514">Claude Opus 4</option>
                  </optgroup>
                  <optgroup label="Claude 3.5">
                    <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Oct 2024)</option>
                    <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet (Jun 2024)</option>
                  </optgroup>
                  <optgroup label="Claude 3">
                    <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                    <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                  </optgroup>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="extendedThinking"
                  checked={formData.useExtendedThinking}
                  onChange={(e) => setFormData({ ...formData, useExtendedThinking: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="extendedThinking" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Enable Extended Thinking
                </label>
              </div>

              {formData.useExtendedThinking && !formData.useUltraThink && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Thinking Budget (tokens)
                  </label>
                  <input
                    type="number"
                    value={formData.thinkingBudget}
                    onChange={(e) => setFormData({ ...formData, thinkingBudget: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={1000}
                    max={100000}
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ultraThink"
                  checked={formData.useUltraThink}
                  onChange={(e) => setFormData({ ...formData, useUltraThink: e.target.checked, useExtendedThinking: e.target.checked ? true : formData.useExtendedThinking })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="ultraThink" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Enable UltraThink Mode (50k tokens)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="webSearch"
                  checked={formData.useWebSearch}
                  onChange={(e) => setFormData({ ...formData, useWebSearch: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="webSearch" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Enable Web Search Tool
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="promptCaching"
                  checked={formData.usePromptCaching}
                  onChange={(e) => setFormData({ ...formData, usePromptCaching: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <label htmlFor="promptCaching" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Enable Prompt Caching (Save $ - 90% cheaper reads)
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={formData.maxTokens}
                    onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={1024}
                    max={16384}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Temperature
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={0}
                    max={2}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Tool'}
            </button>
            <Link
              href="/automation/tools"
              className="px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
