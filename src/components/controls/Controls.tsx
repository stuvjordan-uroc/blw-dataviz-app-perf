import "./Controls.css";
import BackButton from "./BackButton";
import NextButton from "./NextButton";
import classNames from "classnames";
import { motion } from "motion/react";

export default function Controls() {
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
