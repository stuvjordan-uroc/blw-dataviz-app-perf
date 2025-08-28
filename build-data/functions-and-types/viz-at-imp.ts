import type {
  Data,
  VizConfig,
  Layout,
  Layouts,
  ImpViz,
  SegmentViews,
  PointsMap,
} from "./types.ts";
import proportionsAndCounts from "./proportions-and-counts.ts";
import makePointsMap from "./points-map/make-points-map.ts";
import {
  unSplit,
  makeSegmentViewsExpanded,
} from "./make-segment-views-expanded.ts";

export default function vizAtImp(
  impVar: string,
  data: Data,
  vizConfig: VizConfig,
  layouts: Layouts
): ImpViz {
  const pAndC = proportionsAndCounts(impVar, data, vizConfig);
  return {
    proportionsAndCounts: pAndC,
    viz: Object.fromEntries(
      Object.entries(layouts).map(([screenSize, layout]) => {
        const segments: SegmentViews = {
          unsplit: unSplit(pAndC, layout as Layout, data.waves.imp.length),
          expanded: makeSegmentViewsExpanded(
            pAndC,
            layout as Layout,
            data.waves.imp.length,
            vizConfig.partyGroups.length
          ),
          collapsed: {
            byResponse: new Map(),
            byResponseAndWave: new Map(),
            byResponseAndParty: new Map(),
            byResponseAndWaveAndParty: new Map(),
          },
        };
        return [
          screenSize,
          {
            segments: segments,
            points: makePointsMap(segments),
          },
        ];
      })
    ) as {
      [screenSize in keyof Layouts]: {
        segments: SegmentViews;
        points: PointsMap;
      };
    },
  };
}
