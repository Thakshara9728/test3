'use client';

import { useState, useEffect } from 'react';
import ImageGenerationForm from './components/ImageGenerationForm';
import ImageGallery from './components/ImageGallery';
import HistoryPanel from './components/HistoryPanel';

interface FreepikImage {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  createdAt: string;
}

interface FreepikGeneration {
  id: string;
  prompt: string;
  aspectRatio: string;
  negativePrompt?: string;
  status: string;
  images: FreepikImage[];
  createdAt: string;
  updatedAt: string;
}

export default function FreepikPage() {
  const [currentGeneration, setCurrentGeneration] = useState<FreepikGeneration | null>(null);
  const [history, setHistory] = useState<FreepikGeneration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/freepik?limit=50');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.generations);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleGenerate = async (prompt: string, aspectRatio: string, negativePrompt?: string) => {
    setError('');
    setCurrentGeneration(null);
    setLoading(true);

    try {
      const response = await fetch('/api/freepik', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, aspectRatio, negativePrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate images');
      }

      setCurrentGeneration(data.generation);
      // Reload history to include new generation
      loadHistory();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromHistory = (generation: FreepikGeneration) => {
    setCurrentGeneration(generation);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Freepik AI Studio
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Generate stunning images with AI powered by Google Gemini 2.5 Flash
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Generation Form */}
          <div className={showHistory ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <ImageGenerationForm onGenerate={handleGenerate} loading={loading} />

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="mt-8 text-center py-16">
                <div className="inline-flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Generating your images...
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  This may take 30-60 seconds
                </p>
              </div>
            )}

            {/* Results */}
            {!loading && currentGeneration && currentGeneration.images.length > 0 && (
              <div className="mt-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Generated Images
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Prompt: {currentGeneration.prompt}
                  </p>
                  {currentGeneration.aspectRatio && (
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      Aspect Ratio: {currentGeneration.aspectRatio}
                    </p>
                  )}
                </div>
                <ImageGallery images={currentGeneration.images} />
              </div>
            )}

            {/* Empty State */}
            {!loading && !currentGeneration && !error && (
              <div className="mt-8 text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Ready to create amazing images?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Enter a prompt above and click Generate to get started
                </p>
              </div>
            )}
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="lg:col-span-4">
              <HistoryPanel
                history={history}
                onSelect={handleSelectFromHistory}
                currentId={currentGeneration?.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
