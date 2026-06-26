import type {
  DynamicPostItem,
  DynamicPostListItem,
  DynamicPostsQueryResult,
  DynamicPostsSectionResponse,
} from '@/interfaces/api/dynamicPosts.interface'

function isActiveItem(status: string | number): boolean {
  return String(status).trim() === '1'
}

function resolveAttachments(item: DynamicPostItem) {
  return (item.attachments ?? []).filter((a) => a.url?.trim())
}

export function mapDynamicPostItemToListItem(item: DynamicPostItem): DynamicPostListItem {
  return {
    id: item.id,
    title: item.title?.trim() || 'Update',
    description: item.description?.trim() ?? '',
    featuredImage: item.featured_image?.trim() ?? '',
    generalInfoUrl: item.general_info_url?.trim() ?? '',
    date: item.created_at,
    attachments: resolveAttachments(item),
  }
}

export function normalizeDynamicPostsResponse(
  response: DynamicPostsSectionResponse,
  fallbackTitle: string
): DynamicPostsQueryResult {
  if (!response.success || !response.data) {
    throw new Error(response.error || `Failed to load ${fallbackTitle.toLowerCase()}`)
  }

  const sectionTitle = response.post_type?.title?.trim() || response.data.postType?.title?.trim() || fallbackTitle

  const posts = (response.data.items ?? [])
    .filter((item) => isActiveItem(item.status))
    .map(mapDynamicPostItemToListItem)

  return { sectionTitle, posts }
}
