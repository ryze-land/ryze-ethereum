// https://github.com/MetaMask/rpc-errors/blob/main/src/error-constants.ts
export const ProviderErrorCode = {
    INVALID_INPUT: -32000,
    RESOURCE_NOT_FOUND: -32001,
    RESOURCE_UNAVAILABLE: -32002,
    TRANSACTION_REJECTED: -32003,
    METHOD_NOT_SUPPORTED: -32004,
    LIMIT_EXCEEDED: -32005,
    PARSE: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL: -32603,
    USER_REJECTED_REQUEST: 4001,
    UNAUTHORIZED: 4100,
    UNSUPPORTED_METHOD: 4200,
    DISCONNECTED: 4900,
    CHAIN_DISCONNECTED: 4901,
    MISSING_REQUESTED_CHAIN: 4902,
} as const

export interface ProviderError {
    code: number
    message: string
}

export const isProviderError = (error: any): error is ProviderError => {
    return !!error &&
        typeof error.code === 'number' &&
        typeof error.message === 'string' &&
        Object.values(ProviderErrorCode).includes(error.code)
}
