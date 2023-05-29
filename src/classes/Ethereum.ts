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
    private readonly _providers: Record<Chain, MultiRpcProvider | JsonRpcProvider>

    constructor({
        defaultChain,
        availableChains,
        chainToRpcMap,
        onWalletUpdate,
    }: {
        defaultChain: Chain
        availableChains: Chain[]
        chainToRpcMap?: Partial<Record<Chain, string[]>>
        onWalletUpdate?: OnWalletUpdate
    }) {
        this.defaultChain = defaultChain
        this.availableChains = availableChains
        this.walletManager = new WalletManager(defaultChain, availableChains, onWalletUpdate)

        this._providers = new ChainMapFactory(availableChains).create((chain: Chain) => {
            const chainInfo = chainInfos[chain]
            const rpcs = chainToRpcMap?.[chain] || chainInfo.rpcList

            return rpcs.length === 1
                ? new JsonRpcProvider(rpcs[0])
                : new MultiRpcProvider(rpcs)
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
        return this._providers[chain]
    }
}
