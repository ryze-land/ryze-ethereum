import { EIP1193Provider } from '../WalletManager/eip1193Provider'
import { WalletConnector } from './WalletConnector'

export interface WindowProvider extends EIP1193Provider {
    isMetaMask?: boolean
    isTrust?: boolean
    isSafePal?: boolean
    isBitKeep?: boolean
    isCoinbaseWallet?: boolean
    providers?: WindowProvider[]
}

export class BrowserConnector extends WalletConnector<WindowProvider> {
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
