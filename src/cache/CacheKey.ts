import { CACHE_KEY_SEPARATOR } from './common'

export class CacheKey {
  constructor(
    public clientId: string,
    // The prefix is a string that will be used to identify the type of data stored in the cache.
    // This is useful for grouping data and for clearing data from the cache.
    private prefix: string,
    // The suffix is a string that will be used to identify the specific data stored in the cache.
    // This is useful for identifying individual data items within a group of data.
    private suffix: string
  ) {}

  static fromKeyString(key: string) {
    const [prefix, clientId, suffix] = key.split(CACHE_KEY_SEPARATOR)
    return new CacheKey(clientId, prefix, suffix)
  }

  toKeyString() {
    return [this.prefix, this.clientId, this.suffix].join(CACHE_KEY_SEPARATOR)
  }
}
