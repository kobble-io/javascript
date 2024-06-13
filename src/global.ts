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

export type KobbleWebExtensionClientParams = {
  /**
   * This is the Base URL of your Kobble Customer Portal.
   * To find it, go to your [Kobble Dashboard](https://app.kobble.io).
   *
   * Always use the root URL:
   *
   * DO: https://example.portal.kobble.io".
   *
   * DON'T: "https://example.portal.kobble.io/something".
   */
  domain: string
  /**
   * This is the client ID of your Kobble application.
   * To find it, go to [Kobble Dashboard > Applications](https://app.kobble.io/p/applications)
   * and click on your application or create a new one.
   */
  clientId: string
  /**
   * Do not change this parameter unless you know what you are doing.
   */
  sdkBaseUrl?: string
  /**
   * If true, the SDK will log more information to the console.
   * This is useful for debugging but must be disabled in production.
   */
  verbose?: boolean
}

export type KobbleClientParams = {
  /**
   * This is the Base URL of your Kobble Customer Portal.
   * To find it, go to your [Kobble Dashboard](https://app.kobble.io).
   *
   * Always use the root URL:
   *
   * DO: https://example.portal.kobble.io".
   *
   * DON'T: "https://example.portal.kobble.io/something".
   */
  domain: string
  /**
   * This is the client ID of your Kobble application.
   * To find it, go to [Kobble Dashboard > Applications](https://app.kobble.io/p/applications)
   * and click on your application or create a new one.
   */
  clientId: string
  /**
   * This is the URL where the user will be redirected after the login.
   * It must be a URL that is registered in your [Kobble Application](https://app.kobble.io/p/applications).
   * You must be sure this page handles the login callback.
   *
   * You can use the <HandleCallback /> component to easily handle the callback.
   * [See the docs](https://docs.kobble.io/learning/quickstart/react).
   */
  redirectUri: string | (() => Promise<string> | string)
  /**
   * Do not change this parameter unless you know what you are doing.
   */
  sdkBaseUrl?: string
  /**
   * If true, the SDK will log more information to the console.
   * This is useful for debugging but must be disabled in production.
   */
  verbose?: boolean
}
