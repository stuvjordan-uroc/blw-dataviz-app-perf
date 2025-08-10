import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { makeImpSample } from "./build-data";
import { writeFileSync } from "node:fs";
import { formatWithOptions } from "node:util";
import lodash from "lodash";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "make-imp-data",
      buildStart() {
        const impSample = makeImpSample('small');
        writeFileSync("src/data/coordinates/imp-small.json", JSON.stringify(impSample));
        //console.log to see covered waves
        //console.log random selection to audit
        const sampleOfImpVars = lodash.sampleSize(Object.keys(impSample), 3)
        sampleOfImpVars.forEach(sampledImpVar => {
          const sampledWaveString = lodash.sample(Object.keys(impSample[sampledImpVar]))
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const sampleOfPoints = lodash.sampleSize(impSample[sampledImpVar][sampledWaveString!], 3)
          console.log('sample from', sampledImpVar, sampledWaveString)
          console.log(formatWithOptions({ depth: Infinity }, '%O', sampleOfPoints))
        })
      },
    },
  ],
});
