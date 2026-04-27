import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type BlogPost, type BlogPostCreate } from '../api'

export function useBlogPosts() {
  return useQuery<BlogPost[]>({
    queryKey: ['blog'],
    queryFn: api.blog.list,
    staleTime: 60_000,
  })
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient()
  return useMutation<BlogPost, Error, BlogPostCreate>({
    mutationFn: api.blog.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['blog'] })
      void queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
  })
}
