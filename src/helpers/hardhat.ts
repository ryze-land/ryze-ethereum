import { chainRegistry } from '../assets'
import { ChainIds, ChainName } from '../constants'

export function getNetworkConfig(
    chainName: ChainName,
    explorerKeys?: Partial<Record<ChainName, string>>,
) {
    const chain = chainRegistry[ChainIds[chainName]]

    return {
        name: chainName,
        url: chain.rpc,
        chainId: chain.id,
        explorer: explorerKeys?.[chainName],
        gasMultiplier: 2,
    }
}
