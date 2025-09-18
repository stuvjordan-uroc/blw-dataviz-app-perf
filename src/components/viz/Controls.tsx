import type { ChangeEvent } from "react";
import type { RequestedView } from "../../hooks/use-view";
import "./Controls.css";
export default function Controls({
  requestedView,
  updateViewHandler,
}: {
  requestedView: RequestedView;
  updateViewHandler: (viewKey: keyof RequestedView, newVal: boolean) => void;
}) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const viewKey = event.target.id as "response" | "wave" | "party";
    const newVal = event.target.checked;
    updateViewHandler(viewKey, newVal);
  }
  return (
    <form>
      {Object.entries(requestedView).map(([splitKey, split], idx) => (
        <label key={splitKey}>
          {"Split by " + splitKey}
          <input
            type="checkbox"
            checked={split}
            id={splitKey as "response" | "wave" | "party"}
            disabled={idx > 0 && !requestedView.response}
            onChange={handleChange}
          />
        </label>
      ))}
    </form>
  );
}
