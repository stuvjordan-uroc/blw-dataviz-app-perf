import type {
  PAndC,
  PointsMap,
  SegmentMapR,
  SegmentMapRP,
  SegmentMapRW,
  SegmentMapRWP,
  SegmentViews,
} from "./types.ts";

function mapToKeyValArray<T, K>(map: Map<T, K>): [T, K][] {
  return map.entries().toArray();
}

type UnMappedPAndC = Record<
  string,
  {
    p: number;
    c: number;
    waveSplit: [
      number,
      null | {
        p: number;
        c: number;
        partySplit: [
          string[],
          {
            p: number;
            c: number;
          },
        ][];
      },
    ][];
    partySplit: [
      string[],
      {
        p: number;
        c: number;
      },
    ][];
  }
>;

export function unmapPAndC(pAndC: PAndC) {
  return Object.fromEntries(
    Object.entries(pAndC).map(([groupedState, val]) => [
      groupedState as keyof PAndC,
      mapToKeyValArray(val).map(([rg, rgVal]) => [
        rg,
        {
          ...rgVal,
          waveSplit: mapToKeyValArray(rgVal.waveSplit).map(
            ([wave, waveVal]) => [
              wave,
              waveVal === null
                ? null
                : {
                    ...waveVal,
                    partySplit: mapToKeyValArray(waveVal.partySplit),
                  },
            ]
          ),
          partySplit: mapToKeyValArray(rgVal.partySplit),
        },
      ]),
    ])
  );
}
export function unMapSegmentMapR(segmentMapR: SegmentMapR) {
  return segmentMapR.entries().toArray();
}
export function unMapSegmentMapRP(segmentMapRP: SegmentMapRP) {
  return segmentMapRP
    .entries()
    .toArray()
    .map(([rg, rgVal]) => [rg, rgVal.entries().toArray()]);
}
export function unMapSegmentMapRW(segmenMapRW: SegmentMapRW) {
  return segmenMapRW
    .entries()
    .toArray()
    .map(([rg, rgVal]) => [rg, rgVal.entries().toArray()]);
}
export function unMapSegmentMapRWP(segmentMapRWP: SegmentMapRWP) {
  return segmentMapRWP
    .entries()
    .toArray()
    .map(([rg, rgVal]) => [
      rg,
      rgVal
        .entries()
        .toArray()
        .map(([wave, waveVal]) => [
          wave,
          waveVal === null ? null : waveVal.entries().toArray(),
        ]),
    ]);
}
export function unMapSegmentViews(segmentViews: SegmentViews) {
  return {
    unsplit: segmentViews.unsplit,
    collapsed: {
      byResponse: unMapSegmentMapR(segmentViews.collapsed.byResponse),
      byResponseAndParty: unMapSegmentMapRP(
        segmentViews.collapsed.byResponseAndParty
      ),
      byResponseAndWave: unMapSegmentMapRW(
        segmentViews.collapsed.byResponseAndWave
      ),
      byResponseAndWaveAndParty: unMapSegmentMapRWP(
        segmentViews.collapsed.byResponseAndWaveAndParty
      ),
    },
    expanded: {
      byResponse: unMapSegmentMapR(segmentViews.expanded.byResponse),
      byResponseAndParty: unMapSegmentMapRP(
        segmentViews.expanded.byResponseAndParty
      ),
      byResponseAndWave: unMapSegmentMapRW(
        segmentViews.expanded.byResponseAndWave
      ),
      byResponseAndWaveAndParty: unMapSegmentMapRWP(
        segmentViews.expanded.byResponseAndWaveAndParty
      ),
    },
  };
}
export function unMapPointsMap(pointsMap: PointsMap) {
  return pointsMap
    .entries()
    .toArray()
    .map(([rg, rgVal]) => [
      rg,
      rgVal
        .entries()
        .toArray()
        .map(([wave, waveVal]) => [
          wave,
          waveVal === null ? null : waveVal.entries().toArray(),
        ]),
    ]);
}
