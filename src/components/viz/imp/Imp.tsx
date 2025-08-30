import Controls from "./Controls";
import "./Imp.css";
import { useState } from "react";

export default function Imp() {
  //split-by controls
  const [isSplitByWave, setIsSplitByWave] = useState(false);
  const [isSplitByParty, setIsSplitByParty] = useState(false);
  return (
    <>
      <Controls
        waveState={{ state: isSplitByWave, setter: setIsSplitByWave }}
        partyState={{ state: isSplitByParty, setter: setIsSplitByParty }}
      />
    </>
  );
}
