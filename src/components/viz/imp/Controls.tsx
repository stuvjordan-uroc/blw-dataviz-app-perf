import type React from "react";
import "./Controls.css";
import { useState } from "react";

interface ViewState {
  splitByWave: boolean;
  splitByParty: boolean;
}

export default function Controls({
  viewChangeHandler,
}: {
  viewChangeHandler: (newView: ViewState) => void;
}) {
  //set up state that determines whether buttons are clickable
  //we want this set to true only once the canvases have rendered
  const [viewState, setViewState] = useState<ViewState>({
    splitByWave: false,
    splitByParty: false,
  });
  function handleCheckedChange(
    e: React.ChangeEvent<HTMLInputElement>,
    whichInput: "splitByWave" | "splitByParty"
  ) {
    const newSplitVal = e.target.checked;
    setViewState((prevState) => {
      const newViewState = {
        ...prevState,
        [whichInput]: newSplitVal,
      };
      viewChangeHandler(newViewState);
      return newViewState;
    });
  }
  function handleCheckedChangeFactory(
    whichInput: "splitByWave" | "splitByParty"
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      handleCheckedChange(e, whichInput);
    };
  }
  //set up an effect that depends on the viewRef.
  //Since it depends on the viewRef, this effect will run
  return (
    <form>
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
    </form>
  );
}
