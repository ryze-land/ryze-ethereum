import { type Eip1193Provider } from 'ethers'
import { WalletConnector } from './WalletConnector'

export interface WindowProvider extends Eip1193Provider {
    isMetaMask?: boolean
    isTrust?: boolean
    isSafePal?: boolean
    isBitKeep?: boolean
    isCoinbaseWallet?: boolean
    providers?: WindowProvider[]
}

export class BrowserConnector extends WalletConnector<WindowProvider | undefined> {
    public readonly id: string = 'browserConnector'
    public readonly name: string = 'Browser Wallet'

    public getProvider() {
        const window = this._window()

        if (!window) return

        const ethereum = window.ethereum

        if (ethereum?.providers) return ethereum.providers[0]

        return ethereum
    }

    protected _window<T>() {
        return window as unknown as ({ ethereum?: WindowProvider } & T) | undefined
    }
}
