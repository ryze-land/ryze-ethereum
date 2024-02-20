export type Address = `0x${ string }`

export type Hash = `0x${ string }`

/**
 * A utility type that represents a value that might be a promise or a direct value.
 *
 * @template T The type of the value or the resolved value of the promise.
 */
export type Promisable<T> = Promise<T> | T
