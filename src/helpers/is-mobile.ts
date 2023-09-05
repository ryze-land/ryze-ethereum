const mobileDeviceRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

/**
 * Checks if the current device is a mobile device.
 *
 * @returns {boolean} True if the device is mobile, false otherwise.
 */
export const isMobileDevice = (): boolean => {
    return navigator ? mobileDeviceRegex.test(navigator.userAgent) : false
}
