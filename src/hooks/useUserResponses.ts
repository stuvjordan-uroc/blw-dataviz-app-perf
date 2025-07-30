import { useState } from "react";
import questions from "../data/questions.json"
import * as _ from "lodash";




export function useUserResponses() {
  const selectedQuestions = _.sampleSize(questions.prompts, 3).map((q) => ({
    variableName: q.variable_name,
    questionText: q.question_text,
    shortText: q.short_text,
  }));
  const [userResponses, setUserResponses] = useState<Record<string, {
    perf: number | null;
    imp: number | null;
  }>>(
    Object.fromEntries(selectedQuestions.map((question) => ([
      question.variableName,
      {
        perf: null,
        imp: null
      }
    ])))
  )
  const numUserResponses = {
    perf: Object.values(userResponses).filter(v => !_.isNull(v.perf)).length,
    imp: Object.values(userResponses).filter(v => !_.isNull(v.imp)).length
  }
  function updateUserResponse(variableName: string, responseType: 'perf' | 'imp', newValue: number | null) {
    if (!Object.keys(userResponses).includes(variableName)) {
      throw new Error(`State userResponses has no key ${variableName}.`)
    }
    setUserResponses({
      ...userResponses,
      [variableName]: {
        ...userResponses[variableName],
        [responseType]: newValue
      }
    })
  }
  return ({
    userResponses: userResponses,
    updateUserResponse: updateUserResponse,
    numUserResponses: numUserResponses
  })
}