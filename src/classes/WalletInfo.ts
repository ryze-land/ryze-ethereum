import { Chain, WalletApplication } from '../enums'

export class WalletInfo {
    constructor(
        public readonly application: WalletApplication,
        public readonly chain: Chain,
        public readonly address: string,
        public readonly connected: boolean,
    ) {
    }
}
