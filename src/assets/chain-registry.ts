import { Chain } from '../classes'
import { ChainId } from '../enums'

export const chainRegistry: Record<ChainId, Chain> = {
    [ChainId.ETH]: new Chain(
        ChainId.ETH,
        'Ethereum',
        false,
        {
            name: 'Ether',
            symbol: 'ETH',
        },
        'https://etherscan.io',
        ['https://rpc.ankr.com/eth'],
    ),

    [ChainId.BNB]: new Chain(
        ChainId.BNB,
        'BNB Smart Chain',
        false,
        {
            name: 'Binance Coin',
            symbol: 'BNB',
        },
        'https://bscscan.com',
        ['https://rpc.ankr.com/bsc'],
    ),
    [ChainId.BNB_TESTNET]: new Chain(
        ChainId.BNB_TESTNET,
        'BNB Smart Chain Testnet',
        true,

        {
            name: 'Binance Coin',
            symbol: 'BNB',
        },
        'https://testnet.bscscan.com',
        ['https://rpc.ankr.com/bsc_testnet_chapel'],
    ),

    [ChainId.AVAX]: new Chain(
        ChainId.AVAX,
        'Avalanche',
        false,
        {
            name: 'Avalanche',
            symbol: 'AVAX',
        },
        'https://snowtrace.io',
        ['https://rpc.ankr.com/avalanche-c'],
    ),
    [ChainId.AVAX_TESTNET]: new Chain(
        ChainId.AVAX_TESTNET,
        'Avalanche Testnet',
        true,
        {
            name: 'Avalanche',
            symbol: 'AVAX',
        },
        'https://testnet.snowtrace.io',
        ['https://api.avax-test.network/ext/bc/C/rpc'],
    ),

    [ChainId.POLYGON]: new Chain(
        ChainId.POLYGON,
        'Avalanche Testnet',
        false,
        {
            name: 'Polygon',
            symbol: 'MATIC',
        },
        'https://polygonscan.com/',
        ['https://rpc.ankr.com/polygon'],
    ),
    [ChainId.POLYGON_TESTNET]: new Chain(
        ChainId.POLYGON_TESTNET,
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
