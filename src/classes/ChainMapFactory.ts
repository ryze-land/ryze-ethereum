import { allChains } from '../assets'
import { Chain } from '../enums'

const emptyObjectCallback = <T>() => ({} as T)

export class ChainMapFactory {
    public constructor(public readonly chains: Chain[] = allChains) {
    }

    public create<T>(initialValueCallback: (chain: Chain) => T = emptyObjectCallback) {
        return this.chains.reduce(
            (acc, curr) => ({ ...acc, [curr]: initialValueCallback(curr) }),
            {} as { [chain in Chain]: T },
        )
    }
}
