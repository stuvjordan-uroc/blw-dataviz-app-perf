import { useEffect, useState } from "react";
import layouts from "../config/layouts.json";
import type { BreakpointKey, BreakpointConfig } from "../config/layouts-types";

export function useInnerWidth() {
  const [layout, setLayout] = useState<{
    imp: ({ breakPointKey: BreakpointKey } & BreakpointConfig) | undefined
  }
  >({ imp: undefined })
  useEffect(() => {
    //handler to run when window size changes
    function handleResize() {
      //get the new window size
      const newWindowWidth = window.innerWidth
      //first deal with the breakpoints for the imp viz
      //find the first breakpoint from the config that has an upper bound on its range that the current
      //window innerWidth is less than or equal to
      const matchedLayoutEntry = (Object.entries((layouts.imp as Record<BreakpointKey, BreakpointConfig>)) as [BreakpointKey, BreakpointConfig][]).find((
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        [_breakPointKey, BreakpointConfig]: [BreakpointKey, BreakpointConfig],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _layoutIdx,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _keyVals
      ) => newWindowWidth <= BreakpointConfig.screenWidthRange[1])
      if (!matchedLayoutEntry) { //matchedLayoutEntry will be undefined if somehow the window is wider than the widest upper bound.
        console.log("tried to set the layout for the impViz.  But the failed to find a breakpoint matching the current window innerwidth")
        console.log("window")
        setLayout({
          ...layout,
          imp: undefined
        })
      } else { //things are working as they should...there is a breakpoint in layouts.json at the imp property that matches the current window.innerWidth
        const newBreakPointKey = matchedLayoutEntry[0];
        const newBreakPointConfig = matchedLayoutEntry[1];
        //we don't want to update the layout state here unless the current layout is undefined
        // or the new breakpoint implied by the new window size is different 
        // than the breakpoint already held in the state.
        //so we condition on all that before calling setLayout
        if (layout.imp === undefined || layout.imp.breakPointKey !== newBreakPointKey) {
          setLayout((prevlayout) => ({
            ...prevlayout,
            imp: {
              ...newBreakPointConfig,
              breakPointKey: newBreakPointKey
            }
          }))
        }

      }
      //add code here to handle layouts for vizs other than imp
    }
    //add listener for window resize
    window.addEventListener('resize', handleResize);
    //call handler so that layout state is set for the component using this hook when it is rendered
    handleResize();
    //clean up the event listener when component unmounts
    return () => { window.removeEventListener('resize', handleResize) }
  })
  //supply the layout state
  return layout
}