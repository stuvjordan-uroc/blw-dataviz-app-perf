import responses from "../../data/responses.json";
import * as _ from "lodash";
import { UserResponsesStoreContext } from "../../Contexts";
import React, { use } from "react";
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
  const UserResponseStore = use(UserResponsesStoreContext) as {
    userResponses: Record<
      string,
      {
        perf: number | null;
        imp: number | null;
      }
    >;
    updateUserResponse: (
      variableName: string,
      responseType: "perf" | "imp",
      newValue: number | null
    ) => void;
    numUserResponses: {
      perf: number;
      imp: number;
    };
  };
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
              defaultChecked={
                !_.isNull(
                  UserResponseStore.userResponses[prompt.variable_name][
                    question
                  ]
                ) &&
                UserResponseStore.userResponses[prompt.variable_name][
                  question
                ] === ridx
              }
            />
            {response.full}
          </label>
        )
      )}
    </fieldset>
  );
}
