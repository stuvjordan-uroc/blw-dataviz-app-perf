import { CurrentPageStoreContext } from "../../Contexts";
import "./Controls.css";
import BackButton from "./BackButton";
import NextButton from "./NextButton";
import { use } from "react";
import classNames from "classnames";
export default function Controls() {
  const CurrentPageStore = use(CurrentPageStoreContext);
  return (
    <div className={classNames("app-controls")}>
      <BackButton />
      <NextButton />
    </div>
  );
}
