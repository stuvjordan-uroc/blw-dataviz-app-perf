import { useRef } from "react";
import AllPrinciplesDialog from "./AllPrinciplesDialog";
import "./IntroParagraph.css";
export default function IntroParagraph() {
  const principlesDialogRef = useRef<HTMLDialogElement>(null);
  function togglePrinciplesDialog() {
    if (!principlesDialogRef.current) {
      return;
    }
    if (principlesDialogRef.current.hasAttribute("open")) {
      principlesDialogRef.current.close();
    } else {
      principlesDialogRef.current.showModal();
    }
  }
  return (
    <div className="intro-paragraph">
      <p>
        How well do Americans think the United States is performing{" "}
        <em>as a democracy</em>? This isn't a straightforward question to
        answer, because democracy is a multi-faceted concept, and people have
        different ideas about which aspects of politics and government count as
        "democratic".
      </p>
      <p>
        So, to measure Americans' assessments of U.S. democracy, Bright Line
        Watch has developed a list of 31 democratic principles{" "}
        <button type="button" onClick={togglePrinciplesDialog}>
          browse all 31 principles here.
        </button>{" "}
        designed to encompass the broadest possible conception of democracy. In
        response to the prompts above, you responded to three of these 31
        principles -- assessing the <em>importance for democracy</em> and the{" "}
        <em>performance of the United States</em> on each one.
      </p>
      <p>
        Starting in 2017, Bright Line Watch began asking large samples of
        Americans to share their assessments of the U.S. on each of the 31
        principles. In this app, you'll explore explore visualizations of the
        results, based on survey responses by over 50,000 Americans.{" "}
      </p>
      <AllPrinciplesDialog ref={principlesDialogRef} />
    </div>
  );
}
