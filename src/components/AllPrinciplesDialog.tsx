import "./AllPrinciplesDialog.css";
import questions from "../data/questions.json";
export default function AllPrinciplesModal({
  ref,
}: {
  ref: React.RefObject<HTMLDialogElement | null>;
}) {
  return (
    <dialog className="all-principles" ref={ref}>
      <h3>BLW Democratic Principles</h3>
      <ul>
        {questions.prompts.map((prompt) => (
          <li key={prompt.variable_name}>{prompt.question_text}</li>
        ))}
      </ul>
    </dialog>
  );
}
