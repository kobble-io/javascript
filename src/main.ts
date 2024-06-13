import { KobbleClient } from './KobbleClient'
import { KobbleWebExtensionClient } from './KobbleWebExtensionClient.ts'
import { KobbleClientParams, KobbleWebExtensionClientParams } from './global'

export const createKobbleClient = (params: KobbleClientParams): KobbleClient => {
  return new KobbleClient(params)
}

export const createKobbleWebExtensionClient = (params: KobbleWebExtensionClientParams) => {
  return new KobbleWebExtensionClient(params)
}

export * from './access-control/types.ts'
export * from './global'
export { KobbleClient } from './KobbleClient'

export { KobbleWebExtensionClient } from './KobbleWebExtensionClient'
