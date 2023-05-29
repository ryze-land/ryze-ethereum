import { Chain, EthError } from '../enums'

export class ChainInfo {
    constructor(
        public readonly id: Chain,
        public readonly name: string,
        public readonly testnet: boolean,
        public readonly currency: {
            name: string
            symbol: string
        },
        public readonly explorer: string,
        public readonly rpcList: string[],
    ) {
        if (rpcList.length === 0)
            throw new Error(EthError.INVALID_CHAIN_CONFIG)
    }

    public get rpc(): string {
        return this.rpcList[0]
    }
}
