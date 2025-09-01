import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { buildData } from "./build-data";
import layouts from "./src/config/layouts.json";
import vizConfig from "./src/config/viz-config.json";
import * as z from "zod";
import fs from "node:fs";

const impDataPath = "./rawdata/dem_characteristics_importance.gz";
const pathToPAndCFolder = "./src/data/";
const pathToCoordinateDataFolder = "./public/coordinates/";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "make-imp-data",
      buildStart() {
        //validate layout from layouts.json
        const LayoutSchema = z.strictObject({
          screenWidthRange: z.array(z.number()).length(2),
          vizWidth: z.number(),
          waveHeight: z.number(),
          pointRadius: z.number(),
          responseGap: z.number(),
          partyGap: z.number(),
          labelHeight: z.number(),
        });
        const ScreensSchema = z.strictObject({
          small: LayoutSchema,
          medium: LayoutSchema,
          large: LayoutSchema,
          xLarge: LayoutSchema,
        });
        const Layouts = z.object({
          imp: ScreensSchema,
        });
        const impLayouts = Layouts.safeParse(layouts);
        if (!impLayouts.success) {
          console.log(
            "WARNING: Format of layouts.json invalid.  Did not build data"
          );
          console.log(impLayouts.error);
        } else {
          const impVizData = buildData(impDataPath, impLayouts.data.imp, vizConfig);
          if (impVizData) {
            //Write a file that maps each impVar to its proportions and counts
            fs.writeFile(
              pathToPAndCFolder + "p-and-c.json",
              JSON.stringify(impVizData.pAndC),
              (err: unknown) => {
                if (err) {
                  console.error(
                    "failed to write pAndC.json to src-data folder",
                    err
                  );
                }
              }
            );
            //write the metadata to the same folder
            fs.writeFile(
              pathToPAndCFolder + "data-meta.json",
              JSON.stringify(impVizData.dataMeta),
              (err: unknown) => {
                if (err) {
                  console.error(
                    "failed to write data-meta.json to src-data folder",
                    err
                  );
                }
              }
            )
            //For each screen size, write ONE file that maps each impVar to the segments and points for that impVar at that screensize
            Object.entries(impVizData.viz).forEach(([screenSize, viz]) => {
              fs.writeFile(
                pathToCoordinateDataFolder + `viz-${screenSize}.json`,
                JSON.stringify(viz),
                (err: unknown) => {
                  if (err) {
                    console.error(
                      `failed to write viz-${screenSize}.json to coordinates folder`,
                      err
                    );
                  }
                }
              )
            })
          }
        }
      }
    },
  ],
});
