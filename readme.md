# Ethereum

An opinionated wrapper to simplify the integration with ethers, a popular Ethereum library.

## Usage

1. Initialize

```typescript
// ethereum.ts
import { Ethereum, ChainId, WalletInfo } from '@ryze-blockchain/ethereum'

export const ethereum = new Ethereum({
    defaultChainId: ChainId.AVAX_TESTNET,
    availableChainIds: [ChainId.AVAX_TESTNET],
    chainToRpcMap: {
        [ChainId.AVAX_TESTNET]: ['https://api.avax-test.network/ext/bc/C/rpc'],
    },
    onWalletUpdate: (walletInfo: WalletInfo | null) => {
        // set walletInfo in your state management plugin
    },
})
```

2. Connect to a wallet provider

```typescript
// your wallet component
import { isEthersError, isProviderError, ProviderErrorCode, WalletApplication } from '@ryze-blockchain/ethereum'
import { ethereum } from './ethereum.ts'

// You can use any one of the available WalletApplications
const connectWallet = async (walletApplication: WalletApplication) => {
    return await ethereum.walletManager.connect(walletApplication, {
        onReject: () => { throw new Error('User rejected wallet connection') },
        onRequestAlreadyPending: () => { throw new Error('Wallet connection already pending') },
        onProviderUnavailable: () => { throw new Error('Wallet provider not available') },
    })
}
```

3. Request to set a chain in the user's wallet

```typescript
// your chain component
import { isEthersError, isProviderError, ProviderErrorCode, ChainId } from '@ryze-blockchain/ethereum'
import { ethereum } from './ethereum.ts'

const setChain = async (chainId: ChainId) => {
    return await ethereum.walletManager.setChain(chainId, {
        onReject: () => { throw new Error('Request rejected by the user') },
        onRequestAlreadyPending: () => { throw new Error('Request to switch chain already pending') },
    })
}
```
