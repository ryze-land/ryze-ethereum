import { WalletApplications } from './constants'
import { Chain } from '../../chain'

export class WalletInfo {
    constructor(
        public readonly application: WalletApplications,
        public readonly chain: Chain,
        public readonly address: string,
        public readonly connected: boolean,
    ) {
    }
}
