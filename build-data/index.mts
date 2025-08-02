import loadData from "./functions/load-data.ts";
import getNonEmptyWaves from "./functions/get-nonempty-waves.ts";

const rawData = loadData('./raw-data/dem_characteristics_importance.gz')
if (rawData) {
  const nonEmptyWaves = getNonEmptyWaves(rawData, 'wave')
}

