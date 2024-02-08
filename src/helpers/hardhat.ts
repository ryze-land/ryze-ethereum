import { chainRegistry } from '../assets'
import { ChainIds, ChainName, MainnetName } from '../constants'

/**
 * Retrieves the network configuration for a specified blockchain network.
 * This configuration includes the network name, its RPC URL, chain ID, optional explorer URL, and a gas multiplier.
 * The function supports both mainnet and testnet configurations; for testnets, it automatically adjusts the network name
 * and explorer URL if provided.
 *
 * @param chainName - The name of the chain for which to retrieve the configuration. This can be a mainnet or testnet name.
 * @param explorerKeys - An optional parameter providing explorer URLs for mainnets. There is no need to have testnet keys since they use the same explorer as their relative mainnet.
 * @returns An object containing the network's name, RPC URL, chain ID, optional explorer URL, and a fixed gas multiplier (set to 2).
 */
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
