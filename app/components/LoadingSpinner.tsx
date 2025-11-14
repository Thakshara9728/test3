export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-red-500 animate-spin"></div>

        {/* Inner YouTube icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
      </div>

      <div className="mt-6 space-y-2 text-center">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          Analyzing channel...
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Fetching and ranking videos by popularity
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex gap-1.5 mt-4">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
