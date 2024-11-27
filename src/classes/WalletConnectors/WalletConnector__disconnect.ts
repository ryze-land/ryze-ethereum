import { EIP1193Provider } from '../WalletManager/eip1193Provider'
import { WalletConnector } from './WalletConnector'

export abstract class WalletConnector__disconnect<T extends EIP1193Provider = EIP1193Provider> extends WalletConnector<T> {
    public abstract disconnect(): Promise<void>
}
