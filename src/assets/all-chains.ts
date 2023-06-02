import { ChainId } from '../enums'

export const allChains: ChainId[] = Object.keys(ChainId)
    .map(n => Number.parseInt(n))
    .filter(n => !Number.isNaN(n))
