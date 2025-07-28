import { useState } from "react";
import questions from "../data/questions.json"
import * as _ from "lodash";

type UserResponses = Record<string, number | null>


export function useUserResponses() {
  const selectedQuestions = _.sampleSize(questions.prompts, 3).map((q) => ({
    variableName: q.variable_name,
    questionText: q.question_text,
    shortText: q.short_text,
  }));
  const [userResponses, setUserResponses] = useState<UserResponses>(
    Object.fromEntries(
      selectedQuestions.map(q => ([q.variableName, null]))
    )
  )
  const numUserResponses = Object.values(userResponses).filter(v => !_.isNull(v)).length
  function updateUserResponse(variableName: string, newValue: number | null) {
    if (!Object.keys(userResponses).includes(variableName)) {
      throw new Error(`State userResponses has no key ${variableName}.`)
    }
    setUserResponses({
      ...userResponses,
      [variableName]: newValue
    })
  }
  return ({
    userResponses: userResponses,
    updateUserResponse: updateUserResponse,
    numUserResponses: numUserResponses
  })
}