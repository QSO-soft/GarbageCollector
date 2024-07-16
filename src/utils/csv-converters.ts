/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import fs from 'fs'

import csvtojson from 'csvtojson'

import {printResults} from './print'
import {c} from './helpers'

interface ConvertAndWriteToJson {
    inputPath: string
    outputPath?: string
    withSaving?: boolean
}
export const convertAndWriteToJSON = async ({inputPath, outputPath, withSaving}: ConvertAndWriteToJson) => {
    const jsonArray: object[] = []

    // console.log(`Reading from ${inputPath}...`)

    await csvtojson()
        .fromFile(inputPath)
        .subscribe(
            (jsonObj: object) => {
                jsonArray.push(jsonObj)
            },
            (error) => {
                if (error) {
                    console.log(c.red('Error reading CSV file in subscribe block! Probably wrong path or file name'))
                }
            }
        )
        .on('done', (error) => {
            if (error) {
                console.log(c.red('Error reading data from subscription CSV file! Probably wrong path or file name'))
            }

            if (withSaving) {
                if (outputPath && jsonArray?.length) {
                    console.log(`Writing JSON to ${outputPath}...`)

                    if (!fs.existsSync(outputPath)) {
                        fs.writeFileSync(outputPath, '')
                    }

                    fs.writeFileSync(outputPath, JSON.stringify(jsonArray, null, 2))
                } else {
                    console.log(c.red('Error writing data to JSON file! Probably wrong path or file name'))
                }
            }
        })

    return jsonArray
}

export type DataForCsv = Record<string, string | number | undefined>[]
export const convertToCSV = (data: DataForCsv, columnDelimiter = ',', lineDelimiter = '\n') => {
    let csvString = ''

    const allKeys = data.reduce<string[]>((acc, item) => [...acc, ...Object.keys(item)], [])
    const headers = [...new Set(allKeys)]

    csvString += headers.join(columnDelimiter) + lineDelimiter

    for (let i = 0; i < data.length; i++) {
        let ctr = 0

        const item = data[i]
        for (let j = 0; j < headers.length; j++) {
            const header = headers[j]
            if (ctr > 0) {
                csvString += columnDelimiter
            }

            csvString += item && header && item[header] !== undefined ? item[header] : ''

            ctr++
        }

        csvString += lineDelimiter
    }

    return csvString
}

interface ConvertToCsvAndWriteProps {
    data: DataForCsv
    fileName: string
    outputPath: string
    columnDelimiter?: string
    lineDelimiter?: string
}

export const convertToCsvAndWrite = ({data, fileName, outputPath, columnDelimiter, lineDelimiter}: ConvertToCsvAndWriteProps) => {
    const csvStringData = convertToCSV(data, columnDelimiter, lineDelimiter)
    printResults({data: csvStringData, fileName, outputPath})
}
