import { CurrentPageStoreContext } from "../../Contexts";
import "./Controls.css";
import BackButton from "./BackButton";
import NextButton from "./NextButton";
import { use } from "react";
import classNames from "classnames";
import { motion } from "motion/react";

export default function Controls() {
  const CurrentPageStore = use(CurrentPageStoreContext);
  return (
    <motion.div
      initial={{ height: "0rem" }}
      animate={{ height: "3rem" }}
      className={classNames("app-controls")}
    >
      <BackButton />
      <NextButton />
    </motion.div>
  );
}
