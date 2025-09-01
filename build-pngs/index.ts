import { createConverter } from "convert-svg-to-png"
import { svg } from "motion/react-client";
import { executablePath } from "puppeteer"

type ScreenSize = "small" | "medium" | "large" | "xLarge"
interface Layout {
  screenWidthRange: [number, number];
  vizWidth: number;
  waveHeight: number;
  pointRadius: number;
  responseGap: number;
  partyGap: number;
  labelHeight: number;
};
type Layouts = Record<ScreenSize, Layout>
type Party = "none" | "Democrat" | "Independent" | "Republican"
interface CircleConfig {
  stroke: string,
  strokeWidth: number,
  strokeOpacity: number,
  fillOpacity: number,
  fill: Record<Party, string>
}

function svgString(pointRadius: number, party: Party, circleConfig: CircleConfig) {
  return (
    `<svg width="${(2 * pointRadius).toString()}" height="${(2 * pointRadius).toString()}">
      <circle 
        r="${pointRadius.toString()}"
        cx="${pointRadius.toString()}"
        cy="${pointRadius.toString()}"
        stroke="${circleConfig.stroke}"
        stroke-width="${circleConfig.strokeWidth.toString()}"
        stroke-opacity="${circleConfig.strokeOpacity.toString()}"
        fill="${circleConfig.fill[party]}"
        fill-opacity="${circleConfig.fillOpacity.toString()}"
      />
    </svg>`
  )
}

export default async function buildPNGs(layouts: Layouts, circleConfig: CircleConfig) {
  const converter = await createConverter({
    launch: { executablePath }
  })
  const out = (Object.entries(layouts) as [ScreenSize, Layout][]).map((
    [screenSize, layout],
    screenSizeIdx,
    allEntries
  ) => {
    return ([
      screenSize,
      {
        svgNoParty: svgString(layout.pointRadius, "none", circleConfig),
        svgDemocrat: svgString(layout.pointRadius, "Democrat", circleConfig),
        svgIndependent: svgString(layout.pointRadius, "Independent", circleConfig),
        svgRepublican: svgString(layout.pointRadius, "Republican", circleConfig)
      }
    ] as [ScreenSize, { svgNoParty: string, svgDemocrat: string, svgIndependent: string, svgRepublican: string }])
  })//now map this to an array of [ScreenSize, {noParty: pngbuffer, democrat: pngbuffer, etc.}]
}