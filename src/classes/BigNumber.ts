import { BigNumber } from 'bignumber.js'

BigNumber.config({
    ROUNDING_MODE: BigNumber.ROUND_FLOOR,
    DECIMAL_PLACES: 18,
})

export { BigNumber }
