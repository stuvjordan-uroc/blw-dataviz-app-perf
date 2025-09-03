import type React from "react";
import "./Controls.css";
import { useState } from "react";
import type { ViewKeys, ViewState } from "./Imp";

export default function Controls({
  viewChangeHandler,
}: {
  viewChangeHandler: (newView: ViewState) => void;
}) {
  //set up state that determines whether buttons are clickable
  //we want this set to true only once the canvases have rendered
  const [viewState, setViewState] = useState<ViewState>({
    splitByResponse: false,
    splitByWave: false,
    splitByParty: false,
  });
  function handleCheckedChange(
    e: React.ChangeEvent<HTMLInputElement>,
    whichInput: ViewKeys[number]
  ) {
    const newSplitVal = e.target.checked;
    setViewState((prevState) => {
      //first get the new value of splitByResponse, which will depend on the prevState if whichInput is not splitByResponse
      const newSplitByResponseValue =
        whichInput === "splitByResponse"
          ? newSplitVal
          : prevState.splitByResponse;
      //set the new view state depending on the newSplitByResponseValue and the prevState
      const newViewState = newSplitByResponseValue
        ? {
            //if the new view is split by response, just use whatever new value was passed
            ...prevState,
            [whichInput]: newSplitVal,
          }
        : {
            //if the new view is not split by response, the new value should have all splits false
            splitByResponse: false,
            splitByWave: false,
            splitByParty: false,
          };
      //call the change handler to update the views in light of the new state value
      viewChangeHandler(newViewState);
      //return the new state value to set the update the state
      return newViewState;
    });
  }
  function handleCheckedChangeFactory(whichInput: ViewKeys[number]) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      handleCheckedChange(e, whichInput);
    };
  }
  //set up an effect that depends on the viewRef.
  //Since it depends on the viewRef, this effect will run
  return (
    <form>
      <label>
        split by response
        <input
          type="checkbox"
          checked={viewState.splitByResponse}
          onChange={handleCheckedChangeFactory("splitByResponse")}
        />
      </label>
      {viewState.splitByResponse && (
        <>
          <label>
            split by wave
            <input
              type="checkbox"
              checked={viewState.splitByWave}
              onChange={handleCheckedChangeFactory("splitByWave")}
            />
          </label>
          <label>
            split by party
            <input
              type="checkbox"
              checked={viewState.splitByParty}
              onChange={handleCheckedChangeFactory("splitByParty")}
            />
          </label>
        </>
      )}
    </form>
  );
}
