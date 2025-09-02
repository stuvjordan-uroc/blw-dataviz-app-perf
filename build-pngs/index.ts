import Sharp from "sharp"
import standaloneSVG from "./standalone-svg.ts";
type ScreenSize = "small" | "medium" | "large" | "xLarge";
interface Layout {
  screenWidthRange: number[];
  vizWidth: number;
  waveHeight: number;
  pointRadius: number;
  responseGap: number;
  partyGap: number;
  labelHeight: number;
}
type Layouts = Record<ScreenSize, Layout>;
export interface CircleConfig {
  stroke: string;
  strokeWidth: number;
  strokeOpacity: number;
  fillOpacity: number;
  fillByPartyGroup: [string[], string][];
}



export default async function buildPNGs(
  layouts: Layouts,
  circleConfig: CircleConfig
) {
  const out = Object.fromEntries(
    (Object.entries(layouts) as [ScreenSize, Layout][]).map(
      ([screenSize, layout]: [ScreenSize, Layout]) => [
        screenSize,
        circleConfig.fillByPartyGroup.map(
          ([partyGroup, _fill]: [string[], string]) => {
            return [
              partyGroup,
              {
                svgBuff: standaloneSVG(layout.pointRadius, circleConfig, partyGroup),
                pngBuff: null
              },
            ] as [string[], { svgBuff: Buffer<ArrayBuffer> | undefined, pngBuff: null | Buffer }];
          }
        ),
      ]
    )
  );
  for (const screenSize in out) {
    const pgEntries = out[screenSize]
    if (pgEntries !== undefined) {
      for (const [_pg, buff] of pgEntries) {
        if (buff.svgBuff !== undefined) {
          const pngBuff = await Sharp(buff.svgBuff)
            .png()
            .toBuffer()
          buff.pngBuff = pngBuff
        }
      }
    }
  }
  return out;
}
