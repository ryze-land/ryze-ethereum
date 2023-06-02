import { ChainId, WalletApplication } from '../enums'

export class WalletInfo {
    constructor(
        public readonly application: WalletApplication,
        public readonly chain: ChainId | null,
        public readonly address: string,
        public readonly connected: boolean,
    ) {
    }

    public withAddress(address: string): WalletInfo {
        return new WalletInfo(
            this.application,
            this.chain,
            address,
            this.connected,
        )
    }

    public withChain(chain: ChainId | null): WalletInfo {
        return new WalletInfo(
            this.application,
            chain,
            this.address,
            this.connected,
        )
    }
}
