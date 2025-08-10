import type { Data } from "./types.ts"
import { decompressSync, strFromU8 } from "fflate";
import fs from 'node:fs';
import { z } from 'zod'

const RawDataSchema = z.object({
  columns: z.array(z.string()),
  data: z.array(z.array(z.union([z.string(), z.number(), z.null()])))
})

type RawData = z.infer<typeof RawDataSchema>

function coerceToStringOrNull(val: string | number | null | undefined) {
  if (val === null || val === undefined) {
    return null
  } else {
    if (typeof val === "string") {
      return val === "" ? null : val
    }
    if (typeof val === "number") {
      return isNaN(val) ? null : val.toString()
    }
    return null
  }
}

function coerceToNumberOrNull(val: string | number | null | undefined) {
  if (val === null || val === undefined) {
    return null
  } else {
    if (typeof val === "string") {
      return val === "" ? null : parseFloat(val)
    }
    if (typeof val === "number") {
      return isNaN(val) ? null : val
    }
    return null
  }
}

export default function makeData(rawDataPathString: string) {
  try {
    const rawData: RawData = RawDataSchema.parse(
      JSON.parse(
        strFromU8(
          decompressSync(
            fs.readFileSync(rawDataPathString)
          )
        )
      )
    )
    const weightColumnIndex = rawData.columns.findIndex(c => c === 'weight')
    if (weightColumnIndex === -1) {
      console.log(`WARNING: Raw data at ${rawDataPathString} has no weight column`)
      return undefined
    }
    const pid3ColumnIndex = rawData.columns.findIndex(c => c === 'pid3')
    if (pid3ColumnIndex === -1) {
      console.log(`WARNING: Raw data at ${rawDataPathString} has no pid3 column`)
      return undefined
    }
    const waveColumnIndex = rawData.columns.findIndex(c => c === 'wave')
    if (waveColumnIndex === -1) {
      console.log(`WARNING: Raw data at ${rawDataPathString} has no wave column`)
      return undefined
    }
    const impCols = rawData.columns
      .map((col, colIdx) => ({
        colName: col,
        colIdx: colIdx
      }))
      .filter(col => col.colName.startsWith("imp_"))
      .map(col => ({
        colName: col.colName.replace(/^imp_/, ''),
        colIdx: col.colIdx
      }))
    if (impCols.length < 25) {
      console.log(`WARNING: Could not enough imp columns in raw data at ${rawDataPathString}`)
      return undefined;
    }
    const perfCols = rawData.columns
      .map((col, colIdx) => ({
        colName: col,
        colIdx: colIdx
      }))
      .filter(col => col.colName.startsWith("perf_"))
      .map(col => ({
        colName: col.colName.replace(/^perf_/, ''),
        colIdx: col.colIdx
      }))
    if (perfCols.length < 25) {
      console.log(`WARNING: Could not find enough perf columns in raw data at ${rawDataPathString}`)
      return undefined;
    }
    const outData = rawData.data.map(row => ({
      weight: coerceToNumberOrNull(row[weightColumnIndex]),
      pid3: coerceToStringOrNull(row[pid3ColumnIndex]),
      wave: coerceToNumberOrNull(row[waveColumnIndex]),
      imp: Object.fromEntries(impCols.map(impCol => ([
        impCol.colName,
        row[impCol.colIdx]
      ]))),
      perf: Object.fromEntries(perfCols.map(perfCol => ([
        perfCol.colName,
        row[perfCol.colIdx]
      ])))
    }));
    return ({
      impCols: impCols.map(impCol => impCol.colName),
      perfCols: perfCols.map(perfCol => perfCol.colName),
      data: outData
    } as Data)
  } catch (error) {
    console.error(`Raw data at ${rawDataPathString} has the wrong format.`, error)
    return undefined
  }
}