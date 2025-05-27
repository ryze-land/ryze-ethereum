import type { JsonRpcProvider, PreparedTransactionRequest, Provider } from 'ethers'
import { chainRegistry } from '../assets'
import { allChainIds, ChainId } from '../constants'
import { Chain, type ChainMap } from './Chain'
import { MultiRpcProvider, getSingleRpcProvider } from './Providers'
import { Transaction } from './Transaction'
import { OnWalletUpdate, WalletManager } from './WalletManager'
import type { WalletConnector } from './WalletConnectors'
import { BatchLimiter, BatchLimiterModes, type BatchLimiterOptions } from './BatchLimiter'

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
     * @param limiter - Optional BatchLimiter to be used when performing rpc requests.
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
        limiterOptions,
        gasMultiplier = 2_000n,
    }: {
        defaultChainId: ChainId
        availableChainIds: readonly ChainId[]
        connectors?: WalletConnector[],
        chainToRpcMap?: ChainMap<string[]>
        onWalletUpdate?: OnWalletUpdate
        batchMaxCount?: number
        limiterOptions?: BatchLimiterOptions
        gasMultiplier?: bigint
    }) {
        this.defaultChainId = defaultChainId
        this.availableChainIds = availableChainIds
        this.walletManager = new WalletManager({ defaultChainId, connectors, onWalletUpdate })
        this.gasMultiplier = gasMultiplier

        let limiter = limiterOptions && (limiterOptions.mode === BatchLimiterModes.SHARED_LIMITER || !limiterOptions.mode)
            ? new BatchLimiter(limiterOptions.requestsPerInterval, limiterOptions.interval)
            : undefined

        this._providers = Chain.createChainMap({
            chainIds: allChainIds,
            initialValueCallback: (chainId: ChainId) => {
                const chain = chainRegistry[chainId]
                const rpcs = chainToRpcMap?.[chainId] || chain.rpcList

                if (limiterOptions?.mode === BatchLimiterModes.PRIVATE_LIMITER)
                    limiter = new BatchLimiter(limiterOptions.requestsPerInterval, limiterOptions.interval)

                return rpcs.length === 1
                    ? getSingleRpcProvider(rpcs[0], { batchMaxCount, limiter })
                    : new MultiRpcProvider(rpcs, { batchMaxCount, limiter })
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
     * @param provider - Optional. A specific provider to use for estimating gas.
     */
    public async initializeTransaction(
        preparedTransactionRequest: PreparedTransactionRequest,
        gasMultiplier?: bigint,
        provider?: Provider,
    ): Promise<Transaction> {
        return Transaction.initialize(
            preparedTransactionRequest,
            await this.walletManager.getSigner(),
            gasMultiplier || this.gasMultiplier,
            provider,
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
