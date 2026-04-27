import { useState } from 'react'
import FeedFilters from '../components/FeedFilters'
import FeedItem from '../components/FeedItem'
import { useArticles } from '../hooks/useArticles'
import { api } from '../api'
import { useQueryClient } from '@tanstack/react-query'

export default function FeedView() {
  const [minScore, setMinScore] = useState(0)
  const [search, setSearch] = useState('')
  const [scraping, setScraping] = useState(false)
  const queryClient = useQueryClient()

  const { data: articles, isLoading, isError } = useArticles({ minScore, search })

  async function handleScrape() {
    setScraping(true)
    try {
      await api.scrape()
      await queryClient.invalidateQueries({ queryKey: ['articles'] })
    } finally {
      setScraping(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Signal in the Wire</h1>
          <p className="text-sm text-gray-500">AI-ranked tech & dev news</p>
        </div>
        <button
          type="button"
          onClick={() => void handleScrape()}
          disabled={scraping}
          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {scraping ? 'Scraping…' : '↻ Refresh'}
        </button>
      </div>

      <FeedFilters minScore={minScore} onMinScoreChange={setMinScore} search={search} onSearchChange={setSearch} />

      <div className="mt-4 space-y-2">
        {isLoading && <FeedSkeleton />}
        {isError && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-1">⚠️ Could not reach SigWire</p>
            <p className="text-sm">Is the server running on port 8001?</p>
          </div>
        )}
        {!isLoading && !isError && articles?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-1">No articles yet</p>
            <p className="text-sm">Click ↻ Refresh to scrape the latest stories.</p>
          </div>
        )}
        {articles?.map((article, idx) => (
          <FeedItem key={article.id} article={article} rank={idx + 1} />
        ))}
      </div>
    </div>
  )
}

function FeedSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-gray-800 p-4 animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-800 rounded w-1/4" />
        </div>
      ))}
    </>
  )
}
