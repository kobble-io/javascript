import { AccessControlHttpClient, Permission, Quota } from './types.ts'
import { SDK_USER_AGENT } from '../constants.ts'

export class ACLHttpClient implements AccessControlHttpClient {
  constructor(private readonly baseUrl: string) {}

  async fetchUserPermissions(token: string) {
    const url = `${this.baseUrl}/permissions/list`
    const authorization = `Bearer ${token}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': SDK_USER_AGENT,
        authorization
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch user permissions')
      return []
    }

    const data = (await response.json()) as { permissions: Permission[] }

    return data.permissions
  }

  async fetchUserQuotas(token: string) {
    const url = `${this.baseUrl}/quotas/list`

    const authorization = `Bearer ${token}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': SDK_USER_AGENT,
        authorization
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch user quotas')
      return []
    }

    const data = (await response.json()) as { quotas: Quota[] }

    return data.quotas
  }
}
