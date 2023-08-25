import { BrowserProvider } from 'ethers'
import { ChainId } from '../../enums'
import { EIP1193Provider } from '../WalletManager/eip1193Provider'
import { chainRegistry } from '../../assets'
import { numberToHex } from '../../helpers'

/**
 * An abstract class that provides the interface to implement a Wallet Connector.
 */
export abstract class WalletConnector<T extends EIP1193Provider = EIP1193Provider> {
    /** Unique wallet connector id */
    public abstract readonly id: string
    /** Wallet connector name */
    public abstract readonly name: string
    /** Wallet connector icon */
    public readonly icon?: string

    constructor(config?: { icon: string }) {
        this.icon = config?.icon
    }

    /**
     * Gets the required provider to interact with the user Wallet.
     *
     * The provider should follow the same API as [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193)
     *
     * @returns {T | undefined | Promise<T | undefined>}
     */
    public abstract getProvider(): T | undefined | Promise<T | undefined>

    /**
     * Sets the current chain ID.
     *
     * @param {BrowserProvider} provider The ethereum provider.
     * @param {number} chainId The chain ID to set.
     */
    public abstract setChain(chainId: ChainId, provider?: BrowserProvider): Promise<void>

    /**
     * Requests the provider to add the chain ID.
     *
     * @param {BrowserProvider} provider The ethereum provider.
     * @param {number} chainId The chain ID to set.
     */
    public abstract addChain(chainId: ChainId, provider?: BrowserProvider): Promise<void>

    public request(provider: BrowserProvider, method: string, params?: any[] | Record<string, any>): Promise<any> {
        return provider.send(method, params || [])
    }

    protected _getAddChainParams(chainId: ChainId) {
        const chainInfo = chainRegistry[chainId]

        return {
            chainId: numberToHex(chainInfo.id),
            chainName: chainInfo.name,
            nativeCurrency: {
                ...chainInfo.currency,
                decimals: 18,
            },
            rpcUrls: chainInfo.rpcList,
            blockExplorerUrls: [chainInfo.explorer],
        }
    }
}
