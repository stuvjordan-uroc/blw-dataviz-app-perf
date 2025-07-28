import { createContext } from "react";

interface CurrentPageStore {
  currentPage: number,
  nextPage: () => void,
  prevPage: () => void,
}
type UserResponses = Record<string, number | null>;
interface UserResponsesStore {
  userResponses: UserResponses,
  updateUserResponse: (variableName: string, newValue: number | null) => void,
  numUserResponses: number
}


export const CurrentPageStoreContext = createContext<CurrentPageStore | null>(null)
export const UserResponsesStoreContext = createContext<UserResponsesStore | null>(null)
