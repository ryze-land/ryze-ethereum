import { BigNumber } from 'bignumber.js'
import { BigNumber as BigNumberEthers, utils } from 'ethers'

BigNumber.config({
    ROUNDING_MODE: BigNumber.ROUND_FLOOR,
    DECIMAL_PLACES: 18,
})

const WEI_IN_ETH = new BigNumber(10).pow(18)

export class BigNumberJS extends BigNumber {
    /**
     * Overrides
     */

    plus(n: BigNumber.Value, base?: number): BigNumberJS {
        return new BigNumberJS(super.plus(n, base))
    }

    minus(n: BigNumber.Value, base?: number): BigNumberJS {
        return new BigNumberJS(super.minus(n, base))
    }

    times(n: BigNumber.Value, base?: number): BigNumberJS {
        return new BigNumberJS(super.times(n, base))
    }

    div(n: BigNumber.Value, base?: number): BigNumberJS {
        return new BigNumberJS(super.div(n, base))
    }

    abs(): BigNumberJS {
        return new BigNumberJS(super.abs())
    }

    /**
     * Convert From
     */

    static fromEthers(
        numberEthers: BigNumberEthers,
        decimals: BigNumber | number = 18,
    ): BigNumberJS {
        return new BigNumberJS(numberEthers.toString())
            .div(new BigNumber(10).pow(decimals))
    }

    /**
     * Convert To
     */

    toString(base?: number): string {
        return super.decimalPlaces(18).toString(base)
    }

    toWei(): BigNumberJS {
        return new BigNumberJS(this.times(WEI_IN_ETH))
    }

    toHex(): string {
        return `0x${ this.decimalPlaces(0).toString(16) }`
    }

    toBigNumberEthers(): BigNumberEthers {
        return BigNumberEthers.from(this.toHex())
    }
}

export { BigNumberEthers }
export const parseEther = (numberString: string) => utils.parseEther(numberString)
export const numberToHex = (number: number) => `0x${ Math.floor(number).toString(16) }`
