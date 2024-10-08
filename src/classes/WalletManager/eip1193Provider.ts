import { Eip1193Provider } from 'ethers'

export interface EIP1193Provider extends Eip1193Provider {
    on(eventName: string | symbol, listener: (...args: any[]) => void): this

    addListener?(eventName: string | symbol, listener: (...args: any[]) => void): this

    removeListener?(eventName: string | symbol, listener: (...args: any[]) => void): this

    removeAllListeners?(event?: string | symbol): this
}
