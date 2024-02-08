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
export type NonEmptyChainIdLiterals = [
    ZodLiteral<ChainId>,
    ZodLiteral<ChainId>,
    ...ZodLiteral<ChainId>[],
]

export const allChains: ChainId[] = Object.values(ChainIds)

export const chainIdSchema = zodUnion(
    allChains.map(chainId => zodLiteral(chainId)) as NonEmptyChainIdLiterals,
)
