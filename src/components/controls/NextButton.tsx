import { CurrentPageStoreContext } from "../../Contexts";
import classNames from "classnames";
import "./Button.css";
import { use } from "react";
export default function NextButton() {
  const CurrentPageStore = use(CurrentPageStoreContext);
  return (
    <button
      type="button"
      className={classNames("button", "next", "available")}
      onClick={CurrentPageStore.nextPage}
    >
      Next
    </button>
  );
}
