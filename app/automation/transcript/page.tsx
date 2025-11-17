'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TranscriptPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleFetch = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError(null);
    setVideoData(null);
    setCopySuccess(false);

    try {
      const response = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setVideoData(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transcript');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (videoData?.transcript) {
      try {
        await navigator.clipboard.writeText(videoData.transcript);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleDownload = () => {
    if (videoData?.transcript) {
      const blob = new Blob([videoData.transcript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${videoData.title || 'transcript'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadWithTimestamps = () => {
    if (videoData?.subtitles) {
      const formattedTranscript = videoData.subtitles
        .map((sub: any) => `[${formatTime(sub.start)}] ${sub.text}`)
        .join('\n');

      const blob = new Blob([formattedTranscript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${videoData.title || 'transcript'}_with_timestamps.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/automation"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Automation
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            YouTube Transcript Extractor
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Extract transcripts from YouTube videos using Apify API
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6 mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            YouTube Video URL
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleFetch}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium shadow-lg shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Fetching...
                </div>
              ) : (
                'Get Transcript'
              )}
            </button>
          </div>

          <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Example: https://www.youtube.com/watch?v=i_fXDPyu9KM
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {videoData && (
          <div className="space-y-6">
            {/* Video Info */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                {videoData.title}
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Channel:</span>
                  <span className="ml-2 text-slate-900 dark:text-white font-medium">
                    {videoData.channelName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                  <span className="ml-2 text-slate-900 dark:text-white font-medium">
                    {videoData.duration}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Views:</span>
                  <span className="ml-2 text-slate-900 dark:text-white font-medium">
                    {videoData.viewCount?.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Upload Date:</span>
                  <span className="ml-2 text-slate-900 dark:text-white font-medium">
                    {videoData.uploadDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Transcript ({videoData.transcript.length} characters)
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-blue-100 dark:bg-blue-950/30 hover:bg-blue-200 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-lg transition-colors text-sm font-medium"
                  >
                    {copySuccess ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-green-100 dark:bg-green-950/30 hover:bg-green-200 dark:hover:bg-green-950/50 text-green-700 dark:text-green-400 rounded-lg transition-colors text-sm font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </span>
                  </button>
                  {videoData.subtitles && videoData.subtitles.length > 0 && (
                    <button
                      onClick={handleDownloadWithTimestamps}
                      className="px-4 py-2 bg-purple-100 dark:bg-purple-950/30 hover:bg-purple-200 dark:hover:bg-purple-950/50 text-purple-700 dark:text-purple-400 rounded-lg transition-colors text-sm font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        With Timestamps
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                <p className="text-slate-900 dark:text-white whitespace-pre-wrap">
                  {videoData.transcript}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
