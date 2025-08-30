import Controls from "./Controls";
import "./Imp.css";
import { useEffect, useState } from "react";

export default function Imp() {
  //split-by controls
  const [isSplitByWave, setIsSplitByWave] = useState(false);
  const [isSplitByParty, setIsSplitByParty] = useState(false);
  //screensize state
  const [screenSize, setScreenSize] = useState("small");
  //listener on window to set screensize
  useEffect(() => {
    function handleResize() {}
  });
  return (
    <>
      <Controls
        waveState={{ state: isSplitByWave, setter: setIsSplitByWave }}
        partyState={{ state: isSplitByParty, setter: setIsSplitByParty }}
      />
    </>
  );
}
