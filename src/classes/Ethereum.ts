import { WalletProvider } from './WalletProvider'
import { Chain } from '../chain'

export class Ethereum {
    public readonly defaultChain: Chain
    public readonly availableChains: Chain[]
    public readonly walletProvider: WalletProvider

    constructor({
        defaultChain,
        availableChains,
        customRpcs,
    }: {
        defaultChain: Chain
        availableChains: Chain[]
        customRpcs?: { [chain in Chain]?: string | string[] }
    }) {
        this.defaultChain = defaultChain
        this.availableChains = availableChains
        this.walletProvider = new WalletProvider({
            defaultChain,
            availableChains,
            customRpcs,
        })
    }

    validateChain(chain: Chain | number): chain is Chain {
        return this.availableChains.includes(chain as Chain)
    }
}
