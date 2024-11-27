import { WalletConnector } from './WalletConnector'

export abstract class WalletConnector__disconnect extends WalletConnector {
    public abstract disconnect(): Promise<void>
}
