import { EIP1193Provider } from '../WalletManager/eip1193Provider'

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
}
