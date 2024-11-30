import { JsonRpcProvider, TransactionRequest } from 'ethers'
import { BatchLimiter } from '../BatchLimiter'

export class LimitedRpcProvider extends JsonRpcProvider {
    private readonly limiter: BatchLimiter

    constructor(
        url: string,
        limiter: BatchLimiter,
        options?: { batchMaxCount?: number },
    ) {
        super(url, undefined, { batchMaxCount: options?.batchMaxCount })
        this.limiter = limiter
    }

    async send(method: string, params: Array<any> | Record<string, any>): Promise<any> {
        await this.limiter.consumeLimit()

        return super.send(method, params)
    }

    public async call(tx: TransactionRequest): Promise<string> {
        await this.limiter.consumeLimit()

        return super.call(tx)
    }
}
