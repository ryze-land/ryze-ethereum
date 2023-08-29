import { BrowserConnector } from './BrowserConnector'

export class MetaMaskWallet extends BrowserConnector {
    public static readonly id = 'metamask'
    public readonly name: string = 'MetaMask'

    public getProvider() {
        const window = this._window()

        if (!window) return

        const ethereum = window.ethereum

        if (ethereum?.providers)
            return ethereum.providers.find(_ethereum => _ethereum?.isMetaMask)

        return ethereum?.isMetaMask ? ethereum : undefined
    }
}
