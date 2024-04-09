export interface AuthenticationResult {
  state: string
  code?: string
  error?: string
  error_description?: string
}

export type User = {
  id: string
  email: string | null
  name: string | null
  pictureUrl: string | null
  isVerified: boolean
  stripeId: string | null
  updatedAt: Date
  createdAt: Date
}

export type AuthStateChangedCallback = (data: { user: User | null }) => void

export interface BaseRequestTokenOptions {
  client_id: string
  scope: string
  redirect_uri?: string
}

export interface PKCERequestTokenOptions extends BaseRequestTokenOptions {
  code: string
  grant_type: 'authorization_code'
  code_verifier: string
}

export interface RefreshTokenRequestTokenOptions {
  client_id: string
  grant_type: 'refresh_token'
  refresh_token: string
}

export type KobbleClientParams = {
  domain: string
  clientId: string
  redirectUri: string
  sdkBaseUrl?: string
}
