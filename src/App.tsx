import "./App.css";
import * as _ from "lodash";
import { useCurrentPage } from "./hooks/useCurrentPage";
import { useUserResponses } from "./hooks/useUserResponses";
import { CurrentPageStoreContext, UserResponsesStoreContext } from "./Contexts";
import Header from "./components/Header";
import Controls from "./components/controls/Controls";
import UserPoll from "./components/questions/UserPoll";
import IntroParagraph from "./components/IntroParagraph";
import VizGuidance from "./components/viz/VizGuidance";
import VizTabs from "./components/viz/VizTabs";

function App() {
  //set up the currentPage and userResponses states
  const currentPageStore = useCurrentPage();
  const userResponsesStore = useUserResponses();
  return (
    <CurrentPageStoreContext value={currentPageStore}>
      <UserResponsesStoreContext value={userResponsesStore}>
        <div className="app">
          <Header />
          <UserPoll question="imp" />
          <UserPoll question="perf" />
          {currentPageStore.currentPage === 1 && <IntroParagraph />}
          {currentPageStore.currentPage >= 2 && <VizGuidance />}
          {currentPageStore.currentPage >= 2 && <VizTabs />}
          {userResponsesStore.numUserResponses.perf >= 3 &&
            userResponsesStore.numUserResponses.imp >= 3 && <Controls />}
        </div>
      </UserResponsesStoreContext>
    </CurrentPageStoreContext>
  );
}

export default App;
