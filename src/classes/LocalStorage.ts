const defaultParserFromJSON = <StorageType>(storedValue: string) => JSON.parse(storedValue) as StorageType
const defaultParserToJSON = <StorageType>(value: StorageType) => JSON.stringify(value)

export class LocalStorage<StorageType> {
    constructor(
        private readonly _key: string,
        private readonly _fromJSON: (storedValue: string) => StorageType = defaultParserFromJSON,
        private readonly _toJSON: (stored: StorageType) => string = defaultParserToJSON,
    ) {
    }

    public set(item: StorageType | null) {
        if (!this.available)
            return

        if (item === null)
            localStorage.removeItem(this._key)
        else
            localStorage.setItem(this._key, this._toJSON(item))
    }

    public get() {
        if (!this.available)
            return null

        const item = localStorage.getItem(this._key)

        if (item === null)
            return item

        return this._fromJSON(item)
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
