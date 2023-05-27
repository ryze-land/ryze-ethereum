import detectEthereumProvider from '@metamask/detect-provider'
import { JsonRpcProvider, BrowserProvider, JsonRpcSigner, Eip1193Provider } from 'ethers'
import { Chain, chainInfos, ChainMapFactory, parseChain } from '../../chain'
import { LocalStorage } from '../LocalStorage'
import { MultiRpcProvider } from '../MultiRpcProvider'
import { Web3Errors, WalletApplications } from './constants'
import { WalletInfo } from './WalletInfo'
import { EventEmitter } from 'events'

export class WalletProvider {
    public readonly events = new EventEmitter()

    private readonly walletStorageKey: string
    private readonly defaultChain: Chain
    private readonly availableChains: Chain[]

    private readonly providers: { [key in Chain]: MultiRpcProvider | JsonRpcProvider }
    private readonly storage: LocalStorage<WalletInfo | null>

    private initializedEvents = false
    private ethereum: BrowserProvider | null = null
    private walletInfo: WalletInfo | null = null

    constructor({
        defaultChain,
        availableChains,
        customRpcs,
        walletStorageKey,
    }: {
        defaultChain: Chain
        availableChains: Chain[]
        customRpcs?: { [chain in Chain]?: string | string[] }
        walletStorageKey?: string,
    }) {
        const chainMapFactory = new ChainMapFactory(availableChains)

        this.defaultChain = defaultChain
        this.availableChains = availableChains
        this.walletStorageKey = walletStorageKey || 'ethereum/walletInfo'

        this.providers = chainMapFactory.create((chain: Chain) => {
            const chainInfo = chainInfos[chain]
            const rpc = customRpcs?.[chain] || chainInfo.rpcList || chainInfo.rpc

            return typeof rpc === 'string'
                ? new JsonRpcProvider(rpc)
                : new MultiRpcProvider(rpc)
        })

        this.storage = new LocalStorage<WalletInfo | null>(
            this.walletStorageKey,
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

    public async connect(walletApplication: WalletApplications) {
        const provider = await detectEthereumProvider<Eip1193Provider>()

        if (!provider)
            throw new Error(Web3Errors.PROVIDER_UNAVAILABLE)

        this.ethereum = new BrowserProvider(provider)

        if (!this.initializedEvents) {
            this._addEventListener('accountsChanged', this._updateAddress)
            this._addEventListener('chainChanged', this._updateChain)

            this.initializedEvents = true
        }

        this.walletInfo = new WalletInfo(
            walletApplication,
            await this.getWalletChain(),
            await this.getWalletAddress(),
            true,
        )

        this.commit()
    }

    public async reconnect() {
        if (this.walletInfo)
            return

        const walletInfo = this.storage.get()

        if (walletInfo) {
            this.walletInfo = new WalletInfo(
                walletInfo.provider,
                walletInfo.chain,
                walletInfo.address,
                false,
            )

            this.commit()

            return this.connect(walletInfo.provider)
        }

        // TODO maybe switch to persisted chain and address
    }

    public getWalletInfo() {
        return this.walletInfo || this.storage.get()
    }

    public disconnect() {
        this.walletInfo = null
        this.commit()
    }

    public getProvider(chain: Chain) {
        return this.providers[chain]
    }

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

    private async _validateSigner(signer: JsonRpcSigner, requiredChain?: Chain) {
        if (requiredChain) {
            const signerChain = await this.getWalletChain()

            if (signerChain !== requiredChain)
                throw new Error(Web3Errors.UNSUPPORTED_CHAIN)
        }

        if (!await signer.getAddress())
            throw new Error(Web3Errors.SIGNER_UNAVAILABLE)
    }

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

    private async getWalletAddress(): Promise<string> {
        return (await this.request({ method: 'eth_requestAccounts' }))[0].toLowerCase()
    }

    private async getWalletChain(): Promise<Chain> {
        if (!this.ethereum)
            throw new Error(Web3Errors.WALLET_NOT_CONNECTED)

        const chain = (await this.ethereum.getNetwork()).chainId

        return parseChain(chain) as Chain
    }

    private getValidChain() {
        const walletChain = this.walletInfo?.chain

        if (walletChain && this.availableChains.includes(walletChain))
            return walletChain

        return this.defaultChain
    }

    private commit() {
        this.events.emit('wallet-info', this.walletInfo)
        this.storage.set(this.walletInfo)
    }

    private async _updateAddress() {
        if (!this.walletInfo)
            return

        this.walletInfo = new WalletInfo(
            this.walletInfo.provider,
            this.walletInfo.chain,
            await this.getWalletAddress(),
            true,
        )

        this.commit()
    }

    private async _updateChain() {
        if (!this.walletInfo)
            return

        this.walletInfo = new WalletInfo(
            this.walletInfo.provider,
            await this.getWalletChain(),
            this.walletInfo.address,
            true,
        )

        this.commit()
    }

    private _addEventListener(event: string, callback: () => void) {
        this.ethereum?.provider.on && this.ethereum.provider.on(event, () => callback.bind(this)())
    }
}
