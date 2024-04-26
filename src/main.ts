import { KobbleClient } from './KobbleClient'
import { KobbleClientParams } from './global'

export const createKobbleClient = (params: KobbleClientParams): KobbleClient => {
  return new KobbleClient(params)
}

export * from './access-control/types.ts'
export * from './global'
export { KobbleClient } from './KobbleClient'
