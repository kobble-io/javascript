import type { CacheProvider, MaybePromise } from './common'
import { getBrowser } from '../utils.ts'

export class WebExtensionCache implements CacheProvider {
  public set<T>(key: string, entry: T) {
    const browser = getBrowser()

    browser.storage.local.set({ [key]: JSON.stringify(entry) })
  }

  public async get<T>(key: string): Promise<T | undefined> {
    const browser = getBrowser()

    const items = await browser.storage.local.get(key)

    if (!items[key]) return undefined

    return JSON.parse(items[key])
  }

  public remove(key: string) {
    const browser = getBrowser()

    return browser.storage.local.remove(key)
  }

  public allKeys(prefix: string) {
    const browser = getBrowser()

    return browser.storage.local.get().then((items) => {
      return Object.keys(items).filter((key) => key.startsWith(prefix))
    })
  }
}

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
