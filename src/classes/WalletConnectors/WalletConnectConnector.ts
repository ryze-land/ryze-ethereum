import type WalletConnectProvider from '@walletconnect/ethereum-provider'
import { makeError } from 'ethers'
import { icons } from '../../assets/icons/icons'
import { ChainId, EthErrors } from '../../constants'
import { numberToHex } from '../../helpers'
import { EthersErrorCode } from '../../errors'
import { WalletConnector } from './WalletConnector'

type EthereumProviderOptions = Parameters<typeof WalletConnectProvider.init>[0];

type WalletConnectOptions = {
    /** Wallet Connect icon */
    icon?: string
    /**
     * Available chain IDs to switch.
     */
    chains: ChainId[]
    /**
     * WalletConnect Cloud Project ID.
     * @link https://cloud.walletconnect.com/sign-in.
     */
    projectId: string
    /**
     * Metadata for your app.
     * @link https://docs.walletconnect.com/2.0/advanced/providers/ethereum#initialization
     */
    metadata?: EthereumProviderOptions['metadata']
    /**
     * Whether to show the QR code modal.
     * @default true
     * @link https://docs.walletconnect.com/2.0/advanced/providers/ethereum#initialization
     */
    showQrModal?: boolean
    /**
     * Options of QR code modal.
     * @link https://docs.walletconnect.com/2.0/web/walletConnectModal/modal/options
     */
    qrModalOptions?: EthereumProviderOptions['qrModalOptions']
    /**
     * Option to override default relay url.
     * @link https://docs.walletconnect.com/2.0/web/providers/ethereum
     */
    relayUrl?: string
}

export class WalletConnectConnector extends WalletConnector {
    public readonly id: string = 'walletConnect'
    public readonly name: string = 'Wallet Connect'

    private readonly _options: Omit<WalletConnectOptions, 'icon'>
    private _provider?: WalletConnectProvider

    constructor({ icon, ...options }: WalletConnectOptions) {
        super({ icon: icon ?? icons.walletconnect })

        this._options = options
    }

    public async getProvider() {
        const { EthereumProvider } = await import('@walletconnect/ethereum-provider')

        const {
            chains,
            projectId,
            metadata,
            qrModalOptions,
            relayUrl,
            showQrModal = true,
        } = this._options

        const [defaultChain, ...optionalChains] = chains

        try {
            this._provider = await EthereumProvider.init({
                projectId,
                chains: [defaultChain],
                optionalChains,
                showQrModal,
                metadata,
                qrModalOptions,
                relayUrl,
            })

            const isChainsStale = this._isChainsStale(chains)

            // If there is an active session with stale chains, disconnect the current session.
            if (this._provider.session && isChainsStale) await this.disconnect()

            // If there is no active session, or the chains are stale, connect.
            if (!this._provider.session || isChainsStale) {
                await this._provider.connect({
                    chains: [defaultChain],
                    optionalChains: optionalChains.length ? optionalChains : undefined,
                })
            }

            // If session exists and chains are authorized, enable provider for required chain
            await this._provider.enable()

            return this._provider
        }
        catch (e) {
            const errorMessage = (e as Error).message.toLowerCase()

            if (errorMessage.includes('user rejected'))
                throw makeError('Connection rejected by the user', EthersErrorCode.ACTION_REJECTED)

            throw e
        }
    }

    public async setChain(chainId: ChainId): Promise<void> {
        const namespaceChains = this._getNamespaceChainsIds()
        const isChainApproved = namespaceChains.includes(chainId)

        if (!isChainApproved)
            await this.addChain(chainId)

        await this.request(
            this.provider,
            'wallet_switchEthereumChain',
            [{ chainId: numberToHex(chainId) }],
        )
    }

    public async addChain(chainId: ChainId): Promise<void> {
        await this.request(
            this.provider,
            'wallet_addEthereumChain',
            [this._getAddChainParams(chainId)],
        )

        await this.setChain(chainId)
    }

    public async disconnect() {
        try {
            await this.provider.disconnect()
        }
        catch (e) {
            /*
                Sometimes WC tries to use an old key/topic that it recovered
                from local storage but is not active anymore and throws an error.

                In this case we check the error by the message and handle the
                specific case mentioned above, otherwise the error is thrown again.
            */
            if (!(e as Error).message.includes('No matching key'))
                throw e
        }
    }

    private _getNamespaceChainsIds() {
        const namespaces = this._provider?.session?.namespaces

        if (!namespaces) return []

        const chainIds = namespaces.eip155?.chains
            ?.map(chain => parseInt(chain.split(':')[1] || ''))

        return chainIds ?? []
    }

    private get provider() {
        if (!this._provider)
            throw new Error(EthErrors.PROVIDER_UNAVAILABLE)

        return this._provider
    }

    /**
     * Checks if the target chains match the chains that were
     * initially requested by the connector for the WalletConnect session.
     * If there is a mismatch, this means that the chains on the connector
     * are considered stale, and need to be revalidated at a later point (via
     * connection).
     *
     * There may be a scenario where a dapp adds a chain to the
     * connector later on, however, this chain will not have been approved or rejected
     * by the wallet. In this case, the chain is considered stale.
     *
     * There are exceptions however:
     * -  If the wallet supports dynamic chain addition via `eth_addEthereumChain`,
     *    then the chain is not considered stale.
     *
     */
    private _isChainsStale(chains: ChainId[]) {
        const namespaceChains = this._getNamespaceChainsIds()

        return chains.every(id => namespaceChains.includes(id))
    }
}
