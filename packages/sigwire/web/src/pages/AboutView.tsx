export default function AboutView() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-100 mb-4">About SigWire</h1>

      <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
        <p>
          <strong className="text-gray-100">Signal in the Wire</strong> is an AI-ranked news aggregator
          for tech and developer news. It scrapes Hacker News, RSS feeds, and other sources, then uses
          an LLM to score each article on three dimensions:
        </p>

        <ul className="list-disc list-inside space-y-1 text-gray-400">
          <li><strong className="text-gray-300">Technical Depth</strong> — implementation details, code, architecture</li>
          <li><strong className="text-gray-300">Market Impact</strong> — could this move a stock, sector, or funding round?</li>
          <li><strong className="text-gray-300">Novelty</strong> — genuinely new information vs. rehashed takes</li>
        </ul>

        <p>
          The ranking prompt is fully configurable — set the <code className="text-orange-400 bg-gray-900 px-1 rounded">RANKING_PROMPT_FILE</code> env
          var to point at your own prompt file and tailor the scoring to your interests.
        </p>

        <p>
          SigWire is also queryable via MCP, so AI agents like Claude can ask
          &ldquo;what are today&rsquo;s top AI stories?&rdquo; and get structured data back.
        </p>

        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-600">
            Built with <a href="https://github.com/nite/catalyst" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OpenAxis</a> — composable libraries for building intelligent web apps.
          </p>
        </div>
      </div>
    </div>
  )
}
