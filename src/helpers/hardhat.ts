import { chainRegistry } from '../assets'
import { ChainIds, ChainName, MainnetName } from '../constants'

export function getNetworkConfig(
    chainName: ChainName,
    explorerKeys?: Partial<Record<MainnetName, string>>,
) {
    const chain = chainRegistry[ChainIds[chainName]]
    const mainnetName = chainName.replace('_TESTNET', '') as MainnetName

    return {
        name: chainName,
        url: chain.rpc,
        chainId: chain.id,
        explorer: explorerKeys?.[mainnetName],
        gasMultiplier: 2,
    }
}
