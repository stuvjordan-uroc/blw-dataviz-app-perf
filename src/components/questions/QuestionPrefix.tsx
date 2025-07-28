import "./QuestionPrefix.css";
import { CurrentPageStoreContext } from "../../Contexts";
import { use } from "react";
import questions from "../../data/questions.json";
import { motion } from "motion/react";

export default function QuestionPrefix() {
  const CurrentPageStore = use(CurrentPageStoreContext);
  return (
    <motion.h3
      layout
      animate={{
        height: CurrentPageStore?.currentPage === 0 ? "auto" : 0,
        padding: CurrentPageStore?.currentPage === 0 ? "0.25rem" : 0,
      }}
      transition={{ duration: 1 }}
      className="question-prefix"
    >
      {questions.prefix}
    </motion.h3>
  );
}
