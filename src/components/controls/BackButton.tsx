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
        available: CurrentPageStore ? CurrentPageStore.currentPage >= 2 : false,
      })}
      disabled={CurrentPageStore ? CurrentPageStore.currentPage < 2 : true}
      onClick={() => {
        CurrentPageStore?.prevPage();
      }}
    >
      Back
    </button>
  );
}
