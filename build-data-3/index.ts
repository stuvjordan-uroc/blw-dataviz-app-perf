import path from 'node:path'
import makeData from './functions-and-types/make-data.ts';
import type { ImpViz, Layout, Out, PointsMap, SegmentViews, VizConfig, Segment, SegmentGroupedViews } from './functions-and-types/types.ts';
//for dev/debug
import util from 'node:util'
import proportionsAndCounts from './functions-and-types/proportions-and-counts.ts';
import { makeSegmentViewsExpanded, unSplit } from './functions-and-types/make-segment-views-expanded.ts';
//path to raw data
const rawDataPathString = path.resolve(
  "build-data-fixed-layout",
  "raw-data/dem_characteristics_importance.gz"
);
//load the data
const data = makeData(rawDataPathString);
if (data) {
  const out = {} as Out
  out.vizConfig = {
    responseGroups: {
      collapsed: [["Not relevant", "Beneficial"], ["Important", "Essential"]],
      expanded: [["Not relevant"], ["Beneficial"], ["Important"], ["Essential"]]
    },
    partyGroups: [["Democrat"], ["Independent", "Other"], ["Republican"]],
    sampleSize: 100
  } as VizConfig
  out.imp = {} as Record<string, ImpViz>
  data.impCols.forEach(impVar => {
    out.imp[impVar] = {
      proportionsAndCounts: proportionsAndCounts(impVar, data, out.vizConfig),
      viz: {} as Record<string, { layout: Layout, segments: SegmentViews, points: PointsMap }>
    }
    // /*  SMALL LAYOUT */
    out.imp[impVar].viz.small = {
      layout: {
        labelHeight: 30,
        partyGap: 2 * 3 * 3 / 2 * 3 / 2,
        pointRadius: 3,
        responseGap: 2 * 3 * 3 / 2,
        screenWidthRange: [0, 678],
        vizWidth: 360,
        waveHeight: 90
      },
      segments: {
        unsplit: unSplit(
          out.imp[impVar].proportionsAndCounts,
          {
            labelHeight: 30,
            partyGap: 2 * 3 * 3 / 2 * 3 / 2,
            pointRadius: 3,
            responseGap: 2 * 3 * 3 / 2,
            screenWidthRange: [0, 678],
            vizWidth: 360,
            waveHeight: 90
          },
          data.waves.imp.length
        ),
        expanded: makeSegmentViewsExpanded(
          out.imp[impVar].proportionsAndCounts,
          {
            labelHeight: 30,
            partyGap: 2 * 3 * 3 / 2 * 3 / 2,
            pointRadius: 3,
            responseGap: 2 * 3 * 3 / 2,
            screenWidthRange: [0, 678],
            vizWidth: 360,
            waveHeight: 90
          },
          data.waves.imp.length,
          out.vizConfig.partyGroups.length
        ),
        collapsed: {
          byResponse: new Map(),
          byResponseAndWave: new Map(),
          byResponseAndParty: new Map(),
          byResponseAndWaveAndParty: new Map()
        }
      },
      points: new Map()
    }


    //TO DO: layout does not vary with the impVar, so move it up.

    console.log('progress so far on =gov_stats=')
    //console.log(util.inspect(out.imp.gov_stats?.viz.small?.points, true, 4, true))
    out.imp.gov_stats?.viz.small?.points.entries().forEach(([rg, rgV]) => {
      rgV.entries().filter(([w, wV]) => wV !== null)
        .forEach(([w, wV]) => {
          wV?.entries().forEach(([pg, pgV]) => {
            console.log(rg, w, pg)
            console.log(out.imp.gov_stats?.proportionsAndCounts.expanded.get(rg)?.waveSplit.get(w)?.partySplit.get(pg)?.c)
            console.log(pgV.expanded.byResponse.length)
            //console.log(util.inspect(pgV.expanded.byResponse, true, 1, true))
          })
        })
    })
  }