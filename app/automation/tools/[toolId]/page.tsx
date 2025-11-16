'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getClaudeTool, updateClaudeTool, deleteClaudeTool } from '@/app/actions/claude-tool';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ToolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toolId = params.toolId as string;

  const [tool, setTool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userMessage, setUserMessage] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [thinking, setThinking] = useState('');
  const [usage, setUsage] = useState<any>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    loadTool();
  }, [toolId]);

  const loadTool = async () => {
    setLoading(true);
    const result = await getClaudeTool(toolId);
    if (result.error) {
      setError(result.error);
    } else if (result.tool) {
      setTool(result.tool);
      setEditData({
        name: result.tool.name,
        description: result.tool.description,
        mainPrompt: result.tool.mainPrompt,
        firstMessagePrompt: result.tool.firstMessagePrompt,
        continuePartsPrompt: result.tool.continuePartsPrompt,
        useExtendedThinking: result.tool.useExtendedThinking,
        thinkingBudget: result.tool.thinkingBudget,
        useWebSearch: result.tool.useWebSearch,
        maxTokens: result.tool.maxTokens,
        temperature: result.tool.temperature,
        isActive: result.tool.isActive,
      });
    }
    setLoading(false);
  };

  const handleGenerate = async (mode: 'start' | 'continue' | 'custom') => {
    setIsGenerating(true);
    setError(null);
    setThinking('');

    try {
      const response = await fetch('/api/claude-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          userMessage: mode === 'custom' ? userMessage : undefined,
          conversationId: currentConversationId,
          mode,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setCurrentConversationId(data.conversationId);
        setThinking(data.thinking || '');
        setUsage(data.usage);

        // Add messages to the conversation
        if (mode === 'start') {
          setMessages([
            { role: 'user', content: tool.firstMessagePrompt },
            { role: 'assistant', content: data.response },
          ]);
        } else {
          setMessages([...messages, { role: 'assistant', content: data.response }]);
        }

        setUserMessage('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdate = async () => {
    const result = await updateClaudeTool(toolId, editData);
    if (result.error) {
      setError(result.error);
    } else {
      await loadTool();
      setShowSettings(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this tool?')) {
      const result = await deleteClaudeTool(toolId);
      if (result.error) {
        setError(result.error);
      } else {
        router.push('/automation/tools');
      }
    }
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setThinking('');
    setUsage(null);
    setUserMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Tool not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {tool.name}
              </h1>
              {tool.description && (
                <p className="text-slate-600 dark:text-slate-400">{tool.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg transition-colors"
              >
                Settings
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-100 dark:bg-red-950/30 hover:bg-red-200 dark:hover:bg-red-950/50 text-red-700 dark:text-red-400 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Tool Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editData.isActive}
                  onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</label>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Messages */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6 min-h-[400px]">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    No conversation started yet. Click "Start New Conversation" to begin.
                  </p>
                  <button
                    onClick={() => handleGenerate('start')}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating...' : 'Start New Conversation'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                        {msg.role === 'user' ? 'User' : 'Assistant'}
                      </div>
                      <div className="text-slate-900 dark:text-white whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => handleGenerate('start')}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-green-100 dark:bg-green-950/30 hover:bg-green-200 dark:hover:bg-green-950/50 text-green-700 dark:text-green-400 rounded-lg transition-colors disabled:opacity-50 text-sm"
                >
                  New Chat
                </button>
                <button
                  onClick={() => handleGenerate('continue')}
                  disabled={isGenerating || messages.length === 0}
                  className="px-4 py-2 bg-purple-100 dark:bg-purple-950/30 hover:bg-purple-200 dark:hover:bg-purple-950/50 text-purple-700 dark:text-purple-400 rounded-lg transition-colors disabled:opacity-50 text-sm"
                >
                  Continue
                </button>
                <button
                  onClick={handleReset}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
                >
                  Reset
                </button>
              </div>

              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Type your message..."
                rows={4}
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
              />
              <button
                onClick={() => handleGenerate('custom')}
                disabled={isGenerating || !userMessage.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Send Message'}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            {usage && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Last Generation</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Input Tokens:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{usage.inputTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Output Tokens:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{usage.outputTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Total Tokens:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{usage.totalTokens.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Thinking */}
            {thinking && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Extended Thinking</h3>
                <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {thinking}
                </div>
              </div>
            )}

            {/* Tool Info */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Configuration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-slate-600 dark:text-slate-400">
                    {tool.useExtendedThinking ? `Extended Thinking (${tool.thinkingBudget} tokens)` : 'Standard Mode'}
                  </span>
                </div>
                {tool.useWebSearch && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-400">Web Search Enabled</span>
                  </div>
                )}
                <div className="text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                  Model: {tool.model}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
