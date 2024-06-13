import {
  bufferToBase64UrlEncoded,
  createQueryParams,
  encode,
  generateRandomString,
  parseAuthenticationResult,
  sha256,
  tUserToUser
} from './utils'

import { DEFAULT_SCOPE } from './constants'
import { LocalStorage } from './storage'
import { OperationManager } from './OperationManager'
import { AuthenticationError, InvalidStateError } from './errors'
import type { PKCERequestTokenOptions, RefreshTokenRequestTokenOptions, User } from './global'
import type { HttpClient } from './http'
import { http } from './http'
import { verifyIdToken } from './jwt'
import { CacheManager } from './cache/CacheManager'
import { LocalStorageCache } from './cache/LocalStorageCache'
import { ClockManager } from './ClockManager'
import { EventManager } from './event/EventManager'
import { AuthStateChangedCallback, KobbleClientParams } from './global'
import { ISdkClient, SdkClient } from './SdkClient.ts'
import { AccessControl } from './access-control/AccessControl.ts'
import { Logger } from './Logger.ts'

export class KobbleClient {
  private operationManager: OperationManager
  private httpClient: HttpClient
  private cacheManager: CacheManager
  private clockManager: ClockManager
  private eventManager: EventManager
  private sdkClient: ISdkClient
  public acl: AccessControl
  public logger: Logger

  constructor(private params: KobbleClientParams) {
    if (!params.domain) {
      throw new Error(
        'KobbleClient must be initialized with a domain. Please provide your portal domain when creating a new instance of KobbleClient'
      )
    }

    if (!params.clientId) {
      throw new Error(
        'Missing client id. Please provide your client id when creating a new instance of KobbleClient'
      )
    }

    if (!params.redirectUri) {
      throw new Error(
        'Missing redirect uri. Please provide your redirect uri when creating a new instance of KobbleClient'
      )
    }

    this.logger = new Logger(params.verbose || false)

    const storage = LocalStorage
    this.operationManager = new OperationManager(storage, params.clientId, this.logger)

    this.httpClient = http

    const cache = new LocalStorageCache()
    this.cacheManager = new CacheManager(cache)

    this.clockManager = new ClockManager(this.refreshAccessTokenIfExpired.bind(this))
    this.clockManager.start()

    this.eventManager = new EventManager()

    this.sdkClient = new SdkClient(params.sdkBaseUrl || 'https://client-sdk.kobble.io')

    this.acl = new AccessControl(
      params.sdkBaseUrl || 'https://client-sdk.kobble.io',
      this.getAccessToken.bind(this)
    )
  }

  private dispatchInitialUserStateChange() {
    this.getUser().then((user) => {
      this.eventManager.publishAuthStateChangedEvent({
        user
      })
    })
  }

  private async prepareAuthorizeUrl(): Promise<{
    url: string
    state: string
    nonce: string
    codeVerifier: string
    redirectUri: string
    scope: string
  }> {
    const state = encode(generateRandomString())
    const nonce = encode(generateRandomString())
    const code_verifier = generateRandomString()
    const code_challengeBuffer = await sha256(code_verifier)
    const code_challenge = bufferToBase64UrlEncoded(code_challengeBuffer)

    const scope = DEFAULT_SCOPE

    const queryParams = createQueryParams({
      client_id: this.params.clientId,
      redirect_uri: this.params.redirectUri,
      state: state,
      nonce: nonce,
      code_challenge: code_challenge,
      code_challenge_method: 'S256',
      response_type: 'code',
      scope
    })

    const url = `${this.params.domain}/oauth/authorize?${queryParams}`

    return {
      url,
      state,
      nonce,
      codeVerifier: code_verifier,
      redirectUri: this.params.redirectUri,
      scope
    }
  }

  private prepareTokenUrl() {
    return `${this.params.domain}/api/oauth/token`
  }

  private verifyIdToken(token: string) {
    return verifyIdToken({
      token,
      aud: this.params.clientId,
      iss: 'https://kobble.io'
    })
  }

  private async requestToken(
    params: PKCERequestTokenOptions | RefreshTokenRequestTokenOptions
  ): Promise<{
    idToken: string
    accessToken: string
    refreshToken: string
  }> {
    const url = this.prepareTokenUrl()

    const authResult = await this.httpClient
      .post<{
        id_token: string
        access_token: string
        refresh_token: string
        expires_in: number
      }>(url, {
        ...params
      })
      .catch(async (error) => {
        await this.logout()
        throw new AuthenticationError(error.message)
      })

    if (!authResult.id_token) {
      await this.logout()

      throw new AuthenticationError('MissingIdToken')
    }

    const decodedToken = await this.verifyIdToken(authResult.id_token)

    this.cacheManager.setIdToken({ clientId: params.client_id, idToken: decodedToken })

    const expiresInMs = authResult.expires_in * 1000
    const expiresAt = Date.now() + expiresInMs

    this.cacheManager.setAccessAndRefreshToken({
      clientId: params.client_id,
      accessToken: authResult.access_token,
      refreshToken: authResult.refresh_token,
      expiresAt
    })

    this.eventManager.publishAuthStateChangedEvent({
      user: tUserToUser(decodedToken.user)
    })

    return {
      idToken: authResult.id_token,
      accessToken: authResult.access_token,
      refreshToken: authResult.refresh_token
    }
  }

  public async loginWithRedirect() {
    const { url, state, nonce, redirectUri, codeVerifier, scope } = await this.prepareAuthorizeUrl()

    this.operationManager.create({
      nonce,
      scope,
      codeVerifier,
      state,
      redirectUri
    })

    return window.location.assign(url)
  }

  public async handleRedirectCallback(url: string = window.location.href) {
    const queryStringFragments = url.split('?').slice(1)

    if (queryStringFragments.length === 0) {
      throw new Error('There are no query params available for parsing.')
    }

    const { state, code, error, error_description } = parseAuthenticationResult(
      queryStringFragments.join('')
    )

    const operation = this.operationManager.get()

    if (!operation) {
      throw new InvalidStateError('MissingOperation')
    }

    this.operationManager.remove()

    if (error) {
      throw new AuthenticationError(error_description || error)
    }

    if (!operation.codeVerifier) {
      this.logger.debug('Missing code verifier in local operation')

      throw new InvalidStateError('MissingCodeVerifier')
    }

    if (!operation.state) {
      this.logger.debug('Missing state in local operation')

      throw new InvalidStateError('MissingState')
    }

    if (operation.state !== state) {
      this.logger.debug(
        `State mismatch. Operation state: ${operation.state}, Given state: ${state}`
      )

      throw new InvalidStateError('StateMismatch')
    }

    if (!code) {
      this.logger.debug('Missing code in the query params')

      throw new AuthenticationError('MissingCode')
    }

    const redirectUri = operation.redirectUri

    const result = await this.requestToken({
      client_id: this.params.clientId,
      scope: operation.scope,
      code_verifier: operation.codeVerifier,
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: redirectUri
    })

    return result
  }

  public async getUser(): Promise<User | null> {
    const token = await this.cacheManager.getIdToken(this.params.clientId)
    if (!token) {
      return null
    }

    return tUserToUser(token.user)
  }

  public getPortalUrl() {
    return this.params.domain
  }

  public getPortalProfileUrl() {
    return `${this.params.domain}/profile`
  }

  public getPortalPricingUrl() {
    return `${this.params.domain}/pricing`
  }

  public openPortal(target: '_blank' | '_self' = '_self') {
    return window.open(this.getPortalUrl(), target)
  }

  public openPortalProfile(target: '_blank' | '_self' = '_self') {
    return window.open(this.getPortalProfileUrl(), target)
  }

  public openPortalPricing(target: '_blank' | '_self' = '_self') {
    return window.open(this.getPortalPricingUrl(), target)
  }

  public async getIdToken(): Promise<string | null> {
    const token = await this.cacheManager.getIdToken(this.params.clientId)
    return token?.claims.__raw || null
  }

  public async isAuthenticated() {
    const user = await this.getUser()
    return !!user
  }

  public async logout(): Promise<void> {
    await this.cacheManager.clear(this.params.clientId)
    this.eventManager.publishAuthStateChangedEvent({
      user: null
    })
  }

  public async refreshAccessTokenIfExpired() {
    await this.getAccessToken(true, false)
  }

  public async refreshAccessToken() {
    await this.getAccessToken(true, true)
  }

  public async getAccessToken(renewIfExpired = true, forceRenew = false): Promise<string | null> {
    const token = await this.cacheManager.getAccessAndRefreshToken(this.params.clientId)

    if (!token) {
      return null
    }

    if (!renewIfExpired && !forceRenew) {
      return token?.accessToken || null
    }

    const { accessToken, refreshToken, expiresAt } = token

    if (!accessToken || !refreshToken) {
      return null
    }

    // We want to renew the token if it's about to expire
    const ACCESS_TOKEN_EXPIRATION_BUFFER = 120 * 1000 // 2 minute

    const isExpired = expiresAt + ACCESS_TOKEN_EXPIRATION_BUFFER < Date.now()

    if (!isExpired && !forceRenew) {
      return accessToken
    }

    const result = await this.requestToken({
      client_id: this.params.clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })

    return result.accessToken
  }

  public async getSupabaseToken() {
    const token = await this.getAccessToken()

    if (!token) {
      return null
    }

    return this.sdkClient.getSupabaseToken(token)
  }

  onAuthStateChanged(callback: AuthStateChangedCallback) {
    const handler = this.eventManager.subscribeAuthStateChangedEvent(callback)

    this.dispatchInitialUserStateChange()
    return handler
  }
}
