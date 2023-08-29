import { BrowserProvider } from 'ethers'
import { EIP1193Provider } from '../WalletManager/eip1193Provider'
import { numberToHex } from '../../helpers'
import { ProviderErrorCode, isEthersError, isProviderError } from '../../errors'
import { ChainId, EthError } from '../../enums'
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
    public static readonly id: string = 'browserConnector'
    public readonly name: string = 'Browser Wallet'

    public getProvider() {
        const window = this._window()

        if (!window) return

        const ethereum = window.ethereum

        if (ethereum?.providers) return ethereum.providers[0]

        return ethereum
    }

    public async setChain(chainId: ChainId, provider: BrowserProvider): Promise<void> {
        try {
            await this.request(
                provider,
                'wallet_switchEthereumChain',
                [{ chainId: numberToHex(chainId) }],
            )
        }
        catch (e) {
            if (isEthersError(e) && isProviderError(e.error)) {
                // In case the chain is not registered in the user's wallet
                if (e.error.code === ProviderErrorCode.MISSING_REQUESTED_CHAIN ||
                    e.error.code === ProviderErrorCode.INTERNAL)
                    return await this.addChain(chainId, provider)
            }

            throw e
        }
    }

    public async addChain(chainId: ChainId, provider: BrowserProvider): Promise<void> {
        try {
            await this.request(
                provider,
                'wallet_addEthereumChain',
                [this._getAddChainParams(chainId)],
            )

            return await this.setChain(chainId, provider)
        }
        catch (e) {
            if (
                isEthersError(e) &&
                isProviderError(e.error) &&
                e.error.code === ProviderErrorCode.RESOURCE_UNAVAILABLE
            )
                throw new Error(EthError.REQUEST_ALREADY_PENDING)

            throw e
        }
    }

    protected _window<T>() {
        return window as unknown as ({ ethereum?: WindowProvider } & T) | undefined
    }
}
