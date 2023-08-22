/**
 * An abstract class that provides the interface to implement a Wallet Connector.
 */
export abstract class WalletConnector<Provider = any> {
    /** Unique wallet connector id */
    public abstract readonly id: string
    /** Wallet connector name */
    public abstract readonly name: string
    /** Wallet connector image */
    public readonly image?: string

    constructor(config?: { image: string }) {
        this.image = config?.image
    }

    /**
     * Gets the required provider to interact with the user Wallet.
     *
     * The provider should follow the same API as [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193)
     *
     * @returns {Provider | Promise<Provider>}
     */
    public abstract getProvider(): Provider | Promise<Provider>
}
