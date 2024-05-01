type CacheKey<T> = {
  data: T
  createdAt: number
  expiresAt: number | null
}

type CacheConfig = {
  defaultTtl?: number
}

export class Cache<T = unknown> {
  private readonly data = new Map<string, CacheKey<T>>()

  constructor(private readonly config: CacheConfig = {}) {}

  get(key: string): T | null {
    const ckey = this.data.get(key)

    if (!ckey) {
      return null
    }

    if (ckey.expiresAt && Date.now() > ckey.expiresAt) {
      this.data.delete(key)

      return null
    }

    return ckey.data
  }

  set(key: string, data: T, ttl = this.config.defaultTtl) {
    const now = Date.now()

    this.data.set(key, {
      data,
      createdAt: now,
      expiresAt: ttl ? now + ttl * 1000 : null
    })
  }
}
