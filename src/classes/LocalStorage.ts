const defaultParser = <T>(storedValue: string) => JSON.parse(storedValue) as T

export class LocalStorage<T> {
    constructor(
        private readonly _key: string,
        private readonly _parser: (storedValue: string) => T = defaultParser,
    ) {
    }

    public set(item: T | null) {
        if (!this.available)
            return

        if (item === null)
            localStorage.removeItem(this._key)
        else
            localStorage.setItem(this._key, JSON.stringify(item))
    }

    public get() {
        if (!this.available)
            return null

        const item = localStorage.getItem(this._key)

        if (item === null)
            return item

        return this._parser(item)
    }

    private get available() {
        const available = 'available'

        try {
            localStorage.setItem(available, available)
            localStorage.removeItem(available)

            return true
        }
        catch (e) {
            return false
        }
    }
}
