import { BrowserConnector, type WindowProvider } from './BrowserConnector'

export class BinanceWallet extends BrowserConnector {
    public readonly id: string = 'binancewallet'
    public readonly name: string = 'Binance Wallet'

    public getProvider() {
        const window = this._window<{ BinanceChain?: WindowProvider }>()

        return window?.BinanceChain
    }
}
