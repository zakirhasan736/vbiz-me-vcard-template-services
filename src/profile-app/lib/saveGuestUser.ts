import type { SavedGuestUser } from '@/interfaces/api/saveGuestUser'
import { baseUrl } from '@/redux/api/api'

export class SaveGuestUserError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'SaveGuestUserError'
    this.status = status
  }
}

export type SaveGuestUserInput = {
  firstName: string
  lastName: string
  email: string
  profileId: string
}

export async function saveGuestUser(input: SaveGuestUserInput): Promise<SavedGuestUser> {
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  const email = input.email.trim()
  const profileId = input.profileId.trim()

  if (!firstName) throw new SaveGuestUserError('First name is required')
  if (!lastName) throw new SaveGuestUserError('Last name is required')
  if (!email) throw new SaveGuestUserError('Email is required')
  if (!profileId) throw new SaveGuestUserError('Profile ID is required')

  const body = new FormData()
  body.append('first_name', firstName)
  body.append('last_name', lastName)
  body.append('email', email)
  body.append('profile_id', profileId)

  const response = await fetch(`${baseUrl}/save-guest-user`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body,
  })

  if (!response.ok) {
    let message = 'Failed to save visitor details'
    try {
      const payload = (await response.json()) as { message?: string; error?: string }
      if (typeof payload.message === 'string') message = payload.message
      else if (typeof payload.error === 'string') message = payload.error
    } catch {
      /* ignore parse errors */
    }
    throw new SaveGuestUserError(message, response.status)
  }

  return (await response.json()) as SavedGuestUser
}
