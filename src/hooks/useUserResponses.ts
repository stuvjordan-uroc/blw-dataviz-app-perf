import { useState } from "react";

interface SelectedQuestion {
  "variableName": string,
  "questionText": string,
  "shortText": string
}
type UserResponses = Record<string, number | null>


export function useUserResponses(selectedQuestions: SelectedQuestion[]) {
  const [userResponses, setUserResponses] = useState<UserResponses>(
    Object.fromEntries(
      selectedQuestions.map(q => ([q.variableName, null]))
    )
  )
  function updateUserResponse(variableName: string, newValue: number | null) {
    if (!Object.keys(userResponses).includes(variableName)) {
      throw new Error(`State userResponses has no key ${variableName}.`)
    }
    setUserResponses({
      ...userResponses,
      variableName: newValue
    })
  }
  return ({
    userResponses: userResponses,
    updateUserResponse: updateUserResponse
  })
}