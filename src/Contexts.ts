import { createContext } from "react";

interface CurrentPageStore {
  currentPage: number,
  nextPage: () => void,
  prevPage: () => void,
}
interface UserResponsesStore {
  userResponses: Record<string, {
    perf: null;
    imp: null;
  }>,
  updateUserResponse: (variableName: string, responseType: 'perf' | 'imp', newValue: number | null) => void,
  numUserResponses: {
    perf: number;
    imp: number;
  }
}


export const CurrentPageStoreContext = createContext<CurrentPageStore | null>(null)
export const UserResponsesStoreContext = createContext<UserResponsesStore | null>(null)
