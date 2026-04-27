import { useEffect, useRef } from 'react'
import { marked } from 'marked'

interface BlogPreviewProps {
  content: string
}

export default function BlogPreview({ content }: BlogPreviewProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const html = marked.parse(content || '_Nothing to preview yet._')
    ref.current.innerHTML = typeof html === 'string' ? html : ''
  }, [content])

  return (
    <div
      ref={ref}
      className="prose prose-invert prose-sm max-w-none text-gray-300 [&_a]:text-blue-400 [&_code]:bg-gray-800 [&_pre]:bg-gray-800 [&_blockquote]:border-orange-500"
    />
  )
}
