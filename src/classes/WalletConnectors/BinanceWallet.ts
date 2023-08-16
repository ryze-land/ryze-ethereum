import { BrowserConnector, type WindowProvider } from './BrowserConnector'

export class BinanceWallet extends BrowserConnector {
    public readonly id: string = 'binancewallet'
    public readonly name: string = 'Binance Wallet'

    public getProvider() {
        if (typeof window === 'undefined') return

        const { BinanceChain } = (window as unknown as { BinanceChain?: WindowProvider })

        return BinanceChain
    }
}
