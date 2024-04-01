export const CACHE_KEY_PREFIX = '@@kobble.spajs@@'
export const CACHE_KEY_ID_TOKEN_SUFFIX = '@@id_token@@'
export const CACHE_KEY_ACCESS_TOKEN_SUFFIX = '@@access_token@@'

export const CACHE_KEY_SEPARATOR = '::'

export type MaybePromise<T> = Promise<T> | T

export interface CacheProvider {
  set<T>(key: string, entry: T): MaybePromise<void>
  get<T>(key: string): MaybePromise<T | undefined>
  remove(key: string): MaybePromise<void>
  allKeys(prefix: string): MaybePromise<string[]>
}
