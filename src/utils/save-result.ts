import {convertAndWriteToJSON, convertToCsvAndWrite, DataForCsv} from './csv-converters'
import fs from 'fs'

interface SaveBalanceCheckerDataArgs<T> {
    data: T
}
export const saveBalanceCheckerDataToCSV = async <T extends object>({data}: SaveBalanceCheckerDataArgs<T>) => {
    const inputName = `balance-checker.csv`

    const prevData = await convertAndWriteToJSON({
        inputPath: `./results/${inputName}`
    })

    let addressAlreadyExists = false
    const resData = prevData.reduce<Object[]>((acc, cur) => {
        if ('address' in cur && 'address' in data && 'network' in cur && 'network' in data && data.address === cur.address) {
            addressAlreadyExists = true
            return [
                ...acc,
                {
                    ...cur,
                    ...data
                }
            ]
        }

        return acc
    }, [])

    const sortedArray = (addressAlreadyExists ? resData : [...resData, data]).sort((firstItem, secondItem) => {
        if ('address' in firstItem && 'address' in secondItem) {
            return `${firstItem.address}`.localeCompare(`${secondItem.address}`)
        }

        return 0
    })

    convertToCsvAndWrite({
        data: sortedArray as DataForCsv,
        fileName: inputName,
        outputPath: './results'
    })
}

export const createCheckerCsv = () => {
    if (!fs.existsSync('./results')) {
        fs.mkdirSync('./results')
    }

    const checkerFile = './results/balance-checker.csv'

    fs.writeFileSync(checkerFile, '')
}
