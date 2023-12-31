import { BrowserConnector, type WindowProvider } from './BrowserConnector'

// Previously known as BitKeep
export class BitgetConnector extends BrowserConnector {
    public readonly id: string = 'bitget'
    public readonly name: string = 'Bitget Wallet'

    public getProvider() {
        const window = this._window<{ bitkeep?: { ethereum: WindowProvider } }>()

        if (!window) return

        const { bitkeep, ethereum } = window

        if (ethereum?.providers)
            return ethereum.providers.find(_ethereum => _ethereum.isBitKeep)

        return ethereum?.isBitKeep ? ethereum : bitkeep?.ethereum
    }
}
