import { allChains } from '../assets'
import { ChainId, EthError } from '../enums'

export type ChainMap<T> = Record<ChainId, T>

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
        chainIds,
        initialValueCallback,
    }: {
        chainIds?: ChainId[]
        initialValueCallback?: (chain: ChainId) => T
    }): ChainMap<T> {
        const _chains = chainIds || allChains
        const _initialValueCallback = initialValueCallback || (() => ({}))

        return _chains.reduce(
            (acc, curr) => ({ ...acc, [curr]: _initialValueCallback(curr) }),
            {} as Record<ChainId, T>,
        )
    }

    public static async createAsyncChainMap<T>({
        chainIds,
        initialValueCallback,
    }: {
        chainIds?: ChainId[]
        initialValueCallback?: (chain: ChainId) => Promise<T>
    }): Promise<ChainMap<T>> {
        const chainMap = Chain.createChainMap({ chainIds, initialValueCallback })

        // Map over the entries of the Record (each entry is [key, promise])
        const entries = await Promise.all(
            Object.entries(chainMap).map(async ([chainId, promise]) => {
                const resolvedValue = await promise

                return [+chainId as ChainId, resolvedValue] as const
            }),
        )

        // Convert the array of entries back into an object
        return Object.fromEntries(entries) as Record<ChainId, T>
    }

    public static isChainId(
        chainId: number,
        availableChains: ChainId[] = allChains,
    ): chainId is ChainId {
        return availableChains.includes(chainId)
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
