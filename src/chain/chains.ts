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

export const parseChain = (chain: string | number): Chain => {
    if (typeof chain === 'string')
        chain = parseInt(chain)

    if (Object.values(Chain).includes(chain))
        return chain as Chain

    throw new Error(Web3Errors.UNSUPPORTED_CHAIN)
}
