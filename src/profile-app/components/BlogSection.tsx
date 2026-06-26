'use client'

import { BlogPostDetail } from '@/profile-app/components/BlogPostDetail'
import { DynamicPostsSection } from '@/profile-app/components/DynamicPostsSection'
import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import { useGetBlogQuery } from '@/redux/api'
import { useState } from 'react'

export const BlogSection = () => {
  const { cardOwnerId } = useProfileDisplay()
  const profileId = cardOwnerId?.trim() ?? ''
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)

  const { data, isLoading, isError } = useGetBlogQuery(profileId, { skip: !profileId })

  if (!profileId) return null

  const sectionTitle = data?.sectionTitle ?? 'Blog'
  const selectedPost = data?.posts.find((post) => post.id === selectedPostId)

  if (selectedPost) {
    return <BlogPostDetail post={selectedPost} sectionTitle={sectionTitle} onBack={() => setSelectedPostId(null)} />
  }

  return (
    <DynamicPostsSection
      sectionTitle={sectionTitle}
      posts={data?.posts ?? []}
      isLoading={isLoading}
      isError={isError}
      badgeLabel="Blog"
      emptyMessage="No blog posts have been published yet. Add content from the vCard editor Blog tab."
      onPostClick={(post) => setSelectedPostId(post.id)}
    />
  )
}
