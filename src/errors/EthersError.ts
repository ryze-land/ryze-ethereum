import { ErrorCode, EthersError } from 'ethers'
import { isProviderError } from './ProviderError'

export const isEthersError = <T extends ErrorCode = ErrorCode>(
    error: any,
): error is EthersError<T> => {
    const validCode = typeof error.code === 'string'

    const validInfo = error.info === undefined ||
        typeof error.info === 'object'

    const validError = error.error === undefined ||
        error.error instanceof Error ||
        isProviderError(error.error)

    return !!error && validCode && validInfo && validError
}
