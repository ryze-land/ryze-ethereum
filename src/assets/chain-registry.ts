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
        'Polygon',
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
    [ChainId.FANTOM]: new Chain(
        ChainId.FANTOM,
        'Fantom Opera',
        false,
        {
            name: 'Fantom',
            symbol: 'FTM',
        },
        'https://ftmscan.com/',
        ['https://rpc.ftm.tools'],
    ),
    [ChainId.FANTOM_TESTNET]: new Chain(
        ChainId.FANTOM_TESTNET,
        'Fantom Testnet',
        true,
        {
            name: 'Fantom',
            symbol: 'FTM',
        },
        'https://testnet.ftmscan.com/',
        ['https://rpc.testnet.fantom.network'],
    ),
    [ChainId.OPTIMISM]: new Chain(
        ChainId.OPTIMISM,
        'Optimism',
        false,
        {
            name: 'Ether',
            symbol: 'ETH',
        },
        'https://optimistic.etherscan.io/',
        ['https://mainnet.optimism.io'],
    ),
    [ChainId.OPTIMISM_TESTNET]: new Chain(
        ChainId.OPTIMISM_TESTNET,
        'Optimism Goerli Testnet',
        true,
        {
            name: 'Ether',
            symbol: 'ETH',
        },
        'https://goerli-optimism.etherscan.io/',
        ['https://goerli.optimism.io'],
    ),
    [ChainId.ARBITRUM]: new Chain(
        ChainId.ARBITRUM,
        'Arbitrum One',
        false,
        {
            name: 'Ether',
            symbol: 'ETH',
        },
        'https://arbiscan.io/',
        ['https://rpc.ankr.com/arbitrum'],
    ),
    [ChainId.ARBITRUM_TESTNET]: new Chain(
        ChainId.ARBITRUM_TESTNET,
        'Arbitrum Goerli Testnet',
        true,
        {
            name: 'Ether',
            symbol: 'ETH',
        },
        'https://goerli.arbiscan.io/',
        ['https://arbitrum-goerli.publicnode.com'],
    ),
}
