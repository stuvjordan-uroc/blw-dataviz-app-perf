import type React from "react";
import "./Controls.css";
import { useState } from "react";

export default function Controls({
  viewRef,
}: {
  viewRef: React.RefObject<{
    splitByWave: boolean;
    splitByParty: boolean;
  }>;
}) {
  //set up a state that is set at initial render to the value of the viewRef Ref.
  //We'll use this to keep the control buttons' appearnce synced with the user's choices.
  const [viewState, setViewState] = useState<{
    splitByWave: boolean;
    splitByParty: boolean;
  }>(viewRef.current);
  //This means that when a user clicks on one of these, we need a callback to do two things:
  //(1) mutate the viewRef in a way that triggers code that alters the positions of the points
  //in the canvases
  //(2) call setViewState to alter the appearance of the buttons
  return (
    <form>
      <label>
        split by wave
        <input
          type="checkbox"
          checked={viewState.splitByWave}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            //set the viewState so that the control's appearance updates
            setViewState({
              ...viewState,
              splitByWave: e.target.checked,
            });
            //TODO trigger movement of points...
          }}
        />
      </label>
      <label>
        split by party
        <input
          type="checkbox"
          checked={viewState.splitByParty}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            //set the viewState so that the control's appearance updates
            setViewState({
              ...viewState,
              splitByParty: e.target.checked,
            });
            //TODO trigger movement of points...
          }}
        />
      </label>
    </form>
  );
}
