import { BrowserConnector, type WindowProvider } from './BrowserConnector'

export class SafePalWallet extends BrowserConnector {
    public readonly id: string = 'safepalwallet'
    public readonly name: string = 'SafePal Wallet'

    public getProvider() {
        if (typeof window === 'undefined') return

        const { ethereum } = (window as unknown as { ethereum?: WindowProvider })

        if (ethereum?.providers)
            return ethereum.providers.find(_ethereum => _ethereum?.isSafePal)

        return ethereum?.isSafePal ? ethereum : undefined
    }
}
