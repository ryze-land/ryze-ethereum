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
import {
    isEthersError,
    isProviderError,
    ProviderErrorCode,
    WalletApplication,
} from '@ryze-blockchain/ethereum'
import { ethereum } from './ethereum.ts'

const connectWallet = async () => {
    try {
        // You can use any one of the available WalletApplications
        return await ethereum.walletManager.connect(WalletApplication.METAMASK)
    } catch (e) {
        if (isEthersError(e) && isProviderError(e.error)) {
            if (e.error.code === ProviderErrorCode.RESOURCE_UNAVAILABLE)
                // throwing error is just an example, you can return here and handle by showing a message
                throw new Error('Wallet connection already pending')

            if (e.error.code === ProviderErrorCode.USER_REJECTED_REQUEST)
                // throwing error is just an example, you can return here and handle by showing a message
                throw new Error('Connection rejected by the user')
        }

        throw e
    }
}
```

3. Request to set a chain in the user's wallet 

```typescript
import {
    isEthersError,
    isProviderError,
    ProviderErrorCode,
    ChainId,
} from '@ryze-blockchain/ethereum'
import { ethereum } from './ethereum.ts'

const setChain = async (chainId: ChainId) => {
    try {
        // You can use any one of the available ChainIds
        return await ethereum.walletManager.setChain(chainId)
    } catch (e) {
        if (isEthersError(e) && isProviderError(e.error)) {
            if (e.error.code === ProviderErrorCode.RESOURCE_UNAVAILABLE)
                // throwing error is just an example, you can return here and handle by showing a message
                throw new Error('Request to switch chain already pending')

            if (e.error.code === ProviderErrorCode.USER_REJECTED_REQUEST)
                // throwing error is just an example, you can return here and handle by showing a message
                throw new Error('Request rejected by the user')
        }

        throw e
    }
}
```
