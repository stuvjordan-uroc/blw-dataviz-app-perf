import "./UserPoll.css";
import {
  CurrentPageStoreContext,
  UserResponsesStoreContext,
} from "../../Contexts";
import questions from "../../data/questions.json";
import { use, useState, useEffect } from "react";
import Question from "./Question";
import ResponseFieldSet from "./ResponseFieldSet";
import classNames from "classnames";
import { motion } from "motion/react";

export default function UserPoll({ question }: { question: "imp" | "perf" }) {
  const UserResponsesStore = use(UserResponsesStoreContext);
  const CurrentPageStore = use(CurrentPageStoreContext);
  const [isOpen, setIsOpen] = useState(true);
  function toggleOpen() {
    if (CurrentPageStore.currentPage >= 1) {
      setIsOpen((prevOpen) => !prevOpen);
    }
  }
  useEffect(() => {
    if (CurrentPageStore.currentPage > 0) {
      setIsOpen(false);
    }
  }, [CurrentPageStore.currentPage]);

  const selectedPrompts = questions.prompts.filter((q) =>
    Object.keys(UserResponsesStore.userResponses).includes(q.variable_name)
  );

  return (
    <motion.div
      layout
      animate={{
        flex: isOpen ? "1 1 auto" : "0 0 auto",
        height: isOpen ? "auto" : "4rem",
        visibility: "visible",
      }}
      className={classNames("poll-display", { open: isOpen })}
    >
      <Question question={question} isOpen={isOpen} toggleOpen={toggleOpen} />
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="user-poll"
        >
          {selectedPrompts.map((prompt) => (
            <div
              className="poll-item"
              key={`${question}_${prompt.variable_name}`}
            >
              <p>{prompt.question_text}</p>
              <ResponseFieldSet prompt={prompt} question={question} />
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
