export interface HttpClient {
  post<T>(url: string, body?: object): Promise<T>
}

export const http: HttpClient = {
  async post<T>(url: string, body?: object): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KobbleSpaJsClient/1.0'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }

    return response.json()
  }
}
