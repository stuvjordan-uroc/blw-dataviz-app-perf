import fs from 'node:fs'
import { decompressSync, strFromU8 } from 'fflate';
interface RawData {
  columns: string[];
  data: (string | number | null)[][]
}
export default function loadData(path: string): RawData | undefined {
  try {
    const rawData = JSON.parse(strFromU8(decompressSync(fs.readFileSync(path)))) as RawData
    return (rawData)
  } catch (err) {
    console.error(err);
  }
}