import "./App.css";
import * as _ from "lodash";
import { useCurrentPage } from "./hooks/useCurrentPage";
import { useUserResponses } from "./hooks/useUserResponses";
import { CurrentPageStoreContext, UserResponsesStoreContext } from "./Contexts";
import Header from "./components/Header";
import Controls from "./components/controls/Controls";
import QuestionPrefix from "./components/questions/QuestionPrefix";
import UserPoll from "./components/questions/UserPoll";
import { motion } from "motion/react";

function App() {
  //set up the currentPage and userResponses states
  const currentPageStore = useCurrentPage();
  const userResponsesStore = useUserResponses();
  //next step: set up the main app flex column

  return (
    <CurrentPageStoreContext value={currentPageStore}>
      <UserResponsesStoreContext value={userResponsesStore}>
        <div className="app">
          <Header />
          <QuestionPrefix />
          <UserPoll />
          {currentPageStore.currentPage > 0 && (
            <motion.div
              initial={{ flex: "0 0 auto", opacity: 0 }}
              animate={{ flex: "1 0 auto", opacity: 1 }}
              style={{
                overflow: "auto",
                maxHeight: "50vh",
                marginTop: "0.5rem",
                borderRadius: "1rem",
                padding: "0.5rem",
                backgroundColor: "var(--blw-gray100)",
              }}
            >
              <p>
                How well do Americans think the United States is performing _as
                a democracy_? This isn't a straightforward question to answer,
                because democracy is a multi-faceted concept, and people have
                different ideas about which aspects of politics and government
                count as "democratic". So, to measure Americans' assessments of
                U.S. democracy, Bright Line Watch has developed a list of 31
                democratic principles designed to encompass the broadest
                possible conception of democracy. On the previous screen, you
                gave _your_ assessment of U.S. performance on three of those 31
                principles.
              </p>
              <p>
                Starting in 2017, Bright Line Watch began asking large samples
                of Americans to share their assessments of the U.S. on each of
                the 31 principles. In this app, you'll explore the results,
                based on over 55,000 survey responses.{" "}
              </p>
            </motion.div>
          )}
          <Controls />
        </div>
      </UserResponsesStoreContext>
    </CurrentPageStoreContext>
  );
}

export default App;
