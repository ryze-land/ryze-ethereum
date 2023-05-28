import { Web3Errors } from '../classes/WalletProvider'

export enum Chain {
    ETH = 1,

    BNB = 56,
    BNB_TESTNET = 97,

    AVAX = 43114,
    AVAX_TESTNET = 43113,

    POLYGON = 137,
    POLYGON_TESTNET = 80001,
}

export const allChains: Chain[] = Object.keys(Chain)
    .map(n => Number.parseInt(n))
    .filter(n => !Number.isNaN(n))

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

    throw new Error(Web3Errors.UNSUPPORTED_CHAIN)
}
