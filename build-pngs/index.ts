import { Resvg } from "@resvg/resvg-js";
import xmlserializer from "xmlserializer";
import { parse } from "parse5";
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

function svgString(
  pointRadius: number,
  targetPartyGroup: string[],
  circleConfig: CircleConfig
): string | undefined {
  const fillEntry = circleConfig.fillByPartyGroup.find(
    ([partyGroup, _fill]: [string[], string]) =>
      targetPartyGroup.every((tp) => partyGroup.includes(tp)) &&
      partyGroup.every((pg) => targetPartyGroup.includes(pg))
  );
  if (fillEntry === undefined) {
    return undefined;
  }
  const svgString = `<svg width="${(2 * pointRadius).toString()}" height="${(2 * pointRadius).toString()}">
      <circle 
        r="${pointRadius.toString()}"
        cx="${pointRadius.toString()}"
        cy="${pointRadius.toString()}"
        stroke="${circleConfig.stroke}"
        stroke-width="${circleConfig.strokeWidth.toString()}"
        stroke-opacity="${circleConfig.strokeOpacity.toString()}"
        fill="${fillEntry[1]}"
        fill-opacity="${circleConfig.fillOpacity.toString()}"
      />
    </svg>`;

  const svgStringAsDocument = parse(svgString);
  const serialized = xmlserializer.serializeToString(svgStringAsDocument);

  return serialized;
}

const svgOpts = {
  font: {
    loadSystemFonts: false,
  },
  imageRendering: 0 as 0 | 1,
  fitTo: { mode: "original" } as { mode: "original" },
  background: "transparent",
};

export default function buildPNGs(
  layouts: Layouts,
  circleConfig: CircleConfig
) {
  const svgs = Object.fromEntries(
    (Object.entries(layouts) as [ScreenSize, Layout][]).map(
      ([screenSize, layout]: [ScreenSize, Layout]) => [
        screenSize,
        circleConfig.fillByPartyGroup.map(
          ([partyGroup, _fill]: [string[], string]) => {
            return [
              partyGroup,
              svgString(layout.pointRadius, partyGroup, circleConfig),
            ];
          }
        ) as [string[], string | undefined],
      ]
    )
  ); //now map this to an array of [ScreenSize, {noParty: pngbuffer, democrat: pngbuffer, etc.}]
  const buffers = Object.fromEntries(
    Object.entries(svgs).map(
      ([screenSize, [partyGroup, svgString]]: [
        string,
        [string[], string | undefined],
      ]) => {
        const reSvg = svgString ? new Resvg(svgString, svgOpts) : undefined;
        const pngBuffer = reSvg ? reSvg.render().asPng() : undefined;
        return [screenSize, [partyGroup, pngBuffer]] as [
          string,
          [string[], Buffer | undefined],
        ];
      }
    )
  );
  return buffers;
}
