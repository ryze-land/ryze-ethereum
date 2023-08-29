import { BrowserConnector, type WindowProvider } from './BrowserConnector'

export class TrustWalletConnector extends BrowserConnector {
    public readonly id = 'trustwallet'
    public readonly name: string = 'Trust Wallet'

    public getProvider() {
        const window = this._window<{ trustwallet?: WindowProvider }>()

        if (!window) return

        const { ethereum, trustwallet } = window

        if (ethereum?.providers)
            return ethereum.providers.find(ethereum => ethereum.isTrust)

        return ethereum?.isTrust ? ethereum : trustwallet
    }
}
