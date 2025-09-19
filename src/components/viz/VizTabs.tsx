import "./VizTabs.css";
import * as Tabs from "@radix-ui/react-tabs";
import { useInnerWidth } from "../../hooks/useInnerWidth";
import Imp from "./Imp";

export default function VizTabs() {
  /* 
  the hook useInnerWidth does the following:
  1) sets up reactive state that defines layout parameters (like vizWidth) for each viz (imp, perf, etc).
  2) calls useEffect, passing it a callBack that...
    (a) puts a listener on the window 'resize' event with a handler 
    that updates layout state whenever the window resizes into a range that
    does not match the breakpoint active according to the current layout, 
    (b) calls that handler.
  The uphsot is that when VizTabs is first rendered, the window.innerWidth is read 
  and the relavant breakpoint is
  set in the layout object.  Further, a listener is set that fires a handler to reset 
  the layout object whenever the window is resized to the point that a different breakpoint
  is required.
  
  We will pass objects in the layout as a prop to the various viz components below.
  Thus each viz will re-render when the window re-sizes to the extent that the breakpoint changes. 
  */
  const layout = useInnerWidth();
  return (
    <Tabs.Root className="viztabs-root" defaultValue="imp">
      <Tabs.List className="viztabs-tablist">
        <Tabs.Trigger className="viztabs-trigger" value="imp">
          Importance
        </Tabs.Trigger>
        <Tabs.Trigger className="viztabs-trigger" value="perf">
          Performance
        </Tabs.Trigger>
        <Tabs.Trigger className="viztabs-trigger" value="brightlines">
          Bright Lines
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content className="viztabs-content" value="imp">
        {layout.imp && (
          <Imp
            key={layout.imp.breakPointKey}
            breakPoint={layout.imp.breakPointKey}
            layoutConfig={layout.imp.config}
          />
        )}
      </Tabs.Content>
      <Tabs.Content className="viztabs-content" value="perf"></Tabs.Content>
      <Tabs.Content
        className="viztabs-content"
        value="brightlines"
      ></Tabs.Content>
    </Tabs.Root>
  );
}
