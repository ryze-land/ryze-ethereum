import detectEthereumProvider from '@metamask/detect-provider'
import { BrowserProvider, JsonRpcSigner, Eip1193Provider } from 'ethers'
import { Chain, EthError, WalletApplication } from '../../enums'
import { parseChain } from '../../helpers'
import { LocalStorage } from '../LocalStorage'
import { WalletInfo } from '../WalletInfo'
import { MetaMaskEthereumProvider } from './MetamaskEthereumProvider'

export type OnWalletUpdate = (walletInfo: WalletInfo | null) => void | Promise<void>

/**
 * WalletProvider
 *
 * This class provides an interface for interacting with a web3 wallet, such as MetaMask.
 */
export class WalletManager {
    private readonly _storage: LocalStorage<WalletInfo | null>
    private _wrappedProvider: BrowserProvider | null = null
    private _nativeProvider: MetaMaskEthereumProvider | null = null
    private _walletInfo: WalletInfo | null = null
    private _initializedEvents = false

    /**
     * Constructs a WalletProvider instance.
     *
     * @param defaultChain - The default blockchain network to connect to.
     * @param availableChains - An array of available blockchain networks for connection.
     * @param _onWalletUpdate - Callback to be executed on wallet updates, such as a change in the address, chain, or a disconnect.
     */
    constructor(
        public readonly defaultChain: Chain,
        public readonly availableChains: Chain[],
        private readonly _onWalletUpdate?: OnWalletUpdate,
    ) {
        this._storage = new LocalStorage<WalletInfo | null>(
            'ethereum-wallet-info',
            storedValue => {
                const json: {
                    provider: WalletApplication,
                    chain: Chain,
                    address: string,
                    connected: boolean,
                } = JSON.parse(storedValue)

                return new WalletInfo(
                    json.provider,
                    json.chain,
                    json.address,
                    json.connected,
                )
            },
        )
    }

    /**
     * Connects to the wallet provider.
     *
     * This function checks for the presence of an Ethereum provider in the browser and connects to it.
     * It also sets up listeners for 'accountsChanged' and 'chainChanged' events from the provider and updates the address and chainId respectively when these events occur.
     *
     * @returns {Promise<void>}
     */
    public async connect(walletApplication: WalletApplication): Promise<void> {
        const provider = await detectEthereumProvider<MetaMaskEthereumProvider>()

        if (!provider)
            throw new Error(EthError.PROVIDER_UNAVAILABLE)

        this._nativeProvider = provider
        this._wrappedProvider = new BrowserProvider(this._nativeProvider as Eip1193Provider)

        if (!this._initializedEvents) {
            this._addEventListener('accountsChanged', this._updateAddress)
            this._addEventListener('chainChanged', this._updateChain)

            this._initializedEvents = true
        }

        this._walletInfo = new WalletInfo(
            walletApplication,
            await this.getWalletChain(),
            await this.getWalletAddress(),
            true,
        )

        this.commit()
    }

    /**
     * Attempts to reestablish a previously active connection.
     */
    public async reconnect(): Promise<void> {
        if (this._walletInfo)
            return

        const walletInfo = this._storage.get()

        if (walletInfo) {
            this._walletInfo = new WalletInfo(
                walletInfo.application,
                walletInfo.chain,
                walletInfo.address,
                false,
            )

            this.commit()

            return await this.connect(walletInfo.application)
        }

        // TODO maybe switch to persisted chain and address
    }

    /**
     * Gets the current wallet information.
     *
     * This function returns an object containing the current address and chainId.
     *
     * @returns {WalletInfo | null}
     */
    public get walletInfo(): WalletInfo | null {
        return this._walletInfo || this._storage.get()
    }

    /**
     * Disconnects the currently connected wallet, if any.
     */
    public disconnect(): void {
        this._walletInfo = null
        this.commit()
    }

    /**
     * Retrieves the signer object associated with the current provider.
     *
     * The signer is an object that allows interacting with the Ethereum blockchain, including sending transactions.
     *
     * @returns {Promise<JsonRpcSigner>} - Returns a promise that resolves to the JsonRpcSigner.
     */
    public async getSigner(requiredChain?: Chain): Promise<JsonRpcSigner> {
        if (!this._wrappedProvider)
            throw new Error(EthError.SIGNER_UNAVAILABLE)

        try {
            const signer = await this._wrappedProvider.getSigner()

            await this._validateSigner(signer, requiredChain)

            return signer
        }
        catch (e) {
            if ((e as Error)?.message?.includes('unknown account'))
                throw new Error(EthError.SIGNER_UNAVAILABLE)

            throw e
        }
    }

    /**
     * Validates that the signer is correctly set up.
     *
     * If the signer is null, this function throws an error.
     *
     * @throws Will throw an error if the signer is null.
     */
    private async _validateSigner(signer: JsonRpcSigner, requiredChain?: Chain): Promise<void> {
        if (requiredChain) {
            const signerChain = await this.getWalletChain()

            if (signerChain !== requiredChain)
                throw new Error(EthError.UNSUPPORTED_CHAIN)
        }

        if (!await signer.getAddress())
            throw new Error(EthError.SIGNER_UNAVAILABLE)
    }

    /**
     * Sends a request to the provider.
     *
     * This function sends a request to the provider using its send method. The type of request and any associated parameters are specified in the method and params argument.
     *
     * @param { object } { method, params } - An object with two properties. The 'method' is a string that specifies the method to be called on the provider, and 'params' is an optional array or object containing any associated parameters.
     * @returns {Promise<any>} - The result of the provider's method call.
     * @throws {Error} - If the wallet is not connected or if the provider doesn't support the send method.
     */
    public async request({
        method,
        params,
    }: {
        method: string
        params?: any[] | Record<string, any>
    }): Promise<any> {
        if (!this._wrappedProvider)
            throw new Error(EthError.WALLET_NOT_CONNECTED)

        if (!this._wrappedProvider.provider.send)
            throw new Error(EthError.UNSUPPORTED_REQUEST)

        return await this._wrappedProvider.provider.send(method, params || [])
    }

    /**
     * Retrieves the currently connected wallet address.
     *
     * @returns {Promise<string>} - Returns a promise that resolves to the current wallet address.
     */
    private async getWalletAddress(): Promise<string> {
        return (await this.request({ method: 'eth_requestAccounts' }))[0].toLowerCase()
    }

    /**
     * Retrieves the chain that the wallet is currently connected to.
     *
     * @returns {Promise<number>} - Returns a promise that resolves to the current chainId.
     */
    private async getWalletChain(): Promise<Chain> {
        if (!this._wrappedProvider)
            throw new Error(EthError.WALLET_NOT_CONNECTED)

        const chain = (await this._wrappedProvider.getNetwork()).chainId

        return parseChain(chain) as Chain
    }

    /**
     * Gets the current valid chain.
     *
     * This function checks if the wallet's current chain is included in the list of available chains.
     * If it is, the wallet's current chain is returned. If not, the default chain is returned instead.
     *
     * @returns {Chain} - Returns the current valid chain.
     */
    private getValidChain(): Chain {
        const walletChain = this._walletInfo?.chain

        if (walletChain && this.availableChains.includes(walletChain))
            return walletChain

        return this.defaultChain
    }

    /**
     * Commits the current wallet info.
     *
     * This function emits a 'wallet-info' event with the current wallet info and stores the wallet info in the storage.
     */
    private commit(): void {
        this._onWalletUpdate?.(this._walletInfo)
        this._storage.set(this._walletInfo)
    }

    /**
     * Updates the current address.
     *
     * This function is called when the 'accountsChanged' event is emitted from the provider. It updates the address property and emits a 'wallet-info' event with the updated wallet information.
     */
    private async _updateAddress(): Promise<void> {
        if (!this._walletInfo)
            return

        this._walletInfo = new WalletInfo(
            this._walletInfo.application,
            this._walletInfo.chain,
            await this.getWalletAddress(),
            true,
        )

        this.commit()
    }

    /**
     * Updates the current chainId.
     *
     * This function is called when the 'chainChanged' event is emitted from the provider.
     * It updates the chainId property and emits a 'wallet-info' event with the updated wallet information.
     */
    private async _updateChain(): Promise<void> {
        if (!this._walletInfo)
            return

        this._walletInfo = new WalletInfo(
            this._walletInfo.application,
            await this.getWalletChain(),
            this._walletInfo.address,
            true,
        )

        this.commit()
    }

    /**
     * Adds an event listener for the specified event.
     *
     * This function allows you to listen for a specific event emitted by the browser wallet.
     * When the specified event is emitted, the provided callback function is called.
     *
     * @param {string} event - The name of the event to listen for.
     * @param {Function} callback - The function to be called when the event is emitted.
     */
    private _addEventListener(event: string, callback: () => void): void {
        this._nativeProvider?.on?.(event, () => callback.bind(this)())
    }
}
