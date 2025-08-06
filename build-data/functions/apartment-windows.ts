import lodash from 'lodash';


export default function apartmentWindows(topLeftX: number, topLeftY: number, buildingWidth: number, buildingHeight: number, numResidents: number) {
  /* 
  We're going to divide the building up into K rows and K columns of apartment windows, for K**2 total windows.
  Because the number of rows and columns will be equal, the windows will have the same aspect ratio as the building itself.  
  We want to set the total number of windows larger than the number of residents, but as close to that number as possible.

  i.e. we want to min K subject to K**2 >= numResidents

  So, set K = ceiling(sqrt(numResidents))


  */

  const K = Math.ceil(Math.sqrt(numResidents));
  const windowWidth = buildingWidth / K;
  const windowHeight = buildingHeight / K;
  //residents will be an array holding the radii, cx, and cy of the residents.
  //it should in the end have numResidents elements.
  const residents = [];
  //of course, there are more windows than residents (by K**2 - numResidents)
  //so we randomly select K**2 - numResidents windows to be empty
  const emptyWindowIndices = lodash.sampleSize(new Array(K ** 2).fill(1).map((el, idx) => idx), K ** 2 - numResidents);
  //the radius of each circle representing a resident must be small enough that the whole circle fits inside each window.
  const residentRadius = Math.min(windowWidth, windowHeight) / 2.0;
  rowLoop: for (let row = 1; row <= K; row++) { //go row-by-row, all the way from the top to the bottom of the building
    colLoop: for (let column = 1; column <= K; column++) { // within each row, go column-by-column across the width of the building
      if (emptyWindowIndices.includes(row - 1 + column - 1)) {  //if this evaluates to true, we are at a window that we have randomly selected to be empty...
        if (column < K) {  //so if we're in the middle of a row...
          continue colLoop; //go to the next window over in the same row.
        } else {            //and if we're at the end of a row...
          continue rowLoop; //go to the next row
        }
      }
      residents.push({  //if we get here, we're at a window into which we'll insert a resident
        r: residentRadius,  //radius of circle representing the resident
        cx: topLeftX + (column - 1) * windowWidth + residentRadius + Math.random() * (windowWidth - 2 * residentRadius),  //jitter cx within window
        cy: topLeftY + (row - 1) * windowHeight + residentRadius + Math.random() * (windowHeight - 2 * residentRadius)    //jitter cy within window
      })
    }
  }
  return (residents)
}
