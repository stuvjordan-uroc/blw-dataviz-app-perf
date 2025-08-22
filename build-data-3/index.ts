import path from 'node:path'
import makeData from './functions-and-types/make-data.ts';
import type { ImpViz, Layout, Out, PointsMap, SegmentViews, Segment, SegmentGroupedViews, VizConfig } from './functions-and-types/types.ts';
import makeImpProportionsMap from './functions-and-types/make-proportions-map.ts';
import makeCountsMap from './functions-and-types/make-counts-map.ts';
import makeEmptyPointsMap from './functions-and-types/make-empty-points-map.ts';
import setPointCoordinatesUnsplit from './functions-and-types/set-point-coordinates/unsplit.ts';
//for dev/debug
import util from 'node:util'
import segmentViewMapByResponseExpanded from './functions-and-types/make-segment-view-maps/byResponseExpanded.ts';
import setPointCoordinatesByResponseExpanded from './functions-and-types/set-point-coordinates/byResponseExpanded.ts';
import proportionsAndCounts from './functions-and-types/proportions-and-counts.ts';
//path to raw data
const rawDataPathString = path.resolve(
  "build-data-fixed-layout",
  "raw-data/dem_characteristics_importance.gz"
);
//load the data
const data = makeData(rawDataPathString);
if (data) {
  const out = {} as { vizConfig: VizConfig, imp: Record<string, object> }
  //const out = {} as Out;
  out.vizConfig = {
    responseGroups: {
      collapsed: [["Not relevant", "Beneficial"], ["Important", "Essential"]],
      expanded: [["Not relevant"], ["Beneficial"], ["Important"], ["Essential"]]
    },
    partyGroups: [["Democrat"], ["Independent", "Other"], ["Republican"]],
    sampleSize: 100
  }
  out.imp = {} as Record<string, ImpViz>
  data.impCols.forEach(impVar => {
    out.imp[impVar] = proportionsAndCounts(impVar, data, out.vizConfig)
    //console.log('setting up the out object for impVar', impVar)
    //out.imp[impVar] = {} as ImpViz
    //populate the proportions map
    // out.imp[impVar].proportions = makeImpProportionsMap(impVar, data, out.vizConfig)
    // //populate the counts map
    // out.imp[impVar].counts = makeCountsMap(data, out.vizConfig, out.imp[impVar].proportions)
    // out.imp[impVar].viz = {} as Record<
    //   string, //screen size
    //   {
    //     layout: Layout,
    //     segments: SegmentViews,
    //     points: PointsMap
    //   }
    // >
    // out.imp[impVar].viz.small = {
    //   layout: {} as Layout,
    //   segments: {} as SegmentViews,
    //   points: new Map() as PointsMap
    // }
    // /*  SMALL LAYOUT */
    // out.imp[impVar].viz.small.layout = {
    //   labelHeight: 30,
    //   partyGap: 2 * 3 * 3 / 2 * 3 / 2,
    //   pointRadius: 3,
    //   responseGap: 2 * 3 * 3 / 2,
    //   screenWidthRange: [0, 678],
    //   vizWidth: 360,
    //   waveHeight: 90
    // }
    // //initialize the empty segment property
    // out.imp[impVar].viz.small.segments.unsplit = {} as Segment
    // out.imp[impVar].viz.small.segments.collapsed = {} as SegmentGroupedViews
    // out.imp[impVar].viz.small.segments.expanded = {} as SegmentGroupedViews
    // //set up the unsplit segment
    // out.imp[impVar].viz.small.segments.unsplit = {
    //   topLeftY: out.imp[impVar].viz.small.layout.labelHeight,
    //   topLeftX: 0,
    //   height: out.imp[impVar].proportions.values().filter(valAtWave => valAtWave !== null).toArray().length * out.imp[impVar].viz.small.layout.waveHeight,
    //   width: out.imp[impVar].viz.small.layout.vizWidth
    // }
    // //initialize the empty points map
    // out.imp[impVar].viz.small.points = makeEmptyPointsMap(out.imp[impVar].counts)
    // //set the point coordinates for the unsplit view
    // setPointCoordinatesUnsplit(
    //   out.imp[impVar].viz.small.points,
    //   out.imp[impVar].viz.small.segments.unsplit,
    //   out.imp[impVar].viz.small.layout,
    //   out.imp[impVar].counts
    // )
    // //NEXT STEP: Build the segments for the expanded byResponse view
    // //and assign the points for the expanded byResponse view.
    // //create the segments
    // out.imp[impVar].viz.small.segments.expanded.byResponse = segmentViewMapByResponseExpanded(
    //   out.imp[impVar].proportions,
    //   out.vizConfig,
    //   out.imp[impVar].viz.small.layout
    // )
    // console.log('Assigning points for expanded byResponse view')
    // //assign the points.
    // setPointCoordinatesByResponseExpanded(
    //   out.imp[impVar].viz.small.points,
    //   out.imp[impVar].viz.small.segments.expanded.byResponse,
    //   out.imp[impVar].viz.small.layout,
    //   out.imp[impVar].counts,
    //   out.vizConfig
    // )
  })
  //TO DO: layout does not vary with the impVar, so move it up.

  console.log('progress so far on =gov_stats=')
  console.log(util.inspect(out.imp.gov_stats, true, 6, true))



}