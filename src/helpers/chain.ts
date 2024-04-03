import { ChainId, MainnetId, Mainnets, TestnetId, Testnets } from '../constants'

export function isMainnet(chainId: ChainId): chainId is MainnetId {
    return Object.values(Mainnets).includes(chainId as MainnetId)
}

export function isTestnet(chainId: ChainId): chainId is TestnetId {
    return Object.values(Testnets).includes(chainId as TestnetId)
}

export function splitChainIds(chainIds: ChainId[]): {mainnets: MainnetId[], testnets: TestnetId[]} {
    const mainnets: MainnetId[] = []
    const testnets: TestnetId[] = []

    chainIds.forEach(chainId => {
        isMainnet(chainId)
            ? mainnets.push(chainId)
            : testnets.push(chainId)
    })

    return { mainnets, testnets }
}
