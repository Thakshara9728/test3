interface Video {
  title: string;
  url: string;
  viewCount: number;
  thumbnailUrl: string;
  date: string;
  duration: string;
}

interface VideoCardProps {
  video: Video;
  rank: number;
}

const formatViews = (views: number): string => {
  if (views >= 1000000000) {
    return (views / 1000000000).toFixed(1) + 'B';
  }
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M';
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  }
  return views.toString();
};

export default function VideoCard({ video, rank }: VideoCardProps) {
  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-600 to-amber-800';
    return 'from-slate-500 to-slate-700';
  };

  const getRankBadge = (rank: number): string => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200 dark:hover:shadow-slate-950 hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-slate-400 dark:text-slate-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        )}

        {/* Rank Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r ${getRankColor(rank)} text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-1`}>
          {getRankBadge(rank) && <span>{getRankBadge(rank)}</span>}
          <span>#{rank}</span>
        </div>

        {/* Duration */}
        {video.duration && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded backdrop-blur-sm">
            {video.duration}
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2 mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
          {video.title}
        </h3>

        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="font-semibold text-slate-900 dark:text-white">{formatViews(video.viewCount)} views</span>
          </div>

          {video.date && (
            <>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span>{video.date}</span>
            </>
          )}
        </div>
      </div>
    </a>
  );
}
