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


export const CurrentPageStoreContext = createContext<CurrentPageStore>({
  currentPage: 0,
  nextPage: () => { console.log("this is fake") },
  prevPage: () => { console.log("this is fake") }
})
export const UserResponsesStoreContext = createContext<UserResponsesStore>({
  userResponses: {
    'notavariable': {
      perf: null,
      imp: null
    }
  },
  updateUserResponse: (variableName: string, responseType: 'perf' | 'imp', newValue: number | null) => { console.log("this is fake") },
  numUserResponses: {
    perf: 0,
    imp: 0
  }
})
