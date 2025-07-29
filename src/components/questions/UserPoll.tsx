import "./UserPoll.css";
import {
  CurrentPageStoreContext,
  UserResponsesStoreContext,
} from "../../Contexts";
import responses from "../../data/responses.json";
import questions from "../../data/questions.json";
import { use, useState } from "react";
import Question from "./Question";
import classNames from "classnames";

export default function UserPoll({ question }: { question: "imp" | "perf" }) {
  const UserResponsesStore = use(UserResponsesStoreContext);
  const CurrentPageStore = use(CurrentPageStoreContext);
  const selectedPrompts = questions.prompts.filter((q) =>
    Object.keys(UserResponsesStore.userResponses).includes(q.variable_name)
  );
  const handleRadioChange = (event: React.FormEvent<HTMLFieldSetElement>) => {
    const targetElement = event.target as HTMLInputElement;
    if (UserResponsesStore?.numUserResponses[question] === 2) {
      UserResponsesStore.updateUserResponse(
        targetElement.name,
        question,
        parseInt(targetElement.id, 10)
      );
      CurrentPageStore?.nextPage();
    } else {
      UserResponsesStore?.updateUserResponse(
        targetElement.name,
        question,
        parseInt(targetElement.id, 10)
      );
    }
  };
  const [isOpen, setIsOpen] = useState(false);
  function toggleOpen() {
    setIsOpen((isOpen) => !isOpen);
  }
  return (
    <div className={classNames("poll-display", { open: isOpen })}>
      <Question question={question} isOpen={isOpen} toggleOpen={toggleOpen} />
      {isOpen && (
        <div className="user-poll">
          {selectedPrompts.map((prompt) => (
            <div className="poll-item" key={prompt.variable_name}>
              <p>{prompt.question_text}</p>
              <fieldset onChange={handleRadioChange}>
                {responses[
                  question === "imp" ? "importance" : "performance"
                ].map((response, ridx) => (
                  <label key={response.id}>
                    <input
                      type="radio"
                      name={prompt.variable_name}
                      id={ridx.toString()}
                    />
                    {response.full}
                  </label>
                ))}
              </fieldset>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
