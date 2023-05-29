import { ChainInfo } from '../classes'
import { Chain } from '../enums'

export const chainInfos: { [chain in Chain]: ChainInfo } = {
    [Chain.ETH]: new ChainInfo(
        Chain.ETH,
        'Ethereum',
        false,
        {
            name: 'Ether',
            symbol: 'ETH',
        },
        'https://etherscan.io',
        ['https://rpc.ankr.com/eth'],
    ),

    [Chain.BNB]: new ChainInfo(
        Chain.BNB,
        'BNB Smart Chain',
        false,
        {
            name: 'Binance Coin',
            symbol: 'BNB',
        },
        'https://bscscan.com',
        ['https://rpc.ankr.com/bsc'],
    ),
    [Chain.BNB_TESTNET]: new ChainInfo(
        Chain.BNB_TESTNET,
        'BNB Smart Chain Testnet',
        true,

        {
            name: 'Binance Coin',
            symbol: 'BNB',
        },
        'https://testnet.bscscan.com',
        ['https://rpc.ankr.com/bsc_testnet_chapel'],
    ),

    [Chain.AVAX]: new ChainInfo(
        Chain.AVAX,
        'Avalanche',
        false,
        {
            name: 'Avalanche',
            symbol: 'AVAX',
        },
        'https://snowtrace.io',
        ['https://rpc.ankr.com/avalanche-c'],
    ),
    [Chain.AVAX_TESTNET]: new ChainInfo(
        Chain.AVAX_TESTNET,
        'Avalanche Testnet',
        true,
        {
            name: 'Avalanche',
            symbol: 'AVAX',
        },
        'https://testnet.snowtrace.io',
        ['https://api.avax-test.network/ext/bc/C/rpc'],
    ),

    [Chain.POLYGON]: new ChainInfo(
        Chain.POLYGON,
        'Avalanche Testnet',
        false,
        {
            name: 'Polygon',
            symbol: 'MATIC',
        },
        'https://polygonscan.com/',
        ['https://rpc.ankr.com/polygon'],
    ),
    [Chain.POLYGON_TESTNET]: new ChainInfo(
        Chain.POLYGON_TESTNET,
        'Polygon Mumbai Testnet',
        true,
        {
            name: 'Polygon',
            symbol: 'MATIC',
        },
        'https://mumbai.polygonscan.com/',
        ['https://rpc.ankr.com/polygon_mumbai'],
    ),
}
