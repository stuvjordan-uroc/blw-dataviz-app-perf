import { useState } from "react";
import type { FormEventHandler } from "react";
import type { RequestedView } from "../../hooks/use-view";
import "./Controls.css";
export default function Controls({
  requestedView,
}: {
  requestedView: React.RefObject<RequestedView>;
}) {
  const [rv, setRv] = useState(requestedView.current);
  const rvData = rv.map((split, idx) => ({
    splitId: idx === 0 ? "by-response" : idx === 1 ? "by-wave" : "by-party",
    splitOnValue: idx === 0 ? "expanded" : idx === 1 ? "wave" : "party",
    labelText:
      idx === 0
        ? "Split by response"
        : idx === 1
          ? "Split by wave"
          : "Split by party",
    checked: !(split === null),
    split: split,
    idx: idx,
  }));
  const handleBubbledChange = (e: FormEventHandler<HTMLFormElement>) => {
    const inputChecked = (e.target as HTMLInputElement).checked;
    const whichSplit = rvData.find(
      ({ splitId }) => splitId === (e.target as HTMLInputElement).id
    );
    if (whichSplit) {
      setRv((prevRv) => {
        if (whichSplit.idx === 0 && inputChecked === false) {
          return [null, null, null];
        }
        const newRv = [];
        newRv.push(whichSplit.idx === 0 ? "expanded" : prevRv[0]);
        newRv.push(
          whichSplit.idx === 1
            ? whichSplit.checked
              ? rvData[1].splitOnValue
              : null
            : prevRv[1]
        );
        newRv.push(
          whichSplit.idx === 2
            ? whichSplit.checked
              ? rvData[2].splitOnValue
              : null
            : prevRv[2]
        );
        return newRv as RequestedView;
      });
    }
  };
  return (
    <form onChange={handleBubbledChange}>
      {rvData.map(({ splitId, labelText, checked }) => (
        <label key={splitId}>
          {labelText}
          <input
            type="checkbox"
            checked={checked}
            id={splitId}
            disabled={splitId === "by-response" ? false : rv[0] === null}
          />
        </label>
      ))}
    </form>
  );
}
