import detectEthereumProvider from '@metamask/detect-provider'
import {
    BrowserProvider,
    PreparedTransactionRequest,
    Eip1193Provider,
    EthersError,
    JsonRpcSigner,
    TransactionReceipt,
    TransactionResponse,
} from 'ethers'
import { chainRegistry } from '../../assets'
import { ChainId, EthError, WalletApplication } from '../../enums'
import { EthersErrorCode, isEthersError, isProviderError, ProviderErrorCode } from '../../errors'
import { numberToHex } from '../../helpers'
import { Chain } from '../Chain'
import { LocalStorage } from '../LocalStorage'
import { WalletInfo, walletInfoSchema } from '../WalletInfo'
import { MetaMaskEthereumProvider } from './MetamaskEthereumProvider'

export type OnWalletUpdate = (walletInfo: WalletInfo | null) => void | Promise<void>

export interface TransactionOptions {
    onReadyToSign?: () => void,
    onBroadcast?: (transactionResponse?: TransactionResponse) => void | Promise<void>,
    onConfirm?: (transactionReceipt?: TransactionReceipt | null) => void | Promise<void>,
    gasMultiplier?: bigint
    requiredConfirmations?: number
}

export type WalletErrorHandler<DataType> = (data: DataType) => void | Promise<void>

export interface WalletErrorHandlers {
    onReject?: WalletErrorHandler<EthersError>,
    onRequestAlreadyPending?: WalletErrorHandler<EthersError>,
}

export interface ConnectWalletErrorHandlers extends WalletErrorHandlers {
    onProviderUnavailable?: WalletErrorHandler<WalletApplication>
}

// TODO: must test interactions with all added wallet providers
// Tested wallet providers:
// - Metamask
// - TrustWallet

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
    private _currentWalletApplication: WalletApplication | null = null
    private _initializedEvents = false

    /**
     * Constructs a WalletProvider instance.
     *
     * @param defaultChainId - The default blockchain network to connect to.
     * @param availableChainIds - An array of available blockchain networks for connection.
     * @param _onWalletUpdate - Callback to be executed on wallet updates, such as a change in the address, chain, or a disconnect.
     */
    constructor(
        public readonly defaultChainId: ChainId,
        public readonly availableChainIds: ChainId[],
        private readonly _onWalletUpdate?: OnWalletUpdate,
    ) {
        this._storage = new LocalStorage<WalletInfo | null>(
            'ethereum-wallet-info',
            storedValue => {
                const json = walletInfoSchema.parse(JSON.parse(storedValue))

                return new WalletInfo(
                    json.application,
                    json.chainId,
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
    public async connect(
        walletApplication: WalletApplication,
        walletErrorHandlers?: ConnectWalletErrorHandlers,
    ): Promise<void> {
        const provider = await detectEthereumProvider<MetaMaskEthereumProvider>()

        if (!provider) {
            if (walletErrorHandlers?.onProviderUnavailable)
                return walletErrorHandlers.onProviderUnavailable(walletApplication)

            throw new Error(EthError.PROVIDER_UNAVAILABLE)
        }

        try {
            this._currentWalletApplication = walletApplication
            this._nativeProvider = provider
            this._wrappedProvider = new BrowserProvider(this._nativeProvider as Eip1193Provider, 'any')

            if (!this._initializedEvents) {
                this._addEventListener('accountsChanged', this._updateAddress)
                this._addEventListener('chainChanged', this._updateChainId)

                this._initializedEvents = true
            }

            const [chainId, address] = await Promise.all([
                this._getWalletChainId(),
                this._getWalletAddress(),
            ])

            this.walletInfo = new WalletInfo(walletApplication, chainId, address, true)
        }
        catch (e) {
            return this._handleWalletErrors(e, walletErrorHandlers)
        }
    }

    /**
     * Attempts to reestablish a previously active connection.
     */
    public async reconnect(walletErrorHandlers?: ConnectWalletErrorHandlers): Promise<void> {
        if (this._walletInfo)
            return

        const walletInfo = this._storage.get()

        if (walletInfo) {
            this.walletInfo = new WalletInfo(
                walletInfo.application,
                walletInfo.chainId,
                walletInfo.address,
                false,
            )

            if (walletInfo.application)
                return await this.connect(walletInfo.application, walletErrorHandlers)
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
     * Manually sets and commits a WalletInfo
     *
     * @param walletInfo
     */
    public set walletInfo(walletInfo: WalletInfo | null) {
        this._walletInfo = walletInfo
        this._commit()
    }

    /**
     * Disconnects the currently connected wallet, if any.
     */
    public disconnect(): void {
        this.walletInfo = null
    }

    /**
     * Retrieves the signer object associated with the current provider.
     *
     * The signer is an object that allows interacting with the Ethereum blockchain, including sending transactions.
     *
     * @returns {Promise<JsonRpcSigner>} - Returns a promise that resolves to the JsonRpcSigner.
     */
    public async getSigner(): Promise<JsonRpcSigner> {
        if (!this._wrappedProvider)
            throw new Error(EthError.SIGNER_UNAVAILABLE)

        try {
            const signer = await this._wrappedProvider.getSigner()

            await this._validateSigner(signer)

            return signer
        }
        catch (e) {
            if ((e as Error).message.includes('unknown account'))
                throw new Error(EthError.SIGNER_UNAVAILABLE)

            throw e
        }
    }

    public async setChain(
        chainId: ChainId,
        walletErrorHandlers?: WalletErrorHandlers,
    ): Promise<void> {
        const walletInfo = this._walletInfo

        if (!walletInfo?.address || !walletInfo?.connected)
            throw new Error(EthError.SIGNER_UNAVAILABLE)

        if (walletInfo?.chainId === chainId)
            throw new Error(EthError.INVALID_REQUEST)

        try {
            await this.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: numberToHex(chainId) }],
            })
        }
        catch (e) {
            if (isEthersError(e) && isProviderError(e.error)) {
                // In case the chain is not registered in the user's wallet
                if (e.error.code === ProviderErrorCode.MISSING_REQUESTED_CHAIN ||
                    e.error.code === ProviderErrorCode.INTERNAL)
                    return await this.addChain(chainId)
            }

            return this._handleWalletErrors(e, walletErrorHandlers)
        }
    }

    public async addChain(chainId: ChainId): Promise<void> {
        const chainInfo = chainRegistry[chainId]

        try {
            await this.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: numberToHex(chainInfo.id),
                        chainName: chainInfo.name,
                        nativeCurrency: {
                            ...chainInfo.currency,
                            decimals: 18,
                        },
                        rpcUrls: chainInfo.rpcList,
                        blockExplorerUrls: [chainInfo.explorer],
                    },
                ],
            })

            return await this.setChain(chainId)
        }
        catch (e) {
            if (
                isEthersError(e) &&
                isProviderError(e.error) &&
                e.error.code === ProviderErrorCode.RESOURCE_UNAVAILABLE
            )
                throw new Error(EthError.REQUEST_ALREADY_PENDING)
        }
    }

    /**
     * Sends a transaction through the current wallet.
     *
     * This function sends a transaction to the Ethereum network using the signer returned by `getSigner()`.
     * Before sending, the function estimates the gas limit for the transaction and multiplies it by the `gasMultiplier` parameter.
     *
     * It provides optional callbacks for when the transaction is sent and when it is confirmed.
     *
     * @param {PreparedTransactionRequest} transaction - The transaction to be sent.
     * @param {TransactionOptions} options - The transaction options, including optional callbacks and gas settings.
     *
     * `onReadyToSign`: An optional callback function that will be called once the transaction is prepared and ready to sign.
     * `onBroadcast`: An optional callback function that will be called with the transaction response immediately after the transaction is broadcast to the network.
     * `onConfirm`: An optional callback function that will be called with the transaction receipt after the transaction is confirmed.
     * `gasMultiplier`: A multiplier for the estimated gas limit, defaults to 2.
     * `requiredConfirmations`: The number of confirmations required before considering the transaction confirmed. Default is 1.
     *
     * @throws {Error} - Throws an error if no wallet information is available, or the chain is unsupported.
     *
     * @returns {Promise<void>} - Returns a promise that resolves when the transaction is sent and all callbacks have been processed.
     */
    public async sendTransaction(
        transaction: PreparedTransactionRequest,
        {
            onReadyToSign,
            onBroadcast,
            onConfirm,
            gasMultiplier = 2n,
            requiredConfirmations = 1,
        }: TransactionOptions = {},
    ): Promise<void> {
        const chainId = this._walletInfo?.chainId

        if (!chainId)
            throw new Error(EthError.UNSUPPORTED_CHAIN)

        const signer = await this.getSigner()
        const gasLimit = (await signer.estimateGas(transaction)) * gasMultiplier

        onReadyToSign?.()

        const transactionResponse = await signer.sendTransaction({ ...transaction, gasLimit })

        await onBroadcast?.(transactionResponse)

        if (requiredConfirmations) {
            const receipt = await transactionResponse.wait(requiredConfirmations)

            await onConfirm?.(receipt)
        }
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

    private _handleWalletErrors(
        e: unknown,
        { onReject, onRequestAlreadyPending }: WalletErrorHandlers = {},
    ): void | Promise<void> {
        if (isEthersError(e)) {
            const providerErrorCode = isProviderError(e.error) ? e.error.code : undefined

            const actionRejected = e.code === EthersErrorCode.ACTION_REJECTED ||
                providerErrorCode === ProviderErrorCode.USER_REJECTED_REQUEST

            if (onReject && actionRejected)
                return onReject(e)

            const resourceUnavailable = providerErrorCode === ProviderErrorCode.RESOURCE_UNAVAILABLE

            if (onRequestAlreadyPending && resourceUnavailable)
                return onRequestAlreadyPending(e)
        }

        throw e
    }

    /**
     * Validates that the signer is correctly set up.
     *
     * If the signer is null, this function throws an error.
     *
     * @throws Will throw an error if the signer is null.
     */
    private async _validateSigner(signer: JsonRpcSigner): Promise<void> {
        if (!await signer.getAddress())
            throw new Error(EthError.SIGNER_UNAVAILABLE)
    }

    /**
     * Retrieves the currently connected wallet address.
     *
     * @returns {Promise<string>} - Returns a promise that resolves to the current wallet address.
     */
    private async _getWalletAddress(): Promise<string> {
        const accounts = await this.request({ method: 'eth_requestAccounts' })

        if (!accounts.length)
            throw new Error(EthError.SIGNER_UNAVAILABLE)

        return accounts[0].toLowerCase()
    }

    /**
     * Retrieves the chain that the wallet is currently connected to.
     *
     * @returns {Promise<number>} - Returns a promise that resolves to the current chainId.
     */
    private async _getWalletChainId(): Promise<ChainId | null> {
        if (!this._wrappedProvider)
            throw new Error(EthError.WALLET_NOT_CONNECTED)

        const chainId = (await this._wrappedProvider.getNetwork()).chainId

        return Chain.parseChainId(chainId, this.availableChainIds)
    }

    /**
     * Commits the current wallet info.
     *
     * This function emits a 'wallet-info' event with the current wallet info and stores the wallet info in the storage.
     */
    private _commit(): void {
        this._onWalletUpdate?.(this._walletInfo)
        this._storage.set(this._walletInfo)
    }

    /**
     * Updates the current address.
     *
     * This function is called when the 'accountsChanged' event is emitted from the provider. It updates the address property and emits a 'wallet-info' event with the updated wallet information.
     * When metamask unlocks this._walletInfo will be null, so we can't assume we have a walletInfo just because the address is available as an argument
     */
    private async _updateAddress(addresses: string[]): Promise<void> {
        const address = addresses[0]
        const walletApplication = this._walletInfo?.application || this._currentWalletApplication

        if (address && walletApplication) {
            const chain = this._walletInfo?.chainId || await this._getWalletChainId()

            this.walletInfo = new WalletInfo(
                walletApplication,
                chain,
                addresses[0],
                true,
            )
        }
        else {
            this.walletInfo = null
        }
    }

    /**
     * Updates the current chainId.
     *
     * This function is called when the 'chainChanged' event is emitted from the provider.
     * It updates the chainId property and emits a 'wallet-info' event with the updated wallet information.
     */
    private _updateChainId(chainId: string): void {
        if (!this._walletInfo)
            return

        this.walletInfo = this._walletInfo.withChain(
            Chain.parseChainId(chainId, this.availableChainIds),
        )
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
    private _addEventListener<T>(event: string, callback: (response: T) => void) {
        return this._nativeProvider?.on?.(event, response => callback.bind(this)(response))
    }
}
