import { AbstractProvider, JsonRpcSigner, PreparedTransactionRequest } from 'ethers'

export class Transaction {
    /**
     * Constructs a new Transaction instance.
     *
     * @param transaction - PreparedTransactionRequest object containing transaction details.
     * @param signer - Signer object to sign and send the transaction.
     */
    public constructor(
        public readonly transaction: PreparedTransactionRequest,
        public readonly signer: JsonRpcSigner,
    ) {
    }

    /**
     * Asynchronously initializes a Transaction instance, with the gas limit determined
     * by applying the provided gas multiplier to the signer's estimated gas limit.
     *
     * @param transaction - PreparedTransactionRequest object containing transaction details.
     * @param signer - Signer object used to estimate gas and sign the transaction.
     * @param gasMultiplier - A factor used to adjust the estimated gas limit for the transaction.
     *                        The value is represented in thousandths, where 1_000 means no adjustment
     *                        (i.e., actual estimated gas limit), and 2_000 doubles the gas limit.
     * @returns - A promise that resolves to a new Transaction instance.
     */
    public static async initialize(
        transaction: PreparedTransactionRequest,
        signer: JsonRpcSigner,
        gasMultiplier: bigint,
    ): Promise<Transaction> {
        const from = await signer.getAddress()
        const transactionWithSender = {
            ...transaction,
            from,
        }

        return new Transaction(
            {
                ...transactionWithSender,
                gasLimit: await Transaction.estimateGas(
                    transactionWithSender,
                    signer.provider,
                    gasMultiplier,
                ),
            },
            signer,
        )
    }

    /**
     * Estimates the gas limit for a transaction using a provider and applies a specified multiplier.
     *
     * @param transaction - PreparedTransactionRequest object containing transaction details.
     * @param provider - Provider object used to estimate the gas limit.
     * @param gasMultiplier - A factor used to adjust the estimated gas limit for the transaction.
     *                        The value is represented in thousandths, where 1_000 means no adjustment
     *                        (i.e., actual estimated gas limit), and 2_000 doubles the gas limit.
     * @returns - A promise that resolves to the calculated gas limit.
     */
    public static async estimateGas(
        transaction: PreparedTransactionRequest,
        provider: AbstractProvider,
        gasMultiplier: bigint,
    ): Promise<bigint> {
        return (await provider.estimateGas(transaction)) * gasMultiplier / 1_000n
    }

    /**
     * Sends the transaction using the signer provided during the initialization.
     *
     * @returns - A promise that resolves to the transaction receipt upon successful transaction.
     */
    public send() {
        return this.signer.sendTransaction(this.transaction)
    }

    /**
     * Calls the transaction using the signer provided during the initialization.
     * This does not send a real Ethereum transaction, but simulates a transaction call
     * and returns the result of the call, which can be useful for reading data from a contract.
     *
     * @param overrides - Optional PreparedTransactionRequest object containing any overrides for the call.
     * @returns - A promise that resolves to the result of the transaction call.
     */
    public call(overrides: PreparedTransactionRequest = {}) {
        return this.signer.call({
            ...this.transaction,
            ...overrides,
        })
    }
}
