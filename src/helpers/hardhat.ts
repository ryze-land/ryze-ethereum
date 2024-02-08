import { chainRegistry } from '../assets'
import { ChainIds, ChainName, chainNameSchema } from '../constants'

export function getNetworkConfig(
    chainName: ChainName,
    explorerKeys?: Partial<Record<ChainName, string>>,
) {
    const chain = chainRegistry[ChainIds[chainNameSchema.parse(chainName)]]

    return {
        name: chainName,
        url: chain.rpc,
        chainId: chain.id,
        explorer: explorerKeys?.[chainName],
        gasMultiplier: 2,
    }
}
