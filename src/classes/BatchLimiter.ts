export class BatchLimiter {
    private availableRequests: number // Amount of calls still available in the current interval
    private lastRefill: number // Timestamp of the last refill

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
