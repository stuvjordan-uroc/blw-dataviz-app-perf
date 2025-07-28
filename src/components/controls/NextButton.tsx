import { CurrentPageStoreContext } from "../../Contexts";
import classNames from "classnames";
import "./Button.css";
import { use } from "react";
export default function NextButton() {
  const CurrentPageStore = use(CurrentPageStoreContext);
  return (
    <button
      type="button"
      className={classNames("button", "next", {
        available: CurrentPageStore ? CurrentPageStore.currentPage >= 1 : false,
      })}
      disabled={CurrentPageStore ? CurrentPageStore.currentPage < 1 : true}
      onClick={() => {
        CurrentPageStore?.nextPage();
      }}
    >
      Next
    </button>
  );
}
