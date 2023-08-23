import { BrowserConnector } from './BrowserConnector'

export class SafePalWallet extends BrowserConnector {
    public readonly id: string = 'safepalwallet'
    public readonly name: string = 'SafePal Wallet'

    public getProvider() {
        const window = this._window()

        if (!window) return

        const ethereum = window.ethereum

        if (ethereum?.providers)
            return ethereum.providers.find(_ethereum => _ethereum?.isSafePal)

        return ethereum?.isSafePal ? ethereum : undefined
    }
}
