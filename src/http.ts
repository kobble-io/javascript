import { SDK_USER_AGENT } from './constants.ts'

export interface HttpClient {
  post<T>(url: string, body?: object): Promise<T>
}

export const http: HttpClient = {
  async post<T>(url: string, body?: object): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': SDK_USER_AGENT
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }

    return response.json()
  }
}
