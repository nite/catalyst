interface FeedFiltersProps {
  minScore: number
  onMinScoreChange: (v: number) => void
  search: string
  onSearchChange: (v: string) => void
}

export default function FeedFilters({
  minScore,
  onMinScoreChange,
  search,
  onSearchChange,
}: FeedFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="search"
        placeholder="Search articles…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-gray-600"
      />

      <div className="flex items-center gap-2 shrink-0">
        <label htmlFor="min-score" className="text-xs text-gray-500 whitespace-nowrap">Min score</label>
        <input
          id="min-score"
          type="range"
          min={0}
          max={9}
          step={1}
          value={minScore}
          onChange={(e) => onMinScoreChange(Number(e.target.value))}
          className="w-24 accent-orange-500"
        />
        <span className="text-xs text-gray-400 w-4 tabular-nums">{minScore}+</span>
      </div>
    </div>
  )
}
