import { CurrentPageStoreContext } from "../../Contexts";
import classNames from "classnames";
import "./Button.css";
import { use } from "react";
export default function BackButton() {
  const CurrentPageStore = use(CurrentPageStoreContext);
  return (
    <button
      type="button"
      className={classNames("button", "back", {
        available: CurrentPageStore.currentPage >= 2,
      })}
      onClick={() => {
        CurrentPageStore.prevPage();
      }}
      disabled={CurrentPageStore.currentPage <= 1}
    >
      Back
    </button>
  );
}
