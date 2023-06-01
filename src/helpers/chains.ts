import { allChains } from '../assets'
import { Chain, EthError } from '../enums'

export const isChain = (chain: number, availableChains: Chain[] = allChains): chain is Chain => {
    return availableChains.includes(chain)
}

export const parseChain = (
    chain: string | number | bigint,
    availableChains: Chain[] = allChains,
): Chain | null => {
    if (typeof chain === 'string')
        chain = parseInt(chain) // this will parse hex and decimals

    if (typeof chain === 'bigint')
        chain = Number(chain)

    return isChain(chain, availableChains) ? chain : null
}

export const parseChainOrFail = (
    chain: string | number | bigint,
    availableChains: Chain[] = allChains,
): Chain => {
    const parsedChain = parseChain(chain, availableChains)

    if (!parsedChain)
        throw new Error(EthError.UNSUPPORTED_CHAIN)

    return parsedChain
}
