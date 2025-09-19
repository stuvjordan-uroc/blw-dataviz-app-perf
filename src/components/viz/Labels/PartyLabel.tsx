//css
import "./PartyLabel.css";
//hooks
import { useLabelDimensions } from "../../../hooks/useLabelDimensions";

export default function PartyLabel({
  partyGroup,
  partyGroupIdx,
  partyGroupWidth,
  partyGap,
  pointsBottomTop,
}: {
  partyGroup: string[];
  partyGroupIdx: number;
  partyGroupWidth: number;
  partyGap: number;
  pointsBottomTop: number;
}) {
  const [labelDimensions, labelRef] = useLabelDimensions();
  return (
    <div
      ref={labelRef}
      //appearance is specified in PartyLabel.css under className "party-label"
      className="party-label"
      //positioning
      style={{
        position: "absolute",
        left:
          (
            (partyGroupWidth + partyGap) * partyGroupIdx +
            partyGroupWidth / 2 -
            labelDimensions.width / 2
          ).toString() + "px",
        top: pointsBottomTop.toString() + "px",
      }}
    >
      {partyGroup.join(" or ")}
    </div>
  );
}
