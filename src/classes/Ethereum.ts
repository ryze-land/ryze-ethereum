import { JsonRpcProvider, PreparedTransactionRequest } from 'ethers'
import { chainRegistry } from '../assets'
import { ChainId } from '../enums'
import { Chain } from './Chain'
import { MultiRpcProvider } from './MultiRpcProvider'
import { Transaction } from './Transaction'
import { OnWalletUpdate, WalletManager } from './WalletManager'

export class Ethereum {
    public readonly defaultChainId: ChainId
    public readonly availableChainIds: ChainId[]
    public readonly walletManager: WalletManager
    public readonly gasMultiplier: bigint
    private readonly _providers: Record<ChainId, MultiRpcProvider | JsonRpcProvider>

    constructor({
        defaultChainId,
        availableChainIds,
        chainToRpcMap,
        onWalletUpdate,
        gasMultiplier = 2n,
    }: {
        defaultChainId: ChainId
        availableChainIds: ChainId[]
        chainToRpcMap?: Partial<Record<ChainId, string[]>>
        onWalletUpdate?: OnWalletUpdate
        gasMultiplier?: bigint
    }) {
        this.defaultChainId = defaultChainId
        this.availableChainIds = availableChainIds
        this.walletManager = new WalletManager(defaultChainId, availableChainIds, onWalletUpdate)
        this.gasMultiplier = gasMultiplier

        this._providers = Chain.createChainMap({
            chainIds: availableChainIds,
            initialValueCallback: (chainId: ChainId) => {
                const chain = chainRegistry[chainId]
                const rpcs = chainToRpcMap?.[chainId] || chain.rpcList

                return rpcs.length === 1
                    ? new JsonRpcProvider(rpcs[0])
                    : new MultiRpcProvider(rpcs)
            },
        })
    }

    public async transaction(transaction: PreparedTransactionRequest) {
        return Transaction.initialize(
            transaction,
            await this.walletManager.getSigner(),
            this.gasMultiplier,
        )
    }

    public validateChain(chain: ChainId | number | string | bigint): chain is ChainId {
        return !!Chain.parseChainId(chain, this.availableChainIds)
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
