import detectEthereumProvider from '@metamask/detect-provider'
import { JsonRpcProvider, BrowserProvider, JsonRpcSigner, Eip1193Provider } from 'ethers'
import { Chain, chainInfos, ChainMapFactory, parseChain } from '../../chain'
import { LocalStorage } from '../LocalStorage'
import { MultiRpcProvider } from '../MultiRpcProvider'
import { Web3Errors, WalletApplications } from './constants'
import { WalletInfo } from './WalletInfo'
import { EventEmitter } from 'events'

/**
 * WalletProvider
 *
 * This class provides an interface for interacting with a web3 wallet, such as MetaMask.
 * It emits a 'wallet-info' event whenever there are changes in the wallet, such as a change in the address, chain, or a disconnect.
 */
export class WalletProvider {
    /**
     * An event emitter for wallet-related events.
     */
    public readonly events = new EventEmitter()

    private readonly defaultChain: Chain
    private readonly availableChains: Chain[]

    private readonly providers: { [key in Chain]: MultiRpcProvider | JsonRpcProvider }
    private readonly storage: LocalStorage<WalletInfo | null>

    private initializedEvents = false
    private ethereum: BrowserProvider | null = null
    private _walletInfo: WalletInfo | null = null

    /**
     * Constructs a WalletProvider instance.
     *
     * @param defaultChain - The default blockchain network to connect to.
     * @param availableChains - An array of available blockchain networks for connection.
     * @param customRpcs - An optional object mapping chains to their respective RPC interfaces.
     * @param walletStorageKey - An optional key for storing wallet information in local storage.
     */
    constructor({
        defaultChain,
        availableChains,
        customRpcs,
    }: {
        defaultChain: Chain
        availableChains: Chain[]
        customRpcs?: { [chain in Chain]?: string | string[] }
    }) {
        const chainMapFactory = new ChainMapFactory(availableChains)

        this.defaultChain = defaultChain
        this.availableChains = availableChains

        this.providers = chainMapFactory.create((chain: Chain) => {
            const chainInfo = chainInfos[chain]
            const rpc = customRpcs?.[chain] || chainInfo.rpcList || chainInfo.rpc

            return typeof rpc === 'string'
                ? new JsonRpcProvider(rpc)
                : new MultiRpcProvider(rpc)
        })

        this.storage = new LocalStorage<WalletInfo | null>(
            'ethereum-wallet-info',
            storedValue => {
                const json: {
                    provider: WalletApplications,
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
    public async connect(walletApplication: WalletApplications) {
        const provider = await detectEthereumProvider<Eip1193Provider>()

        if (!provider)
            throw new Error(Web3Errors.PROVIDER_UNAVAILABLE)

        this.ethereum = new BrowserProvider(provider)

        if (!this.initializedEvents) {
            this._addEventListener('accountsChanged', this._updateAddress)
            this._addEventListener('chainChanged', this._updateChain)
            // TODO handle disconnect event

            this.initializedEvents = true
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
    public async reconnect() {
        if (this._walletInfo)
            return

        const walletInfo = this.storage.get()

        if (walletInfo) {
            this._walletInfo = new WalletInfo(
                walletInfo.application,
                walletInfo.chain,
                walletInfo.address,
                false,
            )

            this.commit()

            return this.connect(walletInfo.application)
        }

        // TODO maybe switch to persisted chain and address
    }

    /**
     * Gets the current wallet information.
     *
     * This function returns an object containing the current address and chainId.
     *
     * @returns {WalletInfo}
     */
    public get walletInfo() {
        return this._walletInfo || this.storage.get()
    }

    /**
     * Disconnects the currently connected wallet, if any.
     */
    public disconnect() {
        this._walletInfo = null
        this.commit()
    }

    /**
     * Returns a provider for the specified chain.
     *
     * @param chain - The chain for which to get a provider.
     */
    public getProvider(chain: Chain) {
        return this.providers[chain]
    }

    /**
     * Retrieves the signer object associated with the current provider.
     *
     * The signer is an object that allows interacting with the Ethereum blockchain, including sending transactions.
     *
     * @returns {Promise<JsonRpcSigner>} - Returns a promise that resolves to the JsonRpcSigner.
     */
    public async getSigner(requiredChain?: Chain): Promise<JsonRpcSigner> {
        if (!this.ethereum)
            throw new Error(Web3Errors.SIGNER_UNAVAILABLE)

        try {
            const signer = await this.ethereum.getSigner()

            await this._validateSigner(signer, requiredChain)

            return signer
        }
        catch (e) {
            if ((e as Error)?.message?.includes('unknown account'))
                throw new Error(Web3Errors.SIGNER_UNAVAILABLE)

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
    private async _validateSigner(signer: JsonRpcSigner, requiredChain?: Chain) {
        if (requiredChain) {
            const signerChain = await this.getWalletChain()

            if (signerChain !== requiredChain)
                throw new Error(Web3Errors.UNSUPPORTED_CHAIN)
        }

        if (!await signer.getAddress())
            throw new Error(Web3Errors.SIGNER_UNAVAILABLE)
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
    }) {
        if (!this.ethereum)
            throw new Error(Web3Errors.WALLET_NOT_CONNECTED)

        if (!this.ethereum.provider.send)
            throw new Error(Web3Errors.UNSUPPORTED_REQUEST)

        return await this.ethereum.provider.send(method, params || [])
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
        if (!this.ethereum)
            throw new Error(Web3Errors.WALLET_NOT_CONNECTED)

        const chain = (await this.ethereum.getNetwork()).chainId

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
    private commit() {
        this.events.emit('wallet-info', this._walletInfo)
        this.storage.set(this._walletInfo)
    }

    /**
     * Updates the current address.
     *
     * This function is called when the 'accountsChanged' event is emitted from the provider. It updates the address property and emits a 'wallet-info' event with the updated wallet information.
     */
    private async _updateAddress() {
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
    private async _updateChain() {
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
    private _addEventListener(event: string, callback: () => void) {
        this.ethereum?.provider.on && this.ethereum.provider.on(event, () => callback.bind(this)())
    }
}
