import { useEffect, useState } from "react";
import layouts from "../config/layouts.json";
import type { BreakpointKey, BreakpointConfig } from "../config/layouts-types";

export function useInnerWidth() {
  const [layout, setLayout] = useState<{ imp: ({ breakPointKey: BreakpointKey } & BreakpointConfig) | undefined }>({ imp: undefined })
  useEffect(() => {
    //handler to run when window size changes
    function handleResize() {
      //first deal with the breakpoints for the imp viz
      //find the first breakpoint that has an upper bound on its range that the current
      //window innerWidth is less than or equal to
      const matched = Object.entries(layouts.imp).find(([bp, bpConfig]) =>
        window.innerWidth <= bpConfig.screenWidthRange[1]) as [BreakpointKey, BreakpointConfig] | undefined
      if (!matched) { //matched will be undefined if somehow the window is wider than the widest upper bound.
        setLayout({
          ...layout,
          imp: undefined
        })
      } else { //things are working as they should...there is a breakpoint in layouts.json that matches the current window.innerWidth
        const currentActiveBreakPointKey = matched[0];
        const currentActiveBreakPointConfig = matched[1];
        //we don't want to update the layout state here unless the current layout is undefined
        // or the breakpoint implied by the current window size is different 
        // than the breakpoint already held in the state.
        //so we condition on all that before calling setLayout
        if (layout.imp === undefined || layout.imp.breakPointKey !== currentActiveBreakPointKey) {
          setLayout((prevlayout) => ({
            ...prevlayout,
            imp: {
              ...currentActiveBreakPointConfig,
              breakPointKey: currentActiveBreakPointKey
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