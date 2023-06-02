import { JsonRpcProvider } from 'ethers'
import { blockchainIndex } from '../assets'
import { ChainId } from '../enums'
import { Chain } from './Chain'
import { MultiRpcProvider } from './MultiRpcProvider'
import { OnWalletUpdate, WalletManager } from './WalletManager'

export class Ethereum {
    public readonly defaultChain: ChainId
    public readonly availableChains: ChainId[]
    public readonly walletManager: WalletManager
    private readonly _providers: Record<ChainId, MultiRpcProvider | JsonRpcProvider>

    constructor({
        defaultChain,
        availableChains,
        chainToRpcMap,
        onWalletUpdate,
    }: {
        defaultChain: ChainId
        availableChains: ChainId[]
        chainToRpcMap?: Partial<Record<ChainId, string[]>>
        onWalletUpdate?: OnWalletUpdate
    }) {
        this.defaultChain = defaultChain
        this.availableChains = availableChains
        this.walletManager = new WalletManager(defaultChain, availableChains, onWalletUpdate)

        this._providers = Chain.createChainMap({
            chains: availableChains,
            initialValueCallback: (chain: ChainId) => {
                const chainInfo = blockchainIndex[chain]
                const rpcs = chainToRpcMap?.[chain] || chainInfo.rpcList

                return rpcs.length === 1
                    ? new JsonRpcProvider(rpcs[0])
                    : new MultiRpcProvider(rpcs)
            },
        })
    }

    public validateChain(chain: ChainId | number | string | bigint): chain is ChainId {
        return !!Chain.parseChainId(chain, this.availableChains)
    }

    /**
     * Returns a provider for the specified chain.
     *
     * @param chain - The chain for which to get a provider.
     */
    public getProvider(chain: ChainId) {
        return this._providers[chain]
    }
}
