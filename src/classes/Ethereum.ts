import { WalletProvider, IEthereumStore } from './WalletProvider'
import { Store } from 'vuex'
import { Chain } from '../chain'

export class Ethereum {
    public readonly defaultChain: Chain
    public readonly availableChains: Chain[]
    public readonly walletProvider: WalletProvider

    constructor({
        defaultChain,
        availableChains,
        store,
        customRpcs,
    }: {
        defaultChain: Chain
        availableChains: Chain[]
        store?: Store<IEthereumStore>
        customRpcs?: { [chain in Chain]?: string }
    }) {
        this.defaultChain = defaultChain
        this.availableChains = availableChains
        this.walletProvider = new WalletProvider({
            defaultChain,
            availableChains,
            store,
            customRpcs,
        })
    }

    validateChain(chain: Chain | number): chain is Chain {
        return this.availableChains.includes(chain as Chain)
    }
}
