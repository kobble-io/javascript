import { Quota, Permission, AccessControlHttpClient } from './types.ts'
import { ACLHttpClient } from './HttpClient.ts'
import { Cache } from '../cache/Cache.ts'

const QUOTA_CACHE_KEY = 'quotas'
const PERMISSION_CACHE_KEY = 'permissions'

export class AccessControl {
  private httpClient: AccessControlHttpClient
  private permissionsCache: Cache<Permission[]>
  private quotasCache: Cache<Quota[]>

  constructor(
    private readonly clientBaseUrl: string,
    private readonly getAccessToken: () => Promise<string | null>
  ) {
    this.httpClient = new ACLHttpClient(this.clientBaseUrl)
    this.permissionsCache = new Cache({
      defaultTtl: 20 // 20 seconds
    })
    this.quotasCache = new Cache({
      defaultTtl: 20 // 20 seconds
    })
  }

  private async fetchPermissions() {
    const token = await this.getAccessToken()
    if (!token) {
      throw new Error(
        'Access Control Module: attempting to fetch permissions without being logged-in.'
      )
    }

    const permissions = await this.httpClient.fetchUserPermissions(token)
    this.permissionsCache.set(PERMISSION_CACHE_KEY, permissions)

    return permissions
  }

  private async fetchQuotas() {
    const token = await this.getAccessToken()
    if (!token) {
      throw new Error('Access Control Module: attempting to fetch quotas without being logged-in.')
    }

    const quotas = await this.httpClient.fetchUserQuotas(token)
    this.quotasCache.set(QUOTA_CACHE_KEY, quotas)

    return quotas
  }

  /**
   * Retrieves the list of permissions for the logged-in user based on the product attached to them.
   *
   * @param {object} options (optional) - The options for the request.
   * @param {boolean} options.noCache - If true, the method will fetch the permissions from the server instead of using the cache.
   * @returns {Promise Permission[]>} A promise that resolves to an array of Permission objects, each representing a permission for the user.
   */
  public listPermissions(options?: { noCache?: boolean }): Promise<Permission[]> {
    const permissionInCache = this.permissionsCache.get(PERMISSION_CACHE_KEY)

    if (permissionInCache?.length && !options?.noCache) {
      return Promise.resolve(permissionInCache)
    }

    return this.fetchPermissions()
  }

  /**
   * Retrieves the list of quota usages for the logged-in user based on the product attached to them.
   *
   * @param {object} options (optional) - The options for the request.
   * @param {boolean} options.noCache - If true, the method will fetch the quotas from the server instead of using the cache.
   * @returns {Promise Quota[]>} A promise that resolves to an array of QuotaUsage objects, each representing a quota for the user.
   */
  public listQuotas(options?: { noCache?: boolean }): Promise<Quota[]> {
    const quotasInCache = this.quotasCache.get(QUOTA_CACHE_KEY)

    if (quotasInCache?.length && !options?.noCache) {
      return Promise.resolve(quotasInCache)
    }

    return this.fetchQuotas()
  }

  /**
   * Checks if the user has the specified permission(s).
   *
   * @param {string[]} permissionNames - The names of the permissions to check. Can be a single name or an array of names.
   * @returns {Promise<boolean>} A promise that resolves to true if the user has all permissions, false otherwise.
   */
  public async hasPermission(permissionNames: string[] | string): Promise<boolean> {
    const permissions = await this.listPermissions()

    const names = Array.isArray(permissionNames) ? permissionNames : [permissionNames]

    return names.every((permissionName) => {
      const permission = permissions.find((p) => p.name === permissionName)

      return !!permission
    })
  }

  /**
   * Checks if the user has remaining usage for all specified quota(s).
   *
   * @param {string[]} quotaNames - The names of the quotas to check. Can be a single name or an array of names.
   * @returns {Promise<boolean>} A promise that resolves to true if the user has remaining credit for all quotas, false otherwise.
   */
  public async hasRemainingQuota(quotaNames: string | string[]): Promise<boolean> {
    const quotas = await this.listQuotas()

    const names = Array.isArray(quotaNames) ? quotaNames : [quotaNames]

    return names.every((quotaName) => {
      const quota = quotas.find((q) => q.name === quotaName)

      return (quota?.remaining ?? 0) > 0
    })
  }
}
