import { BrowserConnector, type WindowProvider } from './BrowserConnector'

export class TrustWallet extends BrowserConnector {
    public readonly id = 'trustwallet'
    public readonly name: string = 'Trust Wallet'

    public getProvider() {
        if (typeof window === 'undefined') return

        const { ethereum, trustwallet } = (window as unknown as {
            ethereum?: WindowProvider,
            trustwallet?: WindowProvider
        })

        if (ethereum?.providers)
            return ethereum.providers.find(ethereum => ethereum.isTrust)

        return ethereum?.isTrust ? ethereum : trustwallet
    }
}
