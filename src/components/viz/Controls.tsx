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
    <form className="controls-form">
      {Object.entries(requestedView).map(([splitKey, split], idx) => (
        <div key={splitKey} className="controls-row">
          <input
            type="checkbox"
            checked={split}
            id={splitKey}
            disabled={idx > 0 && !requestedView.response}
            onChange={handleChange}
          />
          <label htmlFor={splitKey} className="controls-label">
            {"Split by " + splitKey}
          </label>
        </div>
      ))}
    </form>
  );
}
