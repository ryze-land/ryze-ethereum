import { object, string, boolean, nativeEnum } from 'zod'
import { ChainId, WalletApplication } from '../enums'

export const walletInfoSchema = object({
    application: nativeEnum(WalletApplication),
    chainId: nativeEnum(ChainId).nullable(),
    address: string(),
    connected: boolean(),
})

export class WalletInfo {
    constructor(
        public readonly application: WalletApplication,
        public readonly chainId: ChainId | null,
        public readonly address: string,
        public readonly connected: boolean,
    ) {
    }

    public withAddress(address: string): WalletInfo {
        return new WalletInfo(
            this.application,
            this.chainId,
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
