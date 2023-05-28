import { Chain } from '../enums'

export const allChains: Chain[] = Object.keys(Chain)
    .map(n => Number.parseInt(n))
    .filter(n => !Number.isNaN(n))
