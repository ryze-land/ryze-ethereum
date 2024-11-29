import {
    ContractRunner,
    JsonRpcProvider,
    TransactionRequest,
    TransactionResponse,
} from 'ethers'
import { CircularArray } from './CircularArray'

export class MultiRpcProvider implements ContractRunner {
    private providers: CircularArray<JsonRpcProvider>

    constructor(
        providers: string[],
        { batchMaxCount }: { batchMaxCount?: number },
    ) {
        this.providers = new CircularArray(
            providers.map(provider => new JsonRpcProvider(provider, undefined, { batchMaxCount })),
        )
    }

    public get provider(): JsonRpcProvider {
        return this.providers.next()
    }

    public async estimateGas(tx: TransactionRequest): Promise<bigint> {
        return await this.provider.estimateGas(tx)
    }

    // TODO further testing is required to handle errors in case of inconsistent rpcs being added
    public async call(tx: TransactionRequest): Promise<string> {
        return await this.provider.call(tx)
    }

    public async resolveName(name: string): Promise<null | string> {
        return await this.provider.resolveName(name)
    }

    public sendTransaction(_: TransactionRequest): Promise<TransactionResponse> {
        throw new Error('MultiProvider cannot send transactions')
    }
}
