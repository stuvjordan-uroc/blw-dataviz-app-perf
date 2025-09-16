import { useState } from "react";
import type { ChangeEvent } from "react";
import type { RequestedView } from "../../hooks/use-view";
import "./Controls.css";
export default function Controls({
  requestedView,
  patchRequestedView,
  updateViewHandler,
}: {
  requestedView: React.RefObject<RequestedView>;
  patchRequestedView: (
    prevView: RequestedView,
    viewKey: "response" | "wave" | "party",
    value: boolean
  ) => RequestedView;
  updateViewHandler: (newRequestedView: RequestedView) => void;
}) {
  const [rv, setRv] = useState(requestedView.current);
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const viewKey = event.target.id as "response" | "wave" | "party";
    const newVal = event.target.checked;
    setRv((prevRequestedView) => {
      //compute the new requested view
      const newRequestedView = patchRequestedView(
        prevRequestedView,
        viewKey,
        newVal
      );
      //update requestedView and viewData refs
      updateViewHandler(newRequestedView);
      //update the local representation of the requested view
      return newRequestedView;
    });
  }
  return (
    <form>
      {Object.entries(rv).map(([splitKey, split], idx) => (
        <label key={splitKey}>
          {"Split by " + splitKey}
          <input
            type="checkbox"
            checked={split}
            id={splitKey as "response" | "wave" | "party"}
            disabled={idx > 0 && !rv.response}
            onChange={handleChange}
          />
        </label>
      ))}
    </form>
  );
}
