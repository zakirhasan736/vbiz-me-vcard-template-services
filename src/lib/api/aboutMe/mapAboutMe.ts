import type {
  AboutMeItem,
  AboutMeListItem,
  AboutMePillar,
  AboutMeQueryResult,
  AboutMeSectionResponse,
} from '@/interfaces/api/aboutMe.interface'

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isActiveStatus(status: number | string): boolean {
  return String(status).trim() === '1'
}

function toPlainDescription(description: string | null): { plain: string; html: string } {
  const html = description?.trim() ?? ''
  if (!html) return { plain: '', html: '' }
  return { plain: stripHtml(html), html }
}

function extractPillars(html: string): AboutMePillar[] {
  const h3Matches = html.match(/<h3[^>]*>[\s\S]*?<\/h3>/gi) ?? []
  const pillars: AboutMePillar[] = []

  for (const match of h3Matches) {
    const inner = match.replace(/<\/?h3[^>]*>/gi, '')
    const plain = stripHtml(inner)
    if (!plain.includes('🔹')) continue

    const cleaned = plain.replace(/^🔹\s*/, '').trim()
    const dashSplit = cleaned.split(/\s*[–—-]\s*/)
    if (dashSplit.length >= 2) {
      pillars.push({
        title: dashSplit[0].trim(),
        description: dashSplit.slice(1).join(' - ').trim(),
      })
    } else {
      pillars.push({ title: cleaned, description: '' })
    }
  }

  return pillars
}

function extractIntroHtml(html: string): string {
  return html.replace(/<h3[^>]*>[\s\S]*?🔹[\s\S]*?<\/h3>/gi, '').trim()
}

function resolveFeaturedImage(item: AboutMeItem): string {
  const featured = item.featured_image?.trim() ?? ''
  if (featured) return featured

  const attachmentUrl = item.attachments?.find((attachment) => attachment.url?.trim())?.url?.trim()
  return attachmentUrl ?? ''
}

export function mapAboutMeItemToListItem(item: AboutMeItem): AboutMeListItem {
  const { plain, html } = toPlainDescription(item.description)
  const pillars = extractPillars(html)
  const introHtml = extractIntroHtml(html)

  return {
    id: item.id,
    title: item.title.trim() || 'About Me',
    plainDescription: plain,
    htmlDescription: html,
    introHtml: introHtml || html,
    featuredImage: resolveFeaturedImage(item),
    pillars,
  }
}

export function normalizeAboutMeResponse(response: AboutMeSectionResponse): AboutMeQueryResult {
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to load about me content')
  }

  const sectionTitle = response.post_type?.title?.trim() || response.data.postType?.title?.trim() || 'About Me'

  const items = (response.data.items ?? []).filter((item) => isActiveStatus(item.status)).map(mapAboutMeItemToListItem)

  return { sectionTitle, items }
}
