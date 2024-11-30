import {
    ContractRunner,
    JsonRpcProvider,
    TransactionRequest,
    TransactionResponse,
} from 'ethers'
import { CircularArray } from '../CircularArray'
import { BatchLimiter } from '../BatchLimiter'
import { getSingleRpcProvider } from './get-rpc-provider'

export class MultiRpcProvider implements ContractRunner {
    private providers: CircularArray<JsonRpcProvider>

    constructor(
        providers: string[],
        options: { batchMaxCount?: number, limiter?: BatchLimiter},
    ) {
        this.providers = new CircularArray(providers.map(provider => getSingleRpcProvider(provider, options)))
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
