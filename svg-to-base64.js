// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

const svgDir = path.join(__dirname, 'src/assets/icons')
const outputFile = path.join(__dirname, 'src/assets/icons/icons.ts')

fs.readdir(svgDir, (err, files) => {
    if (err)
        throw new Error(`Error reading directory: ${ err }`)

    const iconsArray = []

    files.forEach(file => {
        if (path.extname(file) === '.svg') {
            const filePath = path.join(svgDir, file)
            const data = fs.readFileSync(filePath, 'utf8')
            const base64data = Buffer.from(data).toString('base64')
            const iconName = path.basename(file, '.svg')

            iconsArray.push(`    ${ iconName }: '${ 'data:image/svg+xml;base64,' + base64data }'`)
        }
    })

    const tsContent = `// This file is automatically generated, don't edit it manually or your changes will be lost\n
export const icons = {\n${ iconsArray.join(',\n') },\n}\n`

    fs.writeFileSync(outputFile, tsContent)
})
