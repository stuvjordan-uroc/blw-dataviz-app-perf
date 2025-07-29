import "./Question.css";
import { CurrentPageStoreContext } from "../../Contexts";
import { use } from "react";
import questions from "../../data/questions.json";
import { ChevronRightIcon } from "@radix-ui/react-icons";

export default function Question({
  question,
  isOpen,
  toggleOpen,
}: {
  question: "perf" | "imp";
  isOpen: boolean;
  toggleOpen: () => void;
}) {
  const CurrentPageStore = use(CurrentPageStoreContext);
  return (
    <div className="question-header" onClick={toggleOpen}>
      <h3>
        {question === "perf"
          ? questions.prefix_performance
          : questions.prefix_importance}
      </h3>
      <ChevronRightIcon
        style={{
          flex: "0 0 auto",
          transform: `rotate(${isOpen ? "90deg" : "0deg"})`,
        }}
      />
    </div>
  );
}
