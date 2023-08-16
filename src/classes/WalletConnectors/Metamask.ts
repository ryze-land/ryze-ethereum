import { BrowserConnector, type WindowProvider } from './BrowserConnector'

export class MetaMaskWallet extends BrowserConnector {
    public readonly id = 'metamask'
    public readonly name: string = 'MetaMask'

    public getProvider() {
        if (typeof window === 'undefined') return

        const { ethereum } = (window as unknown as { ethereum?: WindowProvider })

        if (ethereum?.providers)
            return ethereum.providers.find(_ethereum => _ethereum?.isMetaMask)

        return ethereum?.isMetaMask ? ethereum : undefined
    }
}
