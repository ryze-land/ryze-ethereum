import { EthersError } from 'ethers'
import { isProviderError } from './ProviderError'

export enum EthersErrorCode {
    // Generic Errors
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
    UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',
    NETWORK_ERROR = 'NETWORK_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    TIMEOUT = 'TIMEOUT',
    BAD_DATA = 'BAD_DATA',
    CANCELLED = 'CANCELLED',

    // Operational Errors
    BUFFER_OVERRUN = 'BUFFER_OVERRUN',
    NUMERIC_FAULT = 'NUMERIC_FAULT',

    // Argument Errors
    INVALID_ARGUMENT = 'INVALID_ARGUMENT',
    MISSING_ARGUMENT = 'MISSING_ARGUMENT',
    UNEXPECTED_ARGUMENT = 'UNEXPECTED_ARGUMENT',
    VALUE_MISMATCH = 'VALUE_MISMATCH',

    // Blockchain Errors
    CALL_EXCEPTION = 'CALL_EXCEPTION',
    INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
    NONCE_EXPIRED = 'NONCE_EXPIRED',
    REPLACEMENT_UNDERPRICED = 'REPLACEMENT_UNDERPRICED',
    TRANSACTION_REPLACED = 'TRANSACTION_REPLACED',
    UNCONFIGURED_NAME = 'UNCONFIGURED_NAME',
    OFFCHAIN_FAULT = 'OFFCHAIN_FAULT',

    // User Interaction
    ACTION_REJECTED = 'ACTION_REJECTED',
}

export const isEthersError = (
    error: any,
): error is EthersError => {
    const validCode = typeof error.code === 'string'

    const validInfo = error.info === undefined ||
        typeof error.info === 'object'

    const validError = error.error === undefined ||
        error.error instanceof Error ||
        isProviderError(error.error)

    return !!error && validCode && validInfo && validError
}
