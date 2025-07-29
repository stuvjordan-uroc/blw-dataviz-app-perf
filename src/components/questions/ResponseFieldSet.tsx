import responses from "../../data/responses.json";
import * as _ from "lodash";
import { UserResponsesStoreContext } from "../../Contexts";
import { use } from "react";
export default function ResponseFieldSet({
  prompt,
  question,
}: {
  prompt: {
    variable_name: string;
    question_text: string;
    short_text: string;
  };
  question: "imp" | "perf";
}) {
  const UserResponseStore = use(UserResponsesStoreContext);
  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    UserResponseStore.updateUserResponse(
      prompt.variable_name,
      question,
      parseInt(target.value, 10)
    );
  }
  return (
    <fieldset onChange={handleChange}>
      {responses[question === "imp" ? "importance" : "performance"].map(
        (response, ridx) => (
          <label key={`${question}_${prompt.variable_name}_${ridx.toString()}`}>
            <input
              type="radio"
              value={ridx.toString()}
              name={`${question}_${prompt.variable_name}`}
            />
            {response.full}
          </label>
        )
      )}
    </fieldset>
  );
}
