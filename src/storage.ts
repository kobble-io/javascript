export interface ClientStorage {
  getItem(key: string): object | null
  setItem(key: string, value: object): void
  removeItem(key: string): void
}

export const SessionStorage = {
  getItem(key: string): object | null {
    if (!sessionStorage) {
      throw new Error(
        'Session storage is not available. Kobble must be run in a browser environment.'
      )
    }

    const value = sessionStorage.getItem(key)

    if (value == null) {
      return null
    }

    return JSON.parse(value)
  },

  setItem(key: string, value: object): void {
    if (!sessionStorage) {
      throw new Error(
        'Session storage is not available. Kobble must be run in a browser environment.'
      )
    }

    sessionStorage.setItem(key, JSON.stringify(value))
  },

  removeItem(key: string) {
    if (!sessionStorage) {
      throw new Error(
        'Session storage is not available. Kobble must be run in a browser environment.'
      )
    }

    sessionStorage.removeItem(key)
  }
} as ClientStorage

export const LocalStorage = {
  getItem(key: string): object | null {
    if (!localStorage) {
      throw new Error(
        'Local storage is not available. Kobble must be run in a browser environment.'
      )
    }

    const value = localStorage.getItem(key)

    if (value == null) {
      return null
    }

    return JSON.parse(value)
  },

  setItem(key: string, value: object): void {
    if (!localStorage) {
      throw new Error(
        'Local storage is not available. Kobble must be run in a browser environment.'
      )
    }

    localStorage.setItem(key, JSON.stringify(value))
  },

  removeItem(key: string) {
    if (!localStorage) {
      throw new Error(
        'Local storage is not available. Kobble must be run in a browser environment.'
      )
    }

    localStorage.removeItem(key)
  }
} as ClientStorage
