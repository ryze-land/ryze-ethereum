import { literal as zodLiteral, union as zodUnion, type ZodLiteral } from 'zod'

export const ChainIds = {
    ETH: 1,

    BNB: 56,
    BNB_TESTNET: 97,

    AVAX: 43114,
    AVAX_TESTNET: 43113,

    POLYGON: 137,
    POLYGON_TESTNET: 80001,

    FANTOM: 250,
    FANTOM_TESTNET: 4002,

    OPTIMISM: 10,
    OPTIMISM_TESTNET: 420,

    ARBITRUM: 42161,
    ARBITRUM_TESTNET: 421613,
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
