import {
    object as zodObject,
    string as zodString,
    boolean as zodBoolean,
} from 'zod'
import { ChainId, chainIdSchema } from '../constants'

export const walletInfoSchema = zodObject({
    walletConnectorId: zodString().nullable(),
    chainId: chainIdSchema.nullable(),
    address: zodString(),
    connected: zodBoolean(),
})

export class WalletInfo {
    constructor(
        public readonly walletConnectorId: string | null,
        public readonly chainId: ChainId | null,
        public readonly address: string,
        public readonly connected: boolean,
    ) {
    }

    public withAddress(address: string): WalletInfo {
        return new WalletInfo(
            this.walletConnectorId,
            this.chainId,
            address,
            this.connected,
        )
    }

    public withChain(chain: ChainId | null): WalletInfo {
        return new WalletInfo(
            this.walletConnectorId,
            chain,
            this.address,
            this.connected,
        )
    }
}
