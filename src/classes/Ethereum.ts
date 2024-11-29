import { JsonRpcProvider, PreparedTransactionRequest } from 'ethers'
import { chainRegistry } from '../assets'
import { allChainIds, ChainId } from '../constants'
import { Chain, type ChainMap } from './Chain'
import { MultiRpcProvider } from './MultiRpcProvider'
import { Transaction } from './Transaction'
import { OnWalletUpdate, WalletManager } from './WalletManager'
import { type WalletConnector } from './WalletConnectors'

export class Ethereum {
    public readonly defaultChainId: ChainId
    public readonly availableChainIds: readonly ChainId[]
    public readonly walletManager: WalletManager
    public readonly gasMultiplier: bigint
    private readonly _providers: ChainMap<MultiRpcProvider | JsonRpcProvider>

    /**
     * Constructor for the Ethereum class.
     *
     * @param defaultChainId - The default ChainId to be used.
     * @param availableChainIds - Array of available ChainIds.
     * @param connectors - Optional array of WalletConnectors to be used.
     * @param chainToRpcMap - Optional mapping from ChainIds to RPC URLs.
     * @param onWalletUpdate - Optional callback to be invoked when the wallet updates.
     * @param batchMaxCount - Optional maximum number of requests to batch together.
     * @param gasMultiplier - Optional multiplier to be used when estimating the gas limit for transactions.
     *                        The value is represented in thousandths. A value of 1_000 denotes no multiplier
     *                        (i.e., actual gas limit), while a value of 2_000 means the gas limit is doubled.
     *                        If not provided, a default value of 2_000 is used.
     */
    constructor({
        defaultChainId,
        availableChainIds,
        connectors,
        chainToRpcMap,
        onWalletUpdate,
        batchMaxCount,
        gasMultiplier = 2_000n,
    }: {
        defaultChainId: ChainId
        availableChainIds: readonly ChainId[]
        connectors?: WalletConnector[],
        chainToRpcMap?: ChainMap<string[]>
        onWalletUpdate?: OnWalletUpdate
        batchMaxCount?: number
        gasMultiplier?: bigint
    }) {
        this.defaultChainId = defaultChainId
        this.availableChainIds = availableChainIds
        this.walletManager = new WalletManager({ defaultChainId, connectors, onWalletUpdate })
        this.gasMultiplier = gasMultiplier

        this._providers = Chain.createChainMap({
            chainIds: allChainIds,
            initialValueCallback: (chainId: ChainId) => {
                const chain = chainRegistry[chainId]
                const rpcs = chainToRpcMap?.[chainId] || chain.rpcList

                return rpcs.length === 1
                    ? new JsonRpcProvider(rpcs[0], undefined, { batchMaxCount })
                    : new MultiRpcProvider(rpcs, { batchMaxCount })
            },
        })
    }

    /**
     * Initializes a transaction based on the provided PreparedTransactionRequest.
     * The gas limit is estimated using the `gasMultiplier` which affects the final gas cost of the transaction.
     *
     * @param preparedTransactionRequest - The transaction details to initialize.
     * @param gasMultiplier - Optional. A factor used to adjust the estimated gas limit for the transaction.
     *                        The value is represented in thousandths, where 1_000 means no adjustment
     *                        (i.e., actual estimated gas limit), and 2_000 doubles the gas limit.
     *                        If not provided, the Ethereum instance's default gasMultiplier is used.
     */
    public async initializeTransaction(
        preparedTransactionRequest: PreparedTransactionRequest,
        gasMultiplier?: bigint,
    ): Promise<Transaction> {
        return Transaction.initialize(
            preparedTransactionRequest,
            await this.walletManager.getSigner(),
            gasMultiplier || this.gasMultiplier,
        )
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
