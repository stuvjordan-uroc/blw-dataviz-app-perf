import type {
  Data,
  VizConfig,
  Layout,
  SegmentViews,
  SegmentViewsUnMapped,
  PointsMapUnMapped,
} from "./types.ts";
import proportionsAndCounts from "./proportions-and-counts.ts";
import makePointsMap from "./points-map/make-points-map.ts";
import {
  unSplit,
  makeSegmentViewsExpanded,
} from "./make-segment-views-expanded.ts";
import { unMapSegmentViews, unMapPointsMap } from "./unmap.ts";

export function vizAtImp(
  char: string,
  q: "imp" | "perf",
  data: Data,
  vizConfig: VizConfig,
  layout: Layout
): {
  segments: SegmentViewsUnMapped;
  points: PointsMapUnMapped;
} {
  const pAndC = proportionsAndCounts(char, q, data, vizConfig);
  const segments: SegmentViews = {
    unsplit: unSplit(pAndC, layout, data.waves[q].length),
    expanded: makeSegmentViewsExpanded(
      pAndC,
      layout,
      data.waves[q].length,
      vizConfig.partyGroups.length
    ),
    collapsed: {
      byResponse: new Map(),
      byResponseAndWave: new Map(),
      byResponseAndParty: new Map(),
      byResponseAndWaveAndParty: new Map(),
    },
  };
  return {
    segments: unMapSegmentViews(segments), //transform maps to arrays of tuples
    points: unMapPointsMap(makePointsMap(segments)), //transform maps to arrays of tuples here
  };
}
