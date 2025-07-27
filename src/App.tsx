import "./App.css";
import * as _ from "lodash";
import * as questions from "./data/questions.json";
import { useCurrentPage } from "./hooks/useCurrentPage";
import { useUserResponses } from "./hooks/useUserResponses";
import {
  CurrentPageStoreContext,
  UserResponsesStoreContext,
  SelectedQuestionsContext,
} from "./Contexts";

function App() {
  //get the question prefix and select the questions
  const prefix = questions.prefix;
  const selectedQuestions = _.sampleSize(questions.prompts, 3).map((q) => ({
    variableName: q.variable_name,
    questionText: q.question_text,
    shortText: q.short_text,
  }));
  //set up the currentPage and userResponses states
  const currentPageStore = useCurrentPage();
  const userResponsesStore = useUserResponses(selectedQuestions);
  //next step: set up the main app flex column

  return (
    <CurrentPageStoreContext value={currentPageStore}>
      <UserResponsesStoreContext value={userResponsesStore}>
        <SelectedQuestionsContext
          value={selectedQuestions}
        ></SelectedQuestionsContext>
      </UserResponsesStoreContext>
    </CurrentPageStoreContext>
  );
}

export default App;
