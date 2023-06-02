import { allChains } from '../assets'
import { ChainId, EthError } from '../enums'

export class Chain {
    constructor(
        public readonly id: ChainId,
        public readonly name: string,
        public readonly testnet: boolean,
        public readonly currency: {
            name: string
            symbol: string
        },
        public readonly explorer: string,
        public readonly rpcList: string[],
    ) {
        if (rpcList.length === 0)
            throw new Error(EthError.INVALID_CHAIN_CONFIG)
    }

    public get rpc(): string {
        return this.rpcList[0]
    }

    public static createChainMap<T>({
        chains,
        initialValueCallback,
    }: {
        chains?: ChainId[]
        initialValueCallback?: (chain: ChainId) => T
    }) {
        const _chains = chains || allChains
        const _initialValueCallback = initialValueCallback || (() => ({}))

        return _chains.reduce(
            (acc, curr) => ({ ...acc, [curr]: _initialValueCallback(curr) }),
            {} as Record<ChainId, T>,
        )
    }

    public static isChainId(
        chain: number,
        availableChains: ChainId[] = allChains,
    ): chain is ChainId {
        return availableChains.includes(chain)
    }

    public static parseChainId(
        chain: string | number | bigint,
        availableChains: ChainId[] = allChains,
    ): ChainId | null {
        if (typeof chain === 'string')
            chain = parseInt(chain) // this will parse hex and decimals

        if (typeof chain === 'bigint')
            chain = Number(chain)

        return Chain.isChainId(chain, availableChains) ? chain : null
    }

    public static parseChainIdOrFail(
        chain: string | number | bigint,
        availableChains: ChainId[] = allChains,
    ): ChainId {
        const parsedChain = Chain.parseChainId(chain, availableChains)

        if (!parsedChain)
            throw new Error(EthError.UNSUPPORTED_CHAIN)

        return parsedChain
    }
}
