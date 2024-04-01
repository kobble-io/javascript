import { KobbleClient } from './KobbleClient.ts'
import { KobbleClientParams } from './global.ts'

export const createKobbleClient = (params: KobbleClientParams) => {
  return new KobbleClient(params)
}
