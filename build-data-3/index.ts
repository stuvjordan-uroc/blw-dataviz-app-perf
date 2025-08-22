import path from 'node:path'
import makeData from './functions-and-types/make-data.ts';
import type { ImpViz, Layout, Out, PointsMap, SegmentViews, VizConfig, Segment, SegmentGroupedViews } from './functions-and-types/types.ts';
import makeEmptyPointsMap from './functions-and-types/make-empty-points-map.ts';
import setPointCoordinatesUnsplit from './functions-and-types/set-point-coordinates/unsplit.ts';
//for dev/debug
import util from 'node:util'
import segmentViewMapByResponseExpanded from './functions-and-types/make-segment-view-maps/byResponseExpanded.ts';
import setPointCoordinatesByResponseExpanded from './functions-and-types/set-point-coordinates/byResponseExpanded.ts';
import proportionsAndCounts from './functions-and-types/proportions-and-counts.ts';
import { small } from 'motion/react-client';
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
      layout: {} as Layout,
      segments: {
        unsplit: {} as Segment,
        collapsed: {} as SegmentGroupedViews,
        expanded: {} as SegmentGroupedViews
      } as SegmentViews,
      points: new Map() as PointsMap
    }
    out.imp[impVar].viz.small.layout = {
      labelHeight: 30,
      partyGap: 2 * 3 * 3 / 2 * 3 / 2,
      pointRadius: 3,
      responseGap: 2 * 3 * 3 / 2,
      screenWidthRange: [0, 678],
      vizWidth: 360,
      waveHeight: 90
    }
    //set up the unsplit segment
    out.imp[impVar].viz.small.segments.unsplit = {
      topLeftY: out.imp[impVar].viz.small.layout.labelHeight,
      topLeftX: 0,
      height: data.waves.imp.length * out.imp[impVar].viz.small.layout.waveHeight,
      width: out.imp[impVar].viz.small.layout.vizWidth
    }
    //initialize the empty points map
    out.imp[impVar].viz.small.points = makeEmptyPointsMap(out.imp[impVar].proportionsAndCounts)
    //set the point coordinates for the unsplit view
    setPointCoordinatesUnsplit(
      out.imp[impVar].viz.small.points,
      out.imp[impVar].viz.small.segments.unsplit,
      out.imp[impVar].viz.small.layout,
      out.imp[impVar].proportionsAndCounts
    )
    //NEXT STEP: Build the segments for the expanded byResponse view
    //and assign the points for the expanded byResponse view.
    //create the segments
    out.imp[impVar].viz.small.segments.expanded.byResponse = segmentViewMapByResponseExpanded(
      out.imp[impVar].proportionsAndCounts,
      out.imp[impVar].viz.small.layout
    )
    //assign the points
    setPointCoordinatesByResponseExpanded(
      out.imp[impVar].viz.small.points,
      out.imp[impVar].viz.small.segments.expanded.byResponse,
      out.imp[impVar].proportionsAndCounts,
      out.imp[impVar].viz.small.layout
    )
  })
  //TO DO: layout does not vary with the impVar, so move it up.

  console.log('progress so far on =gov_stats=')
  console.log(util.inspect(out.imp.gov_stats?.viz.small.points, true, 6, true))



}