import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { WalletInfo } from './WalletInfo'

export interface IEthereumStore {
    ethereum: {
        walletInfo: WalletInfo | null
    }
}

export interface ExtendedExternalProvider extends ExternalProvider {
    on: (event: string, callback: () => void) => void
    removeListener: (event: string, callback: () => void) => void
}

export interface ExtendedWeb3Provider extends Web3Provider {
    provider: ExtendedExternalProvider
}
