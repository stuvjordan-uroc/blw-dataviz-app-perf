function discretizeWidths(smoothWidths: number[], windowWidth: number) {
  //assume that the rawWidths sum to the total width available.
  const totalWidth = smoothWidths.reduce((acc, curr) => acc + curr, 0);
  if (totalWidth < windowWidth * smoothWidths.length) {
    console.log("WARNING: Not enough space to discretize these widths.");
    return undefined;
  }
  //get the order of the smoothWidths from from narrowest to widest
  const widthOrder = new Array(smoothWidths.length)
    .fill(1)
    .map((el, idx) => idx)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .sort(
      (firstEl, secondEl) => smoothWidths[firstEl]! - smoothWidths[secondEl]!
    );
  //create a "stock" of windows to allocate among the smoothwidths:
  let stockOfWindows = Math.floor(totalWidth / windowWidth);

  //allocate one window to each width.  This works because we failed the totalWidth < windowWidth * smoothWidths.length test
  const outWidths = new Array(smoothWidths.length).fill(1);
  stockOfWindows = stockOfWindows - smoothWidths.length;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  widthOrder.filter(
    (smoothWidthIndex) =>
      outWidths[smoothWidthIndex] * windowWidth <
      smoothWidths[smoothWidthIndex]!
  );
  //the indices left in widthOrder refer to elements of smoothWidths that still have some width remainig.
}

export default function segmentsFixed(
  pointRadius: number,
  windowWidth: number,
  segmentGap: number,
  vizWidth: number,
  counts: number[]
) {
  /*
  Return an array of arrays of coordinates at which circles will be placed to form a segment viz.

  Segments will be rectangular blocks of square "windows", each window with width and height windowWidth.

  Widths of these rectangles of windows will be set to approximate the proportions implied by `counts`  -- which is an
  array of numbers assumed to be between non-negative integers.

  However, each rectangle is constrained to be at least one window wide, and of course to be some whole number of
  windows across.
  */
  const horizontalSpaceAfterGaps = vizWidth - segmentGap * (counts.length - 1);
  //hozontalSpaceAfterGaps is the amount of space in which to build the segments.
  //There will be counts.length segments, and each must be at least 1 window wide.
  //So we need horizontalSpaceAfterGaps to be at least counts.length*windowWidth
  //for this to work
  if (horizontalSpaceAfterGaps < counts.length * windowWidth) {
    console.log(
      "WARNING: There is not enough horiztonal space in the parameters you passed to segementsFixed."
    );
    return undefined;
  }

  /* 
  Now compute the number of windows across the horizontal axis for each segment.
  */
  const total = counts.reduce((acc, curr) => acc + curr, 0);
  const segmentWidthsSmooth = counts.map(
    (count) => (horizontalSpaceAfterGaps * count) / total
  );
  //segmentWidthsSmooth is a "smooth" depiction of how wide each segment should be
  //but we need a "discrete" version that allows for the fact that a whole number of windows of fixed width
  //need to be placed in each segment.
}
