import type { CacheProvider } from './common'
import { CacheKey } from './CacheKey'
import type { DecodedIdToken } from '@/components/lib/jwt'
import {
  CACHE_KEY_ACCESS_TOKEN_SUFFIX,
  CACHE_KEY_ID_TOKEN_SUFFIX,
  CACHE_KEY_PREFIX
} from './common'

export type SetAccessTokenPayload = {
  clientId: string
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export class CacheManager {
  constructor(private cache: CacheProvider) {}

  private getIdTokenKey(clientId: string) {
    const key = new CacheKey(clientId, CACHE_KEY_PREFIX, CACHE_KEY_ID_TOKEN_SUFFIX)

    return key.toKeyString()
  }

  private getAccessTokenKey(clientId: string) {
    const key = new CacheKey(clientId, CACHE_KEY_PREFIX, CACHE_KEY_ACCESS_TOKEN_SUFFIX)

    return key.toKeyString()
  }

  setIdToken(params: { clientId: string; idToken: DecodedIdToken }) {
    const key = this.getIdTokenKey(params.clientId)

    this.cache.set<DecodedIdToken>(key, params.idToken)
  }

  getIdToken(clientId: string) {
    const key = this.getIdTokenKey(clientId)

    return this.cache.get<DecodedIdToken>(key)
  }

  setAccessAndRefreshToken(params: SetAccessTokenPayload) {
    const key = this.getAccessTokenKey(params.clientId)

    this.cache.set(key, params)
  }

  getAccessAndRefreshToken(clientId: string) {
    const key = this.getAccessTokenKey(clientId)

    return this.cache.get<SetAccessTokenPayload>(key)
  }

  getCacheKeys() {
    return this.cache.allKeys(CACHE_KEY_PREFIX)
  }

  async clear(clientId: string): Promise<void> {
    const keys = await this.getCacheKeys()

    if (!keys) return

    await keys
      .filter((key) => (clientId ? key.includes(clientId) : true))
      .reduce(async (memo, key) => {
        await memo
        await this.cache.remove(key)
      }, Promise.resolve())
  }
}
