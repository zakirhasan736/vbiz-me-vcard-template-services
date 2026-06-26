import type { ApiResponse } from '@/interfaces/api/api.interface'

export type DynamicPostAttachment = {
  id: number
  doc_name: string
  attachment_type_id: number
  url: string
}

export type DynamicPostItem = {
  id: number
  title: string
  description: string | null
  profile_id: number
  post_type_id: number
  status: string | number
  created_at: string
  updated_at: string
  featured_image: string | null
  general_info_url?: string | null
  attachments?: DynamicPostAttachment[]
}

export type DynamicPostsSectionPostType = {
  id?: number
  name: string
  title: string
}

export type DynamicPostsSectionData = {
  type: string
  postType: DynamicPostsSectionPostType
  profile: { id: string }
  items: DynamicPostItem[]
}

export type DynamicPostsSectionResponse = ApiResponse<DynamicPostsSectionData> & {
  section_id?: string
  post_type?: {
    name: string
    title: string
    type_id?: string
  }
}

export type DynamicPostListItem = {
  id: number
  title: string
  description: string
  featuredImage: string
  generalInfoUrl: string
  date: string
  attachments: DynamicPostAttachment[]
}

export type DynamicPostsQueryResult = {
  sectionTitle: string
  posts: DynamicPostListItem[]
}
