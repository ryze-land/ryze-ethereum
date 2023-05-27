import { Chain } from '../../chain'
import { WalletApplications } from './constants'

export class WalletInfo {
    constructor(
        public readonly application: WalletApplications,
        public readonly chain: Chain,
        public readonly address: string,
        public readonly connected: boolean,
    ) {
    }
}
