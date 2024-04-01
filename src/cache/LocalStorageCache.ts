import type { CacheProvider, MaybePromise } from './common'

export class LocalStorageCache implements CacheProvider {
  public set<T>(key: string, entry: T) {
    localStorage.setItem(key, JSON.stringify(entry))
  }

  public get<T>(key: string): MaybePromise<T | undefined> {
    const json = window.localStorage.getItem(key)

    if (!json) return

    try {
      const payload = JSON.parse(json) as T
      return payload
    } catch (e) {
      return
    }
  }

  public remove(key: string) {
    localStorage.removeItem(key)
  }

  public allKeys(prefix: string) {
    return Object.keys(window.localStorage).filter((key) => key.startsWith(prefix))
  }
}
