import { ChainId, allChainIds, EthErrors, chainIdSchema, TestnetId, Testnets, MainnetId, Mainnets } from '../constants'

export type ChainMap<T> = Partial<Record<ChainId, T>>

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
            throw new Error(EthErrors.INVALID_CHAIN_CONFIG)
    }

    public get rpc(): string {
        return this.rpcList[0]
    }

    public static createChainMap<T>({
        chainIds,
        initialValueCallback,
    }: {
        chainIds?: readonly ChainId[]
        initialValueCallback?: (chain: ChainId) => T
    }): ChainMap<T> {
        const _chains = chainIds || allChainIds
        const _initialValueCallback = initialValueCallback || (() => ({}))

        return _chains.reduce<ChainMap<T>>(
            (acc, curr) => ({ ...acc, [curr]: _initialValueCallback(curr) }),
            {},
        )
    }

    public static async createAsyncChainMap<T>({
        chainIds,
        initialValueCallback,
    }: {
        chainIds?: readonly ChainId[]
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
        return Object.fromEntries(entries) as ChainMap<T>
    }

    public static isChainId(
        chainId: number,
    ): chainId is ChainId {
        return chainIdSchema.safeParse(chainId).success
    }

    public static isMainnet(chainId: ChainId): chainId is MainnetId {
        return Object.values(Mainnets).includes(chainId as MainnetId)
    }

    public static isTestnet(chainId: ChainId): chainId is TestnetId {
        return Object.values(Testnets).includes(chainId as TestnetId)
    }

    public static parseChainId(
        chain: string | number | bigint,
    ): ChainId | null {
        if (typeof chain === 'string')
            chain = parseInt(chain) // this will parse hex and decimals

        if (typeof chain === 'bigint')
            chain = Number(chain)

        return Chain.isChainId(chain) ? chain : null
    }

    public static parseChainIdOrFail(
        chain: string | number | bigint,
    ): ChainId {
        const parsedChain = Chain.parseChainId(chain)

        if (!parsedChain)
            throw new Error(EthErrors.UNSUPPORTED_CHAIN)

        return parsedChain
    }

    public static splitMainnetsAndTestnets(chainIds: ChainId[]): {
        mainnets: MainnetId[]
        testnets: TestnetId[]
    } {
        const mainnets: MainnetId[] = []
        const testnets: TestnetId[] = []

        for (const chainId of chainIds) {
            Chain.isMainnet(chainId)
                ? mainnets.push(chainId)
                : testnets.push(chainId)
        }

        return { mainnets, testnets }
    }
}
