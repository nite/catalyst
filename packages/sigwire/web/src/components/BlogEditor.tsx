interface BlogEditorProps {
  title: string
  content: string
  externalUrl: string
  tags: string
  mode: 'internal' | 'link'
  onTitleChange: (v: string) => void
  onContentChange: (v: string) => void
  onExternalUrlChange: (v: string) => void
  onTagsChange: (v: string) => void
  onModeChange: (m: 'internal' | 'link') => void
}

export default function BlogEditor({
  title, content, externalUrl, tags, mode,
  onTitleChange, onContentChange, onExternalUrlChange, onTagsChange, onModeChange,
}: BlogEditorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onModeChange('internal')}
          className={[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            mode === 'internal'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-gray-100',
          ].join(' ')}
        >
          Internal Blog
        </button>
        <button
          type="button"
          onClick={() => onModeChange('link')}
          className={[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            mode === 'link'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-gray-100',
          ].join(' ')}
        >
          Direct Link
        </button>
      </div>

      <div>
        <label htmlFor="post-title" className="block text-xs text-gray-500 mb-1">Title</label>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Post title…"
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-gray-600"
        />
      </div>

      {mode === 'internal' ? (
        <div>
          <label htmlFor="post-content" className="block text-xs text-gray-500 mb-1">Content (Markdown)</label>
          <textarea
            id="post-content"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Write in Markdown…"
            rows={12}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-gray-600 font-mono resize-y"
          />
        </div>
      ) : (
        <div>
          <label htmlFor="post-url" className="block text-xs text-gray-500 mb-1">External URL</label>
          <input
            id="post-url"
            type="url"
            value={externalUrl}
            onChange={(e) => onExternalUrlChange(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-gray-600"
          />
        </div>
      )}

      <div>
        <label htmlFor="post-tags" className="block text-xs text-gray-500 mb-1">Tags (comma-separated)</label>
        <input
          id="post-tags"
          type="text"
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder="ai, tooling, open-source"
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-gray-600"
        />
      </div>
    </div>
  )
}
