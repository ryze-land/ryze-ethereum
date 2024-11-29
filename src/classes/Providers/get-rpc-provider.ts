import { JsonRpcProvider } from 'ethers'
import type { BatchLimiter } from '../BatchLimiter'
import { LimitedRpcProvider } from './LimitedRpcProvider'

export function getSingleRpcProvider(
    url: string,
    options: { batchMaxCount?: number, limiter?: BatchLimiter },
) {
    return options.limiter
        ? new LimitedRpcProvider(url, options.limiter, { batchMaxCount: options.batchMaxCount })
        : new JsonRpcProvider(url, undefined, { batchMaxCount: options.batchMaxCount })
}
