import { ChainInfo } from './ChainInfo'
import {  Chain } from './chains'

export * from './chains'
export { ChainMapFactory } from './ChainMapFactory'

export const chainInfos: { [chain in Chain]: ChainInfo } = {
    [Chain.ETH]: new ChainInfo(
        Chain.ETH,
        'Ethereum',
        false,
        'https://rpc.ankr.com/eth',
        'https://etherscan.io',
        {
            name: 'Ether',
            symbol: 'ETH',
        },
    ),

    [Chain.BNB]: new ChainInfo(
        Chain.BNB,
        'BNB Smart Chain',
        false,
        'https://rpc.ankr.com/bsc',
        'https://bscscan.com',
        {
            name: 'Binance Coin',
            symbol: 'BNB',
        },
    ),
    [Chain.BNB_TESTNET]: new ChainInfo(
        Chain.BNB_TESTNET,
        'BNB Smart Chain Testnet',
        true,
        'https://rpc.ankr.com/bsc_testnet_chapel',
        'https://testnet.bscscan.com',
        {
            name: 'Binance Coin',
            symbol: 'BNB',
        },
    ),

    [Chain.AVAX]: new ChainInfo(
        Chain.AVAX,
        'Avalanche',
        false,
        'https://rpc.ankr.com/avalanche-c',
        'https://snowtrace.io',
        {
            name: 'Avalanche',
            symbol: 'AVAX',
        },
    ),
    [Chain.AVAX_TESTNET]: new ChainInfo(
        Chain.AVAX_TESTNET,
        'Avalanche Testnet',
        true,
        'https://api.avax-test.network/ext/bc/C/rpc',
        'https://testnet.snowtrace.io',
        {
            name: 'Avalanche',
            symbol: 'AVAX',
        },
    ),

    [Chain.POLYGON]: new ChainInfo(
        Chain.POLYGON,
        'Avalanche Testnet',
        false,
        'https://rpc.ankr.com/polygon',
        'https://polygonscan.com/',
        {
            name: 'Polygon',
            symbol: 'MATIC',
        },
    ),
    [Chain.POLYGON_TESTNET]: new ChainInfo(
        Chain.POLYGON_TESTNET,
        'Polygon Mumbai Testnet',
        true,
        'https://rpc.ankr.com/polygon_mumbai',
        'https://mumbai.polygonscan.com/',
        {
            name: 'Polygon',
            symbol: 'MATIC',
        },
    ),
}
