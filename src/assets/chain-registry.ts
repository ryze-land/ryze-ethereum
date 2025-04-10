import { Chain, FullChainMap } from '../classes'
import { ChainIds } from '../constants'

export const chainRegistry: FullChainMap<Chain> = {
    // ETH
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

    // OPTIMISM
    [ChainIds.OPTIMISM]: new Chain(
        ChainIds.OPTIMISM,
        'Optimism',
        false,
        {
            name: 'Ether',
            symbol: 'ETH',
        },
        'https://optimistic.etherscan.io',
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
        'https://goerli-optimism.etherscan.io',
        ['https://goerli.optimism.io'],
    ),

    // CRONOS
    [ChainIds.CRONOS]: new Chain(
        ChainIds.CRONOS,
        'Cronos',
        false,
        {
            name: 'Cronos',
            symbol: 'CRO',
        },
        'https://cronoscan.com',
        ['https://evm.cronos.org'],
    ),

    // BNB
    [ChainIds.BNB]: new Chain(
        ChainIds.BNB,
        'BNB Smart Chain',
        false,
        {
            name: 'Binance Coin',
            symbol: 'BNB',
        },
        'https://bscscan.com',
        ['https://bsc-dataseed1.bnbchain.org'],
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
        [
            'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
            'https://data-seed-prebsc-2-s2.bnbchain.org:8545',
        ],
    ),

    // POLYGON
    [ChainIds.POLYGON]: new Chain(
        ChainIds.POLYGON,
        'Polygon',
        false,
        {
            name: 'Polygon',
            symbol: 'MATIC',
        },
        'https://polygonscan.com',
        ['https://polygon-rpc.com'],
    ),
    [ChainIds.POLYGON_TESTNET]: new Chain(
        ChainIds.POLYGON_TESTNET,
        'Polygon Mumbai Testnet',
        true,
        {
            name: 'Polygon',
            symbol: 'MATIC',
        },
        'https://mumbai.polygonscan.com',
        ['https://rpc.ankr.com/polygon_mumbai'],
    ),

    // FANTOM
    [ChainIds.FANTOM]: new Chain(
        ChainIds.FANTOM,
        'Fantom',
        false,
        {
            name: 'Fantom',
            symbol: 'FTM',
        },
        'https://ftmscan.com',
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
        'https://testnet.ftmscan.com',
        ['https://rpc.testnet.fantom.network'],
    ),

    // BASE
    [ChainIds.BASE]: new Chain(
        ChainIds.BASE,
        'Base',
        false,
        {
            name: 'Ethereum',
            symbol: 'ETH',
        },
        'https://basescan.org',
        ['https://mainnet.base.org'],
    ),

    // ARBITRUM
    [ChainIds.ARBITRUM]: new Chain(
        ChainIds.ARBITRUM,
        'Arbitrum One',
        false,
        {
            name: 'Ether',
            symbol: 'ETH',
        },
        'https://arbiscan.io',
        ['https://arb1.arbitrum.io/rpc'],
    ),
    [ChainIds.ARBITRUM_TESTNET]: new Chain(
        ChainIds.ARBITRUM_TESTNET,
        'Arbitrum Goerli Testnet',
        true,
        {
            name: 'Ether',
            symbol: 'ETH',
        },
        'https://goerli.arbiscan.io',
        ['https://arbitrum-goerli.publicnode.com'],
    ),

    // AVALANCHE
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

    // BLAST
    [ChainIds.BLAST]: new Chain(
        ChainIds.BLAST,
        'Blast',
        false,
        {
            name: 'Ethereum',
            symbol: 'ETH',
        },
        'https://blastscan.io',
        ['https://rpc.blast.io'],
    ),
}
