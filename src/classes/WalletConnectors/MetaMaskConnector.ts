import { BrowserConnector } from './BrowserConnector'

export class MetaMaskConnector extends BrowserConnector {
    public readonly id = 'metamask'
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
