export class CircularArray<T> {
    private readonly array: T[]
    private index = 0

    constructor(array: T[]) {
        if (array.length === 0)
            throw new Error('Array cannot be empty')

        this.array = array
    }

    next(): T {
        const item = this.array[this.index]

        this.index = (this.index + 1) % this.array.length

        return item
    }
}
