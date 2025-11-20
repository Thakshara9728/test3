'use client';

import { useState } from 'react';

interface Video {
  title: string;
  url: string;
  viewCount: number;
}

interface ExportButtonsProps {
  videos: Video[];
}

export default function ExportButtons({ videos }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [copiedWithUrls, setCopiedWithUrls] = useState(false);

  const handleCopyTitles = async () => {
    const text = videos.map(v => v.title).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyWithUrls = async () => {
    const text = videos.map(v => `${v.title}\n${v.url}`).join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedWithUrls(true);
      setTimeout(() => setCopiedWithUrls(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadTitles = () => {
    const text = videos.map(v => v.title).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-viral-titles-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadWithUrls = () => {
    const text = videos.map(v => `${v.title}\n${v.url}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-videos-with-urls-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Copy Titles Only */}
      <button
        onClick={handleCopyTitles}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-all hover:shadow-lg"
      >
        {copied ? (
          <>
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-600 dark:text-green-400">Copied!</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy Titles</span>
          </>
        )}
      </button>

      {/* Copy Titles + URLs */}
      <button
        onClick={handleCopyWithUrls}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl hover:border-purple-400 dark:hover:border-purple-600 text-slate-700 dark:text-slate-300 font-medium transition-all hover:shadow-lg"
      >
        {copiedWithUrls ? (
          <>
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-600 dark:text-green-400">Copied!</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Copy with URLs</span>
          </>
        )}
      </button>

      {/* Download Titles Only */}
      <button
        onClick={handleDownloadTitles}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Download Titles</span>
      </button>

      {/* Download Titles + URLs */}
      <button
        onClick={handleDownloadWithUrls}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Download with URLs</span>
      </button>
    </div>
  );
}
