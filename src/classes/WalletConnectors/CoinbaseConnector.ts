import { BrowserConnector } from './BrowserConnector'

export class CoinbaseConnector extends BrowserConnector {
    public static readonly id = 'coinbase'
    public readonly name: string = 'Coinbase Wallet'

    public getProvider() {
        const window = this._window()

        if (!window) return

        const ethereum = window.ethereum

        if (ethereum?.providers)
            return ethereum.providers.find(_ethereum => _ethereum?.isCoinbaseWallet)

        return ethereum?.isCoinbaseWallet ? ethereum : undefined
    }
}
