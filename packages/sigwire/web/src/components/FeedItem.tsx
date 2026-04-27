import type { Article } from '../api'

function ScoreBar({ score }: { score: number | null }) {
  if (score == null) return null
  const pct = Math.round((score / 10) * 100)
  const color = score >= 7 ? 'bg-green-500' : score >= 4 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 tabular-nums">{score.toFixed(1)}</span>
    </div>
  )
}

interface FeedItemProps {
  article: Article
  rank: number
}

export default function FeedItem({ article, rank }: FeedItemProps) {
  const isInternal = article.is_internal
  const domain = (() => {
    try {
      return new URL(article.url).hostname.replace('www.', '')
    } catch {
      return article.source_name ?? ''
    }
  })()

  return (
    <article
      className={[
        'rounded-lg border border-gray-800 bg-gray-900 p-4 flex gap-3 hover:border-gray-700 transition-colors',
        isInternal ? 'border-l-2 border-l-orange-500' : '',
      ].join(' ')}
    >
      <span className="text-2xl font-bold text-gray-700 tabular-nums w-8 shrink-0 pt-0.5">
        {rank}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          {isInternal && (
            <span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-medium shrink-0">
              Original
            </span>
          )}
          <a
            href={article.url}
            target={isInternal ? '_self' : '_blank'}
            rel="noopener noreferrer"
            className="text-gray-100 font-medium hover:text-blue-400 transition-colors leading-snug"
          >
            {article.title}
          </a>
        </div>

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="text-xs text-gray-500">{domain}</span>
          <ScoreBar score={article.score_overall} />
          {article.score_overall != null && (
            <span className="text-xs text-gray-600 hidden sm:block" title={article.llm_rationale ?? ''}>
              T:{article.score_technical?.toFixed(0)} · M:{article.score_market?.toFixed(0)} · N:{article.score_novelty?.toFixed(0)}
            </span>
          )}
        </div>

        {article.summary && (
          <p className="text-sm text-gray-400 mt-1.5 line-clamp-2">{article.summary}</p>
        )}
      </div>
    </article>
  )
}
