import { useQuery } from '@tanstack/react-query'
import { api, type Article } from '../api'

interface UseArticlesOptions {
  limit?: number
  minScore?: number
  search?: string
}

export function useArticles({ limit = 50, minScore = 0, search = '' }: UseArticlesOptions = {}) {
  return useQuery<Article[]>({
    queryKey: ['articles', { limit, minScore, search }],
    queryFn: () =>
      search.trim()
        ? api.search(search.trim(), limit)
        : api.articles({ limit, min_score: minScore }),
    staleTime: 30_000,
  })
}
