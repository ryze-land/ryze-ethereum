// Specifies if the limit should be shared among all chains or if each chain should have its own limit.
export const BatchLimiterModes = {
    // each chain gets its own limiter, meaning it won't interfere with other chains
    PRIVATE_LIMITER: 'PRIVATE_LIMITER',
    // shares the limit across all chains
    SHARED_LIMITER: 'SHARED_LIMITER',
} as const

// Specifies if the limit should be shared among all chains or if each chain should have its own limit.
export type BatchLimiterMode = typeof BatchLimiterModes[keyof typeof BatchLimiterModes]

export type BatchLimiterOptions = {
    requestsPerInterval: number
    interval: number
    mode?: BatchLimiterMode
}

export class BatchLimiter {
    private availableRequests: number // Amount of calls still available in the current interval
    private lastRefill: number // Timestamp of the last refill

    /**
     * Creates an instance of BatchLimiter.
     *
     * @param requestsPerInterval - The number of requests allowed per interval.
     * @param interval - The duration of the interval in milliseconds.
     */
    constructor(
        private readonly requestsPerInterval: number,
        private readonly interval: number,
    ) {
        this.availableRequests = requestsPerInterval
        this.lastRefill = Date.now()
    }

    private get timeUntilNextRefill(): number {
        return Math.max(this.interval - (Date.now() - this.lastRefill), 0)
    }

    public consumeLimit(): Promise<void> {
        return new Promise(resolve => {
            const tryRequest = () => {
                const now = Date.now()

                // Refill requests if the interval has passed
                if (now - this.lastRefill >= this.interval) {
                    this.availableRequests = this.requestsPerInterval
                    this.lastRefill = now
                }

                // Allow request if available
                if (this.availableRequests > 0) {
                    this.availableRequests -= 1
                    resolve()
                }
                else {
                    // Retry after a short delay if requests are exhausted
                    setTimeout(tryRequest, this.timeUntilNextRefill)
                }
            }

            tryRequest()
        })
    }
}
