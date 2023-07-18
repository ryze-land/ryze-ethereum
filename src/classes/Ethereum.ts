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

    /**
     * Multiplier used for estimating the gas limit for transactions.
     * The value is represented in thousandths.
     * A value of 1_000 denotes no multiplier (i.e., actual gas limit),
     * while a value of 2_000 means the gas limit is doubled.
     */
    public readonly gasMultiplier: bigint

    private readonly _providers: Record<ChainId, MultiRpcProvider | JsonRpcProvider>

    constructor({
        defaultChainId,
        availableChainIds,
        chainToRpcMap,
        onWalletUpdate,
        gasMultiplier = 2_000n, // multiplied by 1_000
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

    /**
     * Initializes a transaction with the given PreparedTransactionRequest.
     * If a custom gas multiplier is provided, it will be used for estimating
     * the gas limit; otherwise, the Ethereum instance's default gas multiplier
     * is applied. The gas multiplier is in thousandths. For instance,
     * a value of 1_000 represents no multiplier (i.e., actual gas limit),
     * while a value of 2_000 would double the gas limit.
     *
     * @param transaction - The PreparedTransactionRequest to initialize the transaction.
     * @param gasMultiplier - Custom multiplier to be used for gas limit estimation.
     */
    public async transaction(transaction: PreparedTransactionRequest, gasMultiplier?: bigint) {
        return Transaction.initialize(
            transaction,
            await this.walletManager.getSigner(),
            gasMultiplier || this.gasMultiplier,
        )
    }

    /**
     * Validates if a given chain is a valid ChainId.
     *
     * @param chain - The chain to validate.
     */
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
