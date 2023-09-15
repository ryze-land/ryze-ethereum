import { Contract } from 'ethers'

const HEX_REGEX = /^0x[0-9a-fA-F]+$/

export const parseCustomError = (contract: Contract, error: any) => {
    const revertData = error.data

    if (typeof revertData === 'string' && HEX_REGEX.test(revertData)) {
        const parsedError = contract.interface.parseError(revertData)

        if (parsedError)
            return new Error(parsedError.name)
    }

    return error as Error
}
