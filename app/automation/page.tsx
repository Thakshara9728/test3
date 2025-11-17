import Link from 'next/link';

export default function AutomationDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            AI Automation Studio
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your YouTube channels and automate content creation with Claude AI
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/automation/channels"
            className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl p-6 text-white transition-all hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Manage Channels</h3>
            <p className="text-blue-100 text-sm">
              Create and configure your YouTube channels with custom AI prompts
            </p>
          </Link>

          <Link
            href="/automation/scripts"
            className="group bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl p-6 text-white transition-all hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Generate Scripts</h3>
            <p className="text-purple-100 text-sm">
              Create AI-powered video scripts with extended thinking and web search
            </p>
          </Link>

          <Link
            href="/automation/tools"
            className="group bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-2xl p-6 text-white transition-all hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Claude API Tools</h3>
            <p className="text-emerald-100 text-sm">
              Create custom tools with Claude models, extended thinking, and web search
            </p>
          </Link>

          <div className="group bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 text-slate-400 dark:text-slate-500 cursor-not-allowed">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-300 dark:bg-slate-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828 2.828a9 9 0 0012.728 0" />
                </svg>
              </div>
              <span className="px-3 py-1 bg-slate-300 dark:bg-slate-600 rounded-full text-xs font-medium">
                Coming Soon
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-600 dark:text-slate-400">Batch Processing</h3>
            <p className="text-sm">
              Generate multiple scripts at once across different channels
            </p>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Getting Started
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  Set up your Anthropic API key
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Add your <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">ANTHROPIC_API_KEY</code> to <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">.env.local</code>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  Create your first channel
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Set up a channel with custom system prompts for scripts, images, and video generation
                </p>
                <Link
                  href="/automation/channels"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Go to Channels
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  Generate your first script
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Use Claude AI with extended thinking to create high-quality video scripts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Extended Thinking
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Claude reasons deeply about your content before generating scripts, ensuring quality and coherence.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Web Search
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Research trending topics and incorporate current information into your scripts automatically.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Multi-Channel
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage multiple channels with unique prompts and settings for each one.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Asset Generation
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Auto-generate image and video prompts for thumbnails and B-roll content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
