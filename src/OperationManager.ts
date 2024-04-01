import type { ClientStorage } from './storage'
import { OPERATION_STORAGE_KEY_PREFIX } from './constants'

interface Operation {
  nonce: string
  scope: string
  codeVerifier: string
  state: string
  redirectUri?: string
}

const isOperation = (value: any): value is Operation => {
  console.log('IS OPERATION', value)
  return (
    typeof value === 'object' && value.nonce && value.scope && value.codeVerifier && value.state
  )
}

export class OperationManager {
  private storageKey: string

  constructor(
    private storage: ClientStorage,
    private clientId: string
  ) {
    this.storageKey = `${OPERATION_STORAGE_KEY_PREFIX}.${this.clientId}`
  }

  public create(operation: Operation) {
    this.storage.setItem(this.storageKey, operation)
  }

  public get(): Operation | null {
    const operation = this.storage.getItem(this.storageKey)

    if (!operation) {
      return null
    }

    if (!isOperation(operation)) {
      this.remove()
      return null
    }

    return operation
  }

  public remove() {
    this.storage.removeItem(this.storageKey)
  }
}
