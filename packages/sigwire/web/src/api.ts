/** SigWire API base URL — set via VITE_API_URL env var. */
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8001'

// ── Types ──────────────────────────────────────────────────────────────────

export interface Article {
  id: number
  title: string
  url: string
  summary: string | null
  score_technical: number | null
  score_market: number | null
  score_novelty: number | null
  score_overall: number | null
  llm_rationale: string | null
  source_name: string | null
  scraped_at: string | null
  is_internal: boolean
}

export interface BlogPost {
  id: number
  title: string
  content: string | null
  external_url: string | null
  tags: string | null
  is_published: boolean
  created_at: string
}

export interface BlogPostCreate {
  title: string
  content?: string
  external_url?: string
  tags?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`)
  return res.json() as Promise<T>
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${url} → ${res.status}`)
  return res.json() as Promise<T>
}

// ── API Client ─────────────────────────────────────────────────────────────

export const api = {
  health: () => get<{ status: string; node: string; version: string }>(`${API_URL}/health`),

  articles: (params?: { limit?: number; min_score?: number; offset?: number }) => {
    const qs = new URLSearchParams()
    if (params?.limit != null) qs.set('limit', String(params.limit))
    if (params?.min_score != null) qs.set('min_score', String(params.min_score))
    if (params?.offset != null) qs.set('offset', String(params.offset))
    return get<Article[]>(`${API_URL}/articles?${qs}`)
  },

  search: (q: string, limit = 20) =>
    get<Article[]>(`${API_URL}/articles/search?q=${encodeURIComponent(q)}&limit=${limit}`),

  article: (id: number) => get<Article>(`${API_URL}/articles/${id}`),

  scrape: () => post<{ message: string; count: number }>(`${API_URL}/scrape`, {}),

  blog: {
    list: () => get<BlogPost[]>(`${API_URL}/blog`),
    create: (payload: BlogPostCreate) => post<BlogPost>(`${API_URL}/blog`, payload),
  },
}
