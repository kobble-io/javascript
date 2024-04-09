import { SDK_USER_AGENT } from './constants.ts'

export interface ISdkClient {
  getSupabaseToken(fromAccessToken: string): Promise<string>
}

export type GetTokenResponse = {
  token: string
}

const isGetTokenResponse = (obj: any): obj is GetTokenResponse => {
  return typeof obj?.token === 'string'
}

export class SdkClient implements ISdkClient {
  constructor(private baseUrl: string) {}

  public async getSupabaseToken(fromAccessToken: string) {
    const url = `${this.baseUrl}/integrations/supabase/mint-user-access-token`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${fromAccessToken}`,
        'User-Agent': SDK_USER_AGENT
      }
    })

    if (!response.ok) {
      throw new Error(
        'Failed to fetch data. Have you configured your Supabase integration? Please check our documentation.'
      )
    }

    const json = await response.json()

    if (!isGetTokenResponse) {
      throw new Error('Invalid response format.')
    }

    return json.token
  }
}
