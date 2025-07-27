import { createContext } from "react";

interface CurrentPageStore {
  currentPage: number,
  nextPage: () => void,
  prevPage: () => void,
}
interface SelectedQuestion {
  variableName: string,
  questionText: string,
  shortText: string
}
type UserResponses = Record<string, number | null>;
interface UserResponsesStore {
  userResponses: UserResponses,
  updateUserResponse: (variableName: string, newValue: number | null) => void
}


export const CurrentPageStoreContext = createContext<CurrentPageStore | null>(null)
export const SelectedQuestionsContext = createContext<SelectedQuestion[] | null>(null)
export const UserResponsesStoreContext = createContext<UserResponsesStore | null>(null)
