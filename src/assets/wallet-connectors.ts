import {
    BinanceWallet,
    BitgetWallet,
    MetaMaskWallet,
    SafePalWallet,
    TrustWallet,
} from '../classes'

export const defaultWalletConnectors = [
    new MetaMaskWallet(),
    new BitgetWallet(),
    new SafePalWallet(),
    new TrustWallet(),
    new BinanceWallet(),
]
