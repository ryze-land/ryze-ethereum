export const mapN = async <T>(n: number, callback: (index: number) => T) => await Promise.all(
    new Array(n)
        .fill(null)
        .map((_, index) => callback(index)),
)
