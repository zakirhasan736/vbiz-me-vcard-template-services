import type { ProfileAiData } from '@/interfaces/api/profileAiData'
import { api } from './api'

export const profileAiDataApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProfileAiData: build.query<ProfileAiData, string>({
      query: (profileId) => `/profile-ai-data/${encodeURIComponent(profileId.trim())}`,
      providesTags: (_result, _error, profileId) => [{ type: 'ProfileAiData', id: profileId }],
    }),
  }),
  overrideExisting: false,
})

export const { useGetProfileAiDataQuery, useLazyGetProfileAiDataQuery } = profileAiDataApi
