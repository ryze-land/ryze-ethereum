export interface RequestArguments {
    method: string
    params?: unknown[] | Record<string, unknown>
}

export interface EIP1193Provider {
    on(eventName: string | symbol, listener: (...args: any[]) => void): this

    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this

    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this

    removeAllListeners(event?: string | symbol): this

    request<T>(args: RequestArguments): Promise<T>
}
