/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { buildData } from "./build-data";
import layouts from "./src/config/layouts.json";
import vizConfig from "./src/config/viz-config.json";
import circleConfig from "./src/config/circles.json";
import buildPNGs from "./build-pngs";
import * as z from "zod";
import fs from "node:fs";
import type { CircleConfig } from "./build-pngs";
import type { Layouts } from "./build-data/functions-and-types/types";

const impDataPath = "./rawdata/dem_characteristics_importance.gz";
const pathToPAndCFolder = "./src/data/";
const pathToCoordinateDataFolder = "./public/coordinates/";
const pathToIMGFolder = "./public/img/";

// https://vite.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom"
  },
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
          const impVizData = buildData(
            impDataPath,
            impLayouts.data.imp,
            vizConfig
          );
          if (impVizData) {
            //Write a file that maps each impVar to its proportions and counts
            fs.mkdir(pathToPAndCFolder, { recursive: true }, (err) => {
              if (err) {
                if (err.code !== "EEXIST") {
                  throw new Error(
                    `One or more of the directories in the path ${pathToPAndCFolder} does not exist, but call to fs.mkdir failed.`
                  );
                } else {
                  //path already exists, so we can write to it
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
                }
              } else {
                //path didn't exist but now it's been created, so we can write to it
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
              }
            });
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
            );
            //For each screen size, write ONE file that maps each impVar to the segments and points for that impVar at that screensize
            fs.mkdir(pathToCoordinateDataFolder, { recursive: true }, (err) => {
              if (err) {
                if (err.code !== "EEXIST") {
                  throw new Error(
                    `One or more of the directories in the path ${pathToPAndCFolder} does not exist, but call to fs.mkdir failed.`
                  );
                } else {
                  //path already exists, so we can write to it
                  Object.entries(impVizData.viz).forEach(
                    ([screenSize, viz]) => {
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
                      );
                    }
                  );
                }
              } else {
                //path did not exist, but now it's been created, so we can write to it.
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
                  );
                });
              }
            });
          }
        }
      },
    },
    {
      name: "make-circles",
      async buildStart() {
        const impLayouts = layouts.imp as Layouts;
        const pngBuffers = await buildPNGs(
          impLayouts,
          circleConfig as CircleConfig
        );
        //write pngs
        for (const screenSize in pngBuffers) {
          for (const [pg, buffs] of pngBuffers[screenSize]) {
            if (buffs.pngBuff) {
              fs.mkdir(pathToIMGFolder, { recursive: true }, (err) => {
                if (err) {
                  if (err.code !== "EEXIST") {
                    throw new Error(
                      `One or more of the directories in the path ${pathToPAndCFolder} does not exist, but call to fs.mkdir failed.`
                    );
                  } else {
                    //path did not exist but now it's been created so we can write to ti
                    fs.writeFile(
                      pathToIMGFolder +
                      screenSize +
                      "-" +
                      pg.join("-") +
                      ".png",
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      buffs.pngBuff!,
                      (err: unknown) => {
                        if (err) {
                          console.error(
                            `failed to write png for circle at ${screenSize}, ${pg.join("-")}`,
                            err
                          );
                        }
                      }
                    );
                  }
                } else {
                  //path exists so we can write to it
                  fs.writeFile(
                    pathToIMGFolder + screenSize + "-" + pg.join("-") + ".png",
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    buffs.pngBuff!,
                    (err: unknown) => {
                      if (err) {
                        console.error(
                          `failed to write png for circle at ${screenSize}, ${pg.join("-")}`,
                          err
                        );
                      }
                    }
                  );
                }
              });
            } else {
              console.log(
                `WARNING: Failed to generate png buffer at ${screenSize}, ${pg.join("-")}`
              );
            }
          }
        }
      },
    },
  ],
});
