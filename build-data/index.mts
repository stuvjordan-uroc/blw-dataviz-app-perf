/* eslint-disable @typescript-eslint/prefer-optional-chain */
import path from 'node:path'
import loadData from "./functions/load-data.ts";
import getNonEmptyValues from "./functions/get-nonempty-values.ts";
import getImpCols from './functions/get-imp-cols.ts';
import getUtilityColumnIndices from './functions/getUtilityColumnIndices.ts';

const rawData = loadData(path.resolve('build-data', 'raw-data/dem_characteristics_importance.gz'))
if (rawData) {
  //set the sample size
  const SAMPLESIZE = 1000;
  //create an array that holds the non-empty values of the 'wave' column
  const nonEmptyWaves = getNonEmptyValues(rawData, ['wave']);
  //create an array of objects that hold the column name and column index of each imp_ variable
  const impCols = getImpCols(rawData);
  interface UtilityColumns {
    wave: number,
    weight: number,
    pid3: number
  }
  const utilityColumns = getUtilityColumnIndices(rawData, ['wave', 'weight', 'pid3']) as UtilityColumns | undefined
  if (nonEmptyWaves && impCols && utilityColumns) {
    //create an array of the union of all non-empty values in all the imp_ variable columns
    const nonEmptyImpResponses = getNonEmptyValues(rawData, impCols.map(imp => imp.colName)) as string[] | undefined;
    if (nonEmptyImpResponses) {
      console.log(`INFO: Non-empty values of wave column are: `, nonEmptyWaves);
      console.log(`INFO: Non-empty values of imp_ columns are: `, nonEmptyImpResponses);
      if (nonEmptyImpResponses.length !== 4) {
        console.log(`WARNING: There should be exactly 4 Non-empty values of the imp_ columns.  Instead there are ${nonEmptyImpResponses.length.toString()}.`)
      }
      //create array of values we want to use from pid3
      const partyValues = [['Republican'], ['Democrat'], ['Independent', 'Other']];
      //outSample is the object that will hold the actual sample we return
      let outSample = new Object() as Record<string, Record<string, null | Record<string, string | number | null>[]>>
      //now we start to construct the actual sample
      impCols.forEach(impCol => {
        outSample = {
          ...outSample,
          [impCol.colName]: new Object as Record<string, null | Record<string, string | number | null>[]>
        }
        nonEmptyWaves.forEach(wave => {
          //step through the waves
          //make the string for the key for the current wave in this loop
          let waveKeyString = "w"
          if (typeof wave === "number") {
            waveKeyString = waveKeyString + wave.toString().padStart(2, '0')
          } else {
            waveKeyString = waveKeyString + wave.padStart(2, '0')
          }
          //subset to the universe needed for the sample
          const currentUniverse = rawData
            .data
            .filter(row => row[utilityColumns.wave] === wave) //only rows from the current wave
            .filter(row => nonEmptyImpResponses.includes(row[impCol.colIdx] as string)) //only rows non-empty on current imp variable
            .filter(row => partyValues.flat(Infinity).includes(row[utilityColumns.pid3] as string)) //only rows non-empty on partyid
          //if currentUniverse is empty, put null in the sample object and move to the next wave
          if (currentUniverse.length === 0) {
            outSample[impCol.colName] = {
              ...outSample[impCol.colName],
              [waveKeyString]: null
            }
          } else {
            //now grab SAMPLESIZE samples for each party id
            partyValues.forEach((partyGroup) => {
              //subset the current universe
              const currentPartyUniverse = currentUniverse.filter(row => partyGroup.includes(row[utilityColumns.pid3] as string))
              //don't sample if there are 0 persons from this party group
              if (currentPartyUniverse.length > 0) {
                //cumulative weights in order to do a weighted sample
                const cumWeights = [] as number[]
                currentPartyUniverse.forEach((dataRow, idx) => {
                  if (idx === 0) {
                    cumWeights.push(dataRow[utilityColumns.weight] as number)
                  } else {
                    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                    cumWeights.push((cumWeights[idx - 1] as number) + (dataRow[utilityColumns.weight] as number))
                  }
                })
                //The type guards are clearly not right on this.
                new Array(SAMPLESIZE).fill(1).map((el, idx) => {
                  const l = cumWeights.length
                  if (l > 0 && cumWeights[l - 1]) {
                    const r = cumWeights[l - 1];
                    if (r) {
                      const m = Math.random() * r
                      if (m) {
                        const firstMatchIndex = cumWeights.findIndex(w => w >= m)
                        return currentPartyUniverse[firstMatchIndex]
                      }
                    }
                  }
                })
              }
            })
          }
        })
      })
    }
  }
}
