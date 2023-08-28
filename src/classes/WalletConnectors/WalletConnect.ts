import type { EthereumProviderOptions, EthereumProvider as WalletConnectProvider } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider'
import { icons } from '../../assets/icons/icons'
import { ChainId, EthError } from '../../enums'
import { numberToHex } from '../../helpers'
import { WalletConnector } from './WalletConnector'

type WalletConnectOptions = {
    /** Wallet Connect icon */
    icon?: string
    /**
     * Available chain IDs to switch.
     */
    chains: number[]
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
     * Whether or not to show the QR code modal.
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

export class WalletConnect extends WalletConnector {
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

        this._provider = await EthereumProvider.init({
            projectId,
            chains: [defaultChain],
            optionalChains,
            showQrModal,
            metadata,
            qrModalOptions,
            relayUrl,
        })

        try {
            await this._provider.connect()

            return this._provider
        }
        catch { }
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

    private _getNamespaceChainsIds() {
        const namespaces = this._provider?.session?.namespaces

        if (!namespaces) return []

        const chainIds = namespaces.eip155?.chains?.map(chain =>
            parseInt(chain.split(':')[1] || ''))

        return chainIds ?? []
    }

    private get provider() {
        if (!this._provider)
            throw new Error(EthError.PROVIDER_UNAVAILABLE)

        return this._provider
    }
}
