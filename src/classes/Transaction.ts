import { JsonRpcSigner, PreparedTransactionRequest } from 'ethers'

export class Transaction {
    public constructor(
        public readonly transaction: PreparedTransactionRequest,
        public readonly signer: JsonRpcSigner,
    ) {
    }

    public static async initialize(
        transaction: PreparedTransactionRequest,
        signer: JsonRpcSigner,
        gasMultiplier: bigint,
    ) {
        const gasLimit = (await signer.estimateGas(transaction)) * gasMultiplier

        return new Transaction(
            {
                ...transaction,
                gasLimit,
            },
            signer,
        )
    }

    public send() {
        return this.signer.sendTransaction(this.transaction)
    }
}
