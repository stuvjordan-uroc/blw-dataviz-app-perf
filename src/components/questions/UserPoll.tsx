import {
  CurrentPageStoreContext,
  UserResponsesStoreContext,
} from "../../Contexts";
import "./UserPoll.css";
import responses from "../../data/responses.json";
import questions from "../../data/questions.json";
import { use } from "react";
import { motion, AnimatePresence } from "motion/react";
import classNames from "classnames";

export default function UserPoll() {
  const UserResponsesStore = use(UserResponsesStoreContext);
  const CurrentPageStore = use(CurrentPageStoreContext);
  const selectedQuestions = questions.prompts.filter((q) =>
    Object.keys(UserResponsesStore.userResponses).includes(q.variable_name)
  );
  const handleRadioChange = (event: React.FormEvent<HTMLFieldSetElement>) => {
    const targetElement = event.target as HTMLInputElement;
    if (UserResponsesStore?.numUserResponses === 2) {
      UserResponsesStore?.updateUserResponse(
        targetElement.name,
        parseInt(targetElement.id, 10)
      );
      CurrentPageStore?.nextPage();
    } else {
      UserResponsesStore?.updateUserResponse(
        targetElement.name,
        parseInt(targetElement.id, 10)
      );
    }
  };
  const responsesToShow = Object.fromEntries(
    selectedQuestions.map((question) => [
      question.variable_name,
      CurrentPageStore?.currentPage === 0
        ? responses
        : responses.filter(
            (r, ridx) =>
              ridx === UserResponsesStore?.userResponses[question.variable_name]
          ),
    ])
  );
  return (
    <div
      className={classNames("user-poll", {
        aside: CurrentPageStore?.currentPage > 0,
      })}
    >
      {selectedQuestions.map((question) => (
        <motion.div
          animate={{
            backgroundColor:
              CurrentPageStore?.currentPage === 0
                ? "var(--blw-gray100)"
                : "var(--blw-gray400)",
          }}
          transition={{ duration: 1 }}
          className="poll-item"
          key={question.variable_name}
        >
          <AnimatePresence>
            {CurrentPageStore?.currentPage === 0 ? (
              <motion.p>{question.question_text}</motion.p>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {question.short_text}
              </motion.p>
            )}
          </AnimatePresence>
          <fieldset onChange={handleRadioChange}>
            <AnimatePresence>
              {responsesToShow[question.variable_name].map((response, ridx) => (
                <motion.label
                  key={response.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                >
                  <input
                    type="radio"
                    name={question.variable_name}
                    id={ridx.toString()}
                  />
                  {CurrentPageStore?.currentPage === 0
                    ? response.full
                    : response.short}
                </motion.label>
              ))}
            </AnimatePresence>
          </fieldset>
        </motion.div>
      ))}
    </div>
  );
}
