import {
    object as zodObject,
    string as zodString,
    boolean as zodBoolean,
    nativeEnum as zodNativeEnum,
} from 'zod'
import { ChainId, WalletApplication } from '../enums'

export const walletInfoSchema = zodObject({
    application: zodNativeEnum(WalletApplication).nullable(),
    chainId: zodNativeEnum(ChainId).nullable(),
    address: zodString(),
    connected: zodBoolean(),
})

export class WalletInfo {
    constructor(
        public readonly application: WalletApplication | null,
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
