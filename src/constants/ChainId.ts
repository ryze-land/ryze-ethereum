import { literal as zodLiteral, union as zodUnion, type ZodLiteral } from 'zod'

export const Mainnets = {
    ETH: 1,
    BNB: 56,
    AVAX: 43114,
    POLYGON: 137,
    FANTOM: 250,
    OPTIMISM: 10,
    ARBITRUM: 42161,
} as const

export type MainnetName = keyof typeof Mainnets
export type MainnetId = typeof Mainnets[MainnetName]

export const Testnets = {
    BNB_TESTNET: 97,
    AVAX_TESTNET: 43113,
    POLYGON_TESTNET: 80001,
    FANTOM_TESTNET: 4002,
    OPTIMISM_TESTNET: 420,
    ARBITRUM_TESTNET: 421613,
} as const

export type TestnetName = keyof typeof Testnets
export type TestnetId = typeof Testnets[TestnetName]

export const MainnetIds: MainnetId[] = Object.values(Mainnets)
export const TestnetIds: TestnetId[] = Object.values(Testnets)
export const ChainIds = {
    ...Mainnets,
    ...Testnets,
} as const

export type ChainName = keyof typeof ChainIds
export type ChainId = typeof ChainIds[ChainName]

export type NonEmptyZodLiterals<T> = [
    ZodLiteral<T>,
    ZodLiteral<T>,
    ...ZodLiteral<T>[],
]

export const allChainNames = Object.keys(ChainIds) as ChainName[]
export const allChainIds: ChainId[] = Object.values(ChainIds)

export const chainIdSchema = zodUnion(
    allChainIds.map(chainId => zodLiteral(chainId)) as NonEmptyZodLiterals<ChainId>,
)

export const chainNameSchema = zodUnion(
    allChainNames.map(chainId => zodLiteral(chainId)) as NonEmptyZodLiterals<ChainName>,
)
