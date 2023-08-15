import { type Eip1193Provider } from 'ethers'
import { WalletConnector } from './WalletConnector'

export interface WindowProvider extends Eip1193Provider {
    isMetaMask?: boolean
    isTrust?: boolean
    isSafePal?: boolean
    isBitKeep?: boolean
    providers?: WindowProvider[]
}

export class BrowserConnector extends WalletConnector<WindowProvider | undefined> {
    public readonly id: string = 'browserConnector'
    public readonly name: string = 'Browser Wallet'

    public getProvider() {
        if (typeof window === 'undefined') return

        const ethereum = (window as unknown as { ethereum?: WindowProvider })
            .ethereum

        if (ethereum?.providers) return ethereum.providers[0]

        return ethereum
    }
}
