import "./AllPrinciplesDialog.css";
import questions from "../data/questions.json";
export default function AllPrinciplesModal({
  ref,
}: {
  ref: React.RefObject<HTMLDialogElement | null>;
}) {
  function closeDialog() {
    if (!ref.current) {
      return;
    }
    ref.current.close();
  }
  return (
    <dialog
      className="all-principles"
      ref={ref}
      onClick={(e) => {
        if (e.currentTarget === e.target) {
          closeDialog();
        }
      }}
    >
      <h3>
        BLW Democratic Principles
        <button type="button" onClick={closeDialog}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z"
              fill="currentColor"
              // fill-rule="evenodd"
              // clip-rule="evenodd"
            ></path>
          </svg>
        </button>
      </h3>
      <ul>
        {questions.prompts.map((prompt) => (
          <li key={prompt.variable_name}>{prompt.question_text}</li>
        ))}
      </ul>
    </dialog>
  );
}
