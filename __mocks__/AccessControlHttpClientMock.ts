import { AccessControlHttpClient } from '../src/access-control/types'

export class AccessControlHttpClientMock implements AccessControlHttpClient {
  constructor(private readonly baseUrl: string) {
    console.log(`mock: new AccessControlHttpClientMock(${baseUrl})`)
  }

  fetchUserPermissions = async (userId: string) => {
    console.log(`mock: fetchUserPermissions(${userId}), baseUrl: ${this.baseUrl}`)
    return [
      {
        id: '1',
        name: 'generate-image',
        isAllowed: true
      },
      {
        id: '2',
        name: 'generate-pdf',
        isAllowed: true
      }
    ]
  }
  fetchUserQuotas = async (userId: string) => {
    console.log(`mock: fetchUserQuotas(${userId}), baseUrl: ${this.baseUrl}`)
    return [
      {
        id: '1',
        name: 'video-processing-minutes',
        remaining: 1,
        limit: 1,
        usage: 0
      },
      {
        id: '2',
        name: 'image-generated',
        remaining: 0,
        limit: 2,
        usage: 2
      }
    ]
  }
}
