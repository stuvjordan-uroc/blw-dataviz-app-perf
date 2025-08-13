import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import makeVizDataImp from "./build-data-fixed-layout";
import fs from "node:fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // {
    //   name: "make-imp-data",
    //   buildStart() {
    //     const vizData = makeVizDataImp();
    //     fs.writeFile(
    //       "src/data/viz/imp/viz-data.json",
    //       JSON.stringify(vizData?.vizData),
    //       (err) => {
    //         if (err) {
    //           console.error(err);
    //         }
    //       }
    //     );
    //     fs.writeFile(
    //       "src/data/viz/imp/coordinates.json",
    //       JSON.stringify(vizData?.coordinates),
    //       (err) => {
    //         if (err) {
    //           console.error(err);
    //         }
    //       }
    //     );
    //   },
    // },
  ],
});
