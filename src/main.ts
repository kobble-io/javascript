import { KobbleClient } from './KobbleClient.ts'
import { KobbleClientParams } from './global.ts'

export const createKobbleClient = (params: KobbleClientParams): KobbleClient => {
  return new KobbleClient(params)
}

export * from './global'
export * from './KobbleClient'
