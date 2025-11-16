'use client';

interface FreepikImage {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
}

interface FreepikGeneration {
  id: string;
  prompt: string;
  aspectRatio: string;
  status: string;
  images: FreepikImage[];
  createdAt: string;
}

interface HistoryPanelProps {
  history: FreepikGeneration[];
  onSelect: (generation: FreepikGeneration) => void;
  currentId?: string;
}

export default function HistoryPanel({ history, onSelect, currentId }: HistoryPanelProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-4 sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        History
      </h3>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No history yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((generation) => (
            <button
              key={generation.id}
              onClick={() => onSelect(generation)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                currentId === generation.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-slate-900'
              }`}
            >
              {/* Thumbnail Grid */}
              {generation.images.length > 0 && (
                <div className={`grid gap-1 mb-2 ${
                  generation.images.length === 1 ? 'grid-cols-1' :
                  generation.images.length === 2 ? 'grid-cols-2' :
                  'grid-cols-2'
                }`}>
                  {generation.images.slice(0, 4).map((image) => (
                    <div key={image.id} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                      <img
                        src={image.thumbnailUrl || image.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Prompt */}
              <p className="text-sm text-slate-900 dark:text-white font-medium line-clamp-2 mb-1">
                {generation.prompt}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{formatDate(generation.createdAt)}</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {generation.images.length}
                </span>
              </div>

              {/* Status Badge */}
              {generation.status !== 'COMPLETED' && (
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    generation.status === 'PROCESSING'
                      ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                      : generation.status === 'FAILED'
                      ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {generation.status === 'PROCESSING' && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                    {generation.status}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
