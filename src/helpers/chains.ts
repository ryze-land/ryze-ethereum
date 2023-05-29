import { allChains } from '../assets'
import { Chain, EthError } from '../enums'

export const isChain = (chain: number, availableChains: Chain[] = allChains): chain is Chain => {
    return availableChains.includes(chain)
}

export const parseChain = (chain: string | number | bigint): Chain => {
    if (typeof chain === 'string')
        chain = parseInt(chain) // this will parse hex and decimals

    if (typeof chain === 'bigint')
        chain = Number(chain)

    if (isChain(chain))
        return chain

    throw new Error(EthError.UNSUPPORTED_CHAIN)
}
