import { JsonRpcBatchProvider, JsonRpcProvider } from '@ethersproject/providers'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers } from 'ethers'
import { Store } from 'vuex'
import { Chain, chainInfos, ChainMapFactory } from '../../chain'
import { LocalStorage } from '../LocalStorage'
import { RpcProviderType, Web3Errors, WalletApplications } from './constants'
import { ExtendedExternalProvider, ExtendedWeb3Provider, IEthereumStore } from './interfaces'
import { WalletInfo } from './WalletInfo'

export class WalletProvider {
    private static readonly WALLET_LOCAL_STORAGE_KEY = 'ethereum/walletInfo'

    private readonly defaultChain: Chain
    private readonly availableChains: Chain[]
    private readonly store?: Store<IEthereumStore>

    private readonly jsonProviders: { [key in Chain]: JsonRpcProvider }
    private readonly batchProviders: { [key in Chain]: JsonRpcBatchProvider }
    private readonly storage: LocalStorage<WalletInfo | null>

    private initializedEvents = false
    private ethereum: ExtendedWeb3Provider | null = null
    private walletInfo: WalletInfo | null = null

    constructor({
        defaultChain,
        availableChains,
        store,
        customRpcs,
    }: {
        defaultChain: Chain
        availableChains: Chain[]
        store?: Store<IEthereumStore>
        customRpcs?: { [chain in Chain]?: string }
    }) {
        const chainMapFactory = new ChainMapFactory(availableChains)

        this.defaultChain = defaultChain
        this.availableChains = availableChains
        this.store = store

        this.jsonProviders = chainMapFactory.create((chain: Chain) => new JsonRpcProvider(customRpcs?.[chain] || chainInfos[chain].rpc))
        this.batchProviders = chainMapFactory.create((chain: Chain) => new JsonRpcBatchProvider(customRpcs?.[chain] || chainInfos[chain].rpc))
        this.storage = new LocalStorage<WalletInfo | null>(
            WalletProvider.WALLET_LOCAL_STORAGE_KEY,
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
        const provider = await detectEthereumProvider() as ExtendedExternalProvider

        if (!provider)
            throw new Error(Web3Errors.PROVIDER_UNAVAILABLE)

        this.ethereum = new ethers.providers.Web3Provider(provider, 'any') as ExtendedWeb3Provider

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

    public getProvider({
        chain,
        rpcProviderType,
    }: {
        chain?: Chain
        rpcProviderType?: RpcProviderType
    } = {}) {
        if (!chain || !this.availableChains.includes(chain))
            chain = this.getValidChain()

        if (rpcProviderType === RpcProviderType.JSON)
            return this.jsonProviders[chain]

        return this.batchProviders[chain]
    }

    public async getSigner(requireChain = true) {
        if (!this.ethereum)
            throw new Error(Web3Errors.SIGNER_UNAVAILABLE)

        let signer

        try {
            signer = this.ethereum.getSigner()
        }
        catch (e) {
            if ((e as Error)?.message?.includes('unknown account'))
                throw new Error(Web3Errors.SIGNER_UNAVAILABLE)

            throw e
        }

        if (requireChain && !this.availableChains.includes(await this.getWalletChain()))
            throw new Error(Web3Errors.UNSUPPORTED_CHAIN)

        if (!await signer.getAddress())
            throw new Error(Web3Errors.SIGNER_UNAVAILABLE)

        return signer
    }

    public async request({ method, params }: { method: string, params?: object[] }) {
        if (!this.ethereum)
            throw new Error(Web3Errors.WALLET_NOT_CONNECTED)

        if (!this.ethereum.provider.request)
            throw new Error(Web3Errors.UNSUPPORTED_REQUEST)

        return await this.ethereum.provider.request({
            method,
            params,
        })
    }

    private async getWalletAddress(): Promise<string> {
        return (await this.request({ method: 'eth_requestAccounts' }))[0].toLowerCase()
    }

    private async getWalletChain(): Promise<Chain> {
        if (!this.ethereum)
            throw new Error(Web3Errors.WALLET_NOT_CONNECTED)

        return (await this.ethereum?.getNetwork())?.chainId as Chain
    }

    private getValidChain() {
        const walletChain = this.walletInfo?.chain

        if (walletChain && this.availableChains.includes(walletChain))
            return walletChain

        return this.defaultChain
    }

    private commit() {
        if (this.store)
            this.store.commit(WalletProvider.WALLET_LOCAL_STORAGE_KEY, this.walletInfo)

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
