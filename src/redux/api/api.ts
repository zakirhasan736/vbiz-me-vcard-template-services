import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const ONE_HOUR_SECONDS = 60 * 60

const baseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  credentials: 'omit',
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json')
    return headers
  },
})

export const api = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQuery,
  /** Public profile sections are mostly static — cache 1h to avoid repeat tab visits refetching. */
  keepUnusedDataFor: ONE_HOUR_SECONDS,
  refetchOnMountOrArgChange: false,
  tagTypes: [
    'user',
    'MyCard',
    'PublicCards',
    'NavBarLinks',
    'Clients',
    'Blog',
    'Post',
    'Services',
    'Calendar',
    'Events',
    'Gallery',
    'Reviews',
    'AboutMe',
    'VideoExplainer',
    'AdditionalServices',
    'BbbAccreditation',
    'Dcp',
    'MeetOurTeam',
    'Faq',
    'Booking',
    'Menu',
    'SalesPerson',
    'SeeProducts',
    'VideoLinks',
    'Videos',
    'MissionStatement',
    'WhyChooseUs',
    'JoinMyTeam',
    'HomeSolar',
    'ResiliencyProducts',
    'PropertyListing',
    'MediaPress',
    'Announcement',
    'CertificationsLicensing',
    'Breakfast',
    'Dinner',
    'Lunch',
    'Inventory',
    'Licensing',
    'InsuranceLicense',
  ],
  endpoints: () => ({}),
})
