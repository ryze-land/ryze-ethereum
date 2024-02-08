import { Chain } from '../classes'
import { ChainId, ChainIds } from '../constants'

export const chainRegistry: Record<ChainId, Chain> = {
    [ChainIds.ETH]: new Chain(
        ChainIds.ETH,
        'Ethereum',
        false,
        {
            name: 'Ether',
            symbol: 'ETH',
        },
        'https://etherscan.io',
        ['https://rpc.ankr.com/eth'],
    ),

    [ChainIds.BNB]: new Chain(
        ChainIds.BNB,
        'BNB Smart Chain',
        false,
        {
            name: 'Binance Coin',
            symbol: 'BNB',
        },
        'https://bscscan.com',
        ['https://rpc.ankr.com/bsc'],
    ),
    [ChainIds.BNB_TESTNET]: new Chain(
        ChainIds.BNB_TESTNET,
        'BNB Smart Chain Testnet',
        true,

        {
            name: 'Binance Coin',
            symbol: 'BNB',
        },
        'https://testnet.bscscan.com',
        ['https://rpc.ankr.com/bsc_testnet_chapel'],
    ),

    [ChainIds.AVAX]: new Chain(
        ChainIds.AVAX,
        'Avalanche',
        false,
        {
            name: 'Avalanche',
            symbol: 'AVAX',
        },
        'https://snowtrace.io',
        ['https://rpc.ankr.com/avalanche-c'],
    ),
    [ChainIds.AVAX_TESTNET]: new Chain(
        ChainIds.AVAX_TESTNET,
        'Avalanche Testnet',
        true,
        {
            name: 'Avalanche',
            symbol: 'AVAX',
        },
        'https://testnet.snowtrace.io',
        ['https://api.avax-test.network/ext/bc/C/rpc'],
    ),

    [ChainIds.POLYGON]: new Chain(
        ChainIds.POLYGON,
        'Polygon',
        false,
        {
            name: 'Polygon',
            symbol: 'MATIC',
        },
        'https://polygonscan.com/',
        ['https://rpc.ankr.com/polygon'],
    ),
    [ChainIds.POLYGON_TESTNET]: new Chain(
        ChainIds.POLYGON_TESTNET,
        'Polygon Mumbai Testnet',
        true,
        {
            name: 'Polygon',
            symbol: 'MATIC',
        },
        'https://mumbai.polygonscan.com/',
        ['https://rpc.ankr.com/polygon_mumbai'],
    ),
    [ChainIds.FANTOM]: new Chain(
        ChainIds.FANTOM,
        'Fantom',
        false,
        {
            name: 'Fantom',
            symbol: 'FTM',
        },
        'https://ftmscan.com/',
        ['https://rpc.ftm.tools'],
    ),
    [ChainIds.FANTOM_TESTNET]: new Chain(
        ChainIds.FANTOM_TESTNET,
        'Fantom Testnet',
        true,
        {
            name: 'Fantom',
            symbol: 'FTM',
        },
        'https://testnet.ftmscan.com/',
        ['https://rpc.testnet.fantom.network'],
    ),
    [ChainIds.OPTIMISM]: new Chain(
        ChainIds.OPTIMISM,
        'Optimism',
        false,
        {
            name: 'Ether',
            symbol: 'ETH',
        },
        'https://optimistic.etherscan.io/',
        ['https://mainnet.optimism.io'],
    ),
    [ChainIds.OPTIMISM_TESTNET]: new Chain(
        ChainIds.OPTIMISM_TESTNET,
        'Optimism Goerli Testnet',
        true,
        {
            name: 'Ether',
            symbol: 'ETH',
        },
        'https://goerli-optimism.etherscan.io/',
        ['https://goerli.optimism.io'],
    ),
    [ChainIds.ARBITRUM]: new Chain(
        ChainIds.ARBITRUM,
        'Arbitrum One',
        false,
        {
            name: 'Ether',
            symbol: 'ETH',
        },
        'https://arbiscan.io/',
        ['https://rpc.ankr.com/arbitrum'],
    ),
    [ChainIds.ARBITRUM_TESTNET]: new Chain(
        ChainIds.ARBITRUM_TESTNET,
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
