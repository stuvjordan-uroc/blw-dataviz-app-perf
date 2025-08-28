import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { buildData } from "./build-data";
import layouts from "./src/config/layouts.json";
import * as z from "zod";
import util from "node:util";

const impDataPath = "./src/data/raw/dem_characteristics_importance.gz";

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
          const impVizData = buildData(impDataPath, impLayouts.data.imp);
          console.log(util.inspect(impVizData, true, 5, true));
        }
      },
    },
  ],
});
