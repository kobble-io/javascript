export type Quota = {
  id: string
  name: string
  remaining: number
  limit: number
  usage: number
}

export type Permission = {
  id: string
  name: string
  isAllowed: boolean
}

export interface AccessControlHttpClient {
  fetchUserPermissions: (accessToken: string) => Promise<Permission[]>
  fetchUserQuotas: (accessToken: string) => Promise<Quota[]>
}
