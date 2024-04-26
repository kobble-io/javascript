import { Quota, Permission, AccessControlHttpClient } from './types.ts'
import { ACLHttpClient } from './HttpClient.ts'

export class AccessControl {
  private permissions: Permission[]
  private quotas: Quota[]
  private httpClient: AccessControlHttpClient

  constructor(
    private readonly clientBaseUrl: string,
    private readonly getAccessToken: () => Promise<string | null>
  ) {
    this.permissions = []
    this.quotas = []
    this.httpClient = new ACLHttpClient(this.clientBaseUrl)
  }

  private async fetchPermissions() {
    const token = await this.getAccessToken()
    if (!token) {
      throw new Error(
        'Access Control Module: attempting to fetch permissions without being logged-in.'
      )
    }

    this.permissions = await this.httpClient.fetchUserPermissions(token)

    return this.permissions
  }

  private async fetchQuotas() {
    const token = await this.getAccessToken()
    if (!token) {
      throw new Error('Access Control Module: attempting to fetch quotas without being logged-in.')
    }

    this.quotas = await this.httpClient.fetchUserQuotas(token)

    return this.quotas
  }

  /**
   * Retrieves the list of permissions for the logged-in user based on the product attached to them.
   *
   * @returns {Promise Permission[]>} A promise that resolves to an array of Permission objects, each representing a permission for the user.
   */
  public listPermissions(): Promise<Permission[]> {
    if (this.permissions?.length) {
      return Promise.resolve(this.permissions)
    }

    return this.fetchPermissions()
  }

  /**
   * Retrieves the list of quota usages for the logged-in user based on the product attached to them.
   *
   * @returns {Promise Quota[]>} A promise that resolves to an array of QuotaUsage objects, each representing a quota for the user.
   */
  public listQuotas(): Promise<Quota[]> {
    if (this.quotas?.length) {
      return Promise.resolve(this.quotas)
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
