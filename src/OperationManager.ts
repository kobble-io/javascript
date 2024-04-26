import type { ClientStorage } from './storage'
import { OPERATION_STORAGE_KEY_PREFIX } from './constants'
import { Logger } from './Logger.ts'

interface Operation {
  nonce: string
  scope: string
  codeVerifier: string
  state: string
  redirectUri?: string
}

const isOperation = (value: any): value is Operation => {
  return (
    typeof value === 'object' && value.nonce && value.scope && value.codeVerifier && value.state
  )
}

export class OperationManager {
  private storageKey: string

  constructor(
    private storage: ClientStorage,
    private clientId: string,
    private readonly logger: Logger
  ) {
    this.storageKey = `${OPERATION_STORAGE_KEY_PREFIX}.${this.clientId}`
  }

  public create(operation: Operation) {
    this.logger.debug(`Setting operation in storage: ${JSON.stringify(operation)}`)

    this.storage.setItem(this.storageKey, operation)
  }

  public get(): Operation | null {
    const operation = this.storage.getItem(this.storageKey)

    this.logger.debug(`Found operation in storage: ${JSON.stringify(operation)}`)

    if (!operation) {
      return null
    }

    if (!isOperation(operation)) {
      this.logger.debug(`The operation is invalid, will remove it from storage.`)

      this.remove()
      return null
    }

    return operation
  }

  public remove() {
    this.logger.debug(`Removing operation from storage.`)

    this.storage.removeItem(this.storageKey)
  }
}
