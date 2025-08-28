import type { GroupedState, PAndC } from "./types.ts";

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
