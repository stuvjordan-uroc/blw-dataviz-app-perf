# Overview

Scripts in this folder take the raw data from the .gz files and build synthetic samples for use in the app. The synthetic samples will assign coordinates to each datapoint, so that less code needs to run on the client to calculate these coordinates.

Each section in this files focuses on one visualization tool in the app, describing the sample used in the tool, the views the tool supplies, the coordinates needed for each point in each view, how those coordinates are calculated by the script, and how the runtime code can use those coordinates to build the views.

# Importance Tool

## Visual Design and Structure

Everthing in this tool is a horizontal segment viz -- i.e. it's nothing but (segmented-by-imp-response) rows of points.

We'll build the tool as a stacked column of HTML 5 canvases, ONE canvas for each democratic principle. (The runtime can then filter and sort the principles by filtering and sorting the canvases.)

The sample will be organized by principle. (See the Sample section below.) In effect, there is ONE sample FOR EACH principle, with all of these samples stored in a single JSON file, as if its all one sample.

Given this design, everything we write in the following is written about the canvas/sample/coordinates _for any given single principle_.

The most basic view, which below we call _unsplit_, has one canvas for each principle, with the canvases stacked vertically. Within each canvas, there is one un-segmented row showing all points in the sample.

The extention of this very basic view, _split by response_, has one canvas for each principle, with the canvases stacked vertically. Within each canvas, there is one _segmented_ row, with one segment for each response, with sampled points grouped into segments by their responses.

The _split by response_ view can be split by party, to make the _split by response AND party_ view. In the canvas for any one principle in this view, there will be THREE rows of segments, laid out horizontally within the canvas. -- democrat row on the left, independent+other row in the middle, republican row on the right.

(add option to "compare party" on a given principle -- rotating the rows to columns???)

Each of the _split by response_ view and the _all principles, split by response AND party_ view can be "split by wave". In any "split by wave" view, there is (like all the other views), one canvas for each principle, with the canvases stacked vertically. Within each canvas, there are multiple segmented rows of points, one row for each wave. (Null waves on any one principle have space allocated for a row of points, but no row of points rendered in that space.) At each wave, there is one row of points in the case of the _split by response AND wave_ view, and three horizontally-laid-out rows points in the case of the _split by response AND wave AND party_ view.

Finally, each view that is _split by response_, is further split into two sub-views: _expanded_ and _collapsed_. It the _expanded_ view, each row of points is split into 4 segments -- one for each response to the imp questions. In the _collapsed_ view, each row of points is split into 2 segments -- one for the bottom two responses, one for the top two responses.

## Element sizes

We will build for four screen-width ranges, assigning a fixed width to the canvas on which points will be arrayed for each range. In addition to fixing the width of the canvas at each range, we also need to fix two other parameters -- point radius, window width, and window height. What these mean will be explained later.

- **SMALL SCREENS**, defined as width < 768px. (The narrowest ipad is 760px wide.).
  - **canvas width** 360px.
  - **point radius** 3px.
  - **window width and height** 9px.

- **MEDIUM SCREENS**, defined as 768px <= width < 1024px (ipads are in this range in portrait mode. The largest ipad hits 1024 in landscape mode)
  - **canvas width** 760px.
  - **point radius** 4px.
  - **window width and height** 12px.

- **LARGE SCREENS**, defined as 1024px <= width < 1200px (laptops tend to be 1024+. We put a max width on our app of 1200px)
  - **canvas width** 1020px.
  - **point radius** 4px.
  - **window width and height** 12px.

- **XL SCREENS**, defined as 1200px <= width. (We put a max width on our app of 1200px).
  - **canvas width** 1180px.
  - **point radius** 4px.
  - **window width and height** 12px.

## Coordinate system

As mentioned above, in every view, each principle will have it's own canvas, so the coordinates for any given point will be relative to the canvas it belongs to.

To pin down the location of a point in any one canvas, we'll use x coordinates that range from 0 to 100. In effect, this will be the complete plotting area for the points -- There WILL be points with x coordinate aribtrarily close to 0 and there WILL be points with x coordinate arbitrarily close to 100, and all points will have x between 0 and 100. It will be up to runtime to translate these points into the coordinate system of whatever canvas it actually renders.

The y coordinate system will depend on whether we are working with a _split by wave_ view.

For a view that is NOT split-by-wave, y coordinates will range from 0 to 30. In effect, this means that the row height will be about 1/3 the total width of the row or rows (split-by-party has 3 rows laid out side-by-side) of points. As with the x coordinates, there WILL be points with y coordinate aribtrarily close to 0 and there WILL be points with y coordinate aribtrarily close to 30, and all points will have y coordinates between these values.

For a view that IS split-by-wave...let W be the number of waves (not sure right now what that is)...Then y coordinates will range from 0 to W*30 + (W - 1)*10. The idea is that each row of points will have a height of 30 in this coordinate system, and then there will be a 10-coordinate gap between each row of points. As usual, there WILL be points with y coordinates aribtrariliy close to 0, AND there will be points with y coordinates arbitrarily close to W*30 + (W - 1)*10.

## Sample

For a given postive integer constant `SAMPLESIZE` (e.g. `const SAMPLESIZE = 1000`), we construct ONE sample FOR EACH of the 31 democratic principles as follows:

For each survey wave in which the principle was included, we sample:

- `SAMPLESIZE` persons from the set of persons who responded to principle's imp question AND responded `pid3 === 'Republican'`
- `SAMPLESIZE` persons from the set of persons who responded to principle's imp question AND responded `pid3 === 'Democrat'`
- `SAMPLESIZE` persons from the set of persons who responded to principle's imp question AND responded `pid3 === 'Independent' || pid3 === 'Other'`

Notice that this means that for each principle-wave, the sample size is `3*SAMPLESIZE`.

The structure of the JSON containing the generated sample is like this:

```JSON
{
  "imp_votes_impact": {
    "w01": [], //this is what we put for a principle not included in the given wave
    "w02": [
      // ...sample of responses to imp_votes_impact from wave 02 here...
    ],
    //...more waves...
  },
  "imp_private_violence": {
    "w01": [
      // ...sample of responses to imp_private_violence from wave 01 here...
    ],
    "w02": [
      // ...sample of responses to imp_votes_impact from wave 01 here...
    ],
    //...more waves...
  },
  // ...more principles...
}
```

Each sample response (i.e. each element of the wave arrays like `"w01": []`) is an object like this:

```JSON
{
  "response": "Beneficial",
  "pid3": "Republican",
  "unSplit": {"r": 1.3, "cx": 452.3, "cy": -60}
  "byResponse": {
    "expanded": {"r": 1.3, "cx": 12.4, "cy": 127},
    "collapsed": {"r": 1.3, "cx": 82, "cy": 0.072}
  },
  "byReponseParty": {
    "expanded": { "r": 1.3, "cx": 1, "cy": 84},
    "collapsed": { "r": 1.3, "cx": 2, "cy": -673.2}
  },
  "byReponseWave": {
    "expanded": { "r": 1.3, "cx": 1, "cy": 84},
    "collapsed": { "r": 1.3, "cx": 2, "cy": -673.2}
  },
  "byReponseWaveParty": {
    "expanded": { "r": 8, "cx": 1, "cy": 84},
    "collapsed": { "r": 4, "cx": 2, "cy": -673.2}
  }
}
```

## Views

Views:

- **DATA GEN CODE DONE** all principles, unsplit
- **DATA GEN CODE DONE** all principles, split by response, expanded
- **DATA GEN CODE DONE** all principles, split by response, collapse
- **DATA GEN CODE DONE** all principles, split by response AND party, expanded
- **DATA GEN CODE DONE** all principles, split by response AND party, collapsed
- all principles, split by response AND wave, expanded
- all principles, split by response AND wave, collapse
- all principles, split by response AND wave AND party, expanded
- all principles, split by response AND wave AND party, collapsed
