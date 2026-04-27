import { useState } from 'react'
import BlogEditor from '../components/BlogEditor'
import BlogPreview from '../components/BlogPreview'
import { useCreateBlogPost } from '../hooks/useBlogPosts'

export default function AdminView() {
  const [mode, setMode] = useState<'internal' | 'link'>('internal')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [tags, setTags] = useState('')
  const [success, setSuccess] = useState(false)

  const { mutateAsync: createPost, isPending, error } = useCreateBlogPost()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccess(false)
    await createPost({
      title,
      content: mode === 'internal' ? content : undefined,
      external_url: mode === 'link' ? externalUrl : undefined,
      tags: tags || undefined,
    })
    setTitle('')
    setContent('')
    setExternalUrl('')
    setTags('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-100">Blog Admin</h1>
        <p className="text-sm text-gray-500">Create an internal post or add a direct link to the feed</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <BlogEditor
              title={title} content={content} externalUrl={externalUrl}
              tags={tags} mode={mode}
              onTitleChange={setTitle} onContentChange={setContent}
              onExternalUrlChange={setExternalUrl} onTagsChange={setTags}
              onModeChange={setMode}
            />
          </div>

          {mode === 'internal' && (
            <div className="flex-1 border border-gray-800 rounded-lg bg-gray-900 p-4 min-h-48">
              <p className="text-xs text-gray-600 mb-3 uppercase tracking-wider">Preview</p>
              <BlogPreview content={content} />
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="submit"
            disabled={!title || isPending}
            className="bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
          >
            {isPending ? 'Publishing…' : 'Publish'}
          </button>
          {success && <span className="text-green-400 text-sm">Published!</span>}
          {error && <span className="text-red-400 text-sm">Error: {error.message}</span>}
        </div>
      </form>
    </div>
  )
}
