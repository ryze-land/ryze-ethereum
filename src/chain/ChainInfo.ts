import { Chain } from './chains'

export class ChainInfo {
    constructor(
        public readonly id: Chain,
        public readonly name: string,
        public readonly testnet: boolean,
        public readonly rpc: string,
        public readonly explorer: string,
        public readonly currency: {
            name: string
            symbol: string
        },
    ) {
    }
}
