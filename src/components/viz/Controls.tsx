import "./Controls.css";
import { Root, Thumb } from "@radix-ui/react-switch";
import type { RequestedView } from "../../hooks/use-view";
import { useState } from "react";
export default function Controls({
  requestedView,
}: {
  requestedView: React.RefObject<RequestedView>;
}) {
  const [rv, setRv] = useState<RequestedView>(requestedView.current);
  return (
    <form
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "end",
        gap: "0.5rem",
      }}
    >
      <div className="split-by-option">
        <label
          className="Label"
          htmlFor="by-response"
          style={{ paddingRight: 15 }}
        >
          Split By Response
        </label>
        <Root className="SwitchRoot" id="by-response" checked={rv[0] !== null}>
          <Thumb className="SwitchThumb" />
        </Root>
      </div>
      <div className="split-by-option">
        <label className="Label" htmlFor="by-wave" style={{ paddingRight: 15 }}>
          Split By Wave
        </label>
        <Root
          className="SwitchRoot"
          id="by-wave"
          checked={rv[1] !== null}
          disabled={rv[0] === null}
        >
          <Thumb className="SwitchThumb" />
        </Root>
      </div>
      <div className="split-by-option">
        <label
          className="Label"
          htmlFor="by-party"
          style={{ paddingRight: 15 }}
        >
          Split By Party
        </label>
        <Root
          className="SwitchRoot"
          id="by-party"
          checked={rv[2] !== null}
          disabled={rv[0] === null}
        >
          <Thumb className="SwitchThumb" />
        </Root>
      </div>
    </form>
  );
}
