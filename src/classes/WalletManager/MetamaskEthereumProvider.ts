export interface RequestArguments {
    method: string
    params?: unknown[] | Record<string, unknown>
}

export interface MetaMaskEthereumProvider {
    isMetaMask?: boolean

    once(eventName: string | symbol, listener: (...args: any[]) => void): this

    on(eventName: string | symbol, listener: (...args: any[]) => void): this

    off(eventName: string | symbol, listener: (...args: any[]) => void): this

    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this

    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this

    removeAllListeners(event?: string | symbol): this

    request<T>(args: RequestArguments): Promise<T>
}

// TODO: must be validated with other wallet applications, only tested with metamask
export interface ProviderError {
    code: number | string
    message: string
    reason: string | null
    errorName: string // options: 'Panic', ... // TODO maybe make an enum when options are known
}
