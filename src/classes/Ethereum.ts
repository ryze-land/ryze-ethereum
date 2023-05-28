import { JsonRpcProvider } from 'ethers'
import { chainInfos } from '../assets'
import { Chain } from '../enums'
import { ChainMapFactory } from './ChainMapFactory'
import { MultiRpcProvider } from './MultiRpcProvider'
import { OnWalletUpdate, WalletManager } from './WalletManager'

export class Ethereum {
    public readonly defaultChain: Chain
    public readonly availableChains: Chain[]
    public readonly walletManager: WalletManager

    private readonly providers: Record<Chain, MultiRpcProvider | JsonRpcProvider>

    constructor({
        defaultChain,
        availableChains,
        customRpcs,
        onWalletUpdate,
    }: {
        defaultChain: Chain
        availableChains: Chain[]
        customRpcs?: Partial<Record<Chain, string | string[]>>
        onWalletUpdate?: OnWalletUpdate
    }) {
        this.defaultChain = defaultChain
        this.availableChains = availableChains
        this.walletManager = new WalletManager(defaultChain, availableChains, onWalletUpdate)

        this.providers = new ChainMapFactory(availableChains).create((chain: Chain) => {
            const chainInfo = chainInfos[chain]
            const rpc = customRpcs?.[chain] || chainInfo.rpcList || chainInfo.rpc

            return typeof rpc === 'string'
                ? new JsonRpcProvider(rpc)
                : new MultiRpcProvider(rpc)
        })
    }

    public validateChain(chain: Chain | number): chain is Chain {
        return this.availableChains.includes(chain as Chain)
    }

    /**
     * Returns a provider for the specified chain.
     *
     * @param chain - The chain for which to get a provider.
     */
    public getProvider(chain: Chain) {
        return this.providers[chain]
    }
}
