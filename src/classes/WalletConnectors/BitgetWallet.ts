import { BrowserConnector, type WindowProvider } from './BrowserConnector'

// Previously known as BitKeep
export class BitgetWallet extends BrowserConnector {
    public readonly id: string = 'bitgetwallet'
    public readonly name: string = 'Bitget Wallet'

    public getProvider() {
        if (typeof window === 'undefined') return

        const { bitkeep, ethereum } = (window as unknown as {
            ethereum?: WindowProvider
            bitkeep?: { ethereum: WindowProvider }
        })

        if (ethereum?.providers)
            return ethereum.providers.find(_ethereum => _ethereum.isBitKeep)

        return ethereum?.isBitKeep ? ethereum : bitkeep?.ethereum
    }
}
