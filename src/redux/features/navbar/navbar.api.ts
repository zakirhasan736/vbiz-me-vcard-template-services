import type { NavBarLinksData, NavBarLinksResponse } from '@/interfaces/navbarLinks.interface'
import { api } from '@/redux/api/api'

function assertNavBarLinksResponse(response: NavBarLinksResponse): NavBarLinksData {
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to load navbar links')
  }
  return response.data
}

export const navBarLinksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNavBarLinks: builder.query<NavBarLinksData, void>({
      query: () => '/post-types',
      transformResponse: assertNavBarLinksResponse,
      providesTags: ['NavBarLinks'],
    }),
  }),
  overrideExisting: false,
})
export const { useGetNavBarLinksQuery, useLazyGetNavBarLinksQuery } = navBarLinksApi
