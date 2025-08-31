import Controls from "./Controls";
import "./Imp.css";
import { useEffect, useState } from "react";
import type {
  BreakpointKey,
  BreakpointConfig,
} from "../../../config/layouts-types";
import type { VizByImpVar } from "../../../../build-data";
import type {
  PointsMapUnMapped,
  SegmentViewsUnMapped,
} from "../../../../build-data/functions-and-types/types";
import questions from "../../../data/questions.json";
import { string } from "zod";

type Coordinates = Record<
  string,
  {
    questionText: string;
    shortText: string;
    segments: SegmentViewsUnMapped;
    points: PointsMapUnMapped;
  }
>;

export default function Imp({
  layout,
}: {
  layout:
    | ({
        breakPointKey: BreakpointKey;
      } & BreakpointConfig)
    | undefined;
}) {
  //split-by controls state
  const [isSplitByWave, setIsSplitByWave] = useState(false);
  const [isSplitByParty, setIsSplitByParty] = useState(false);
  //set up the state that holds the coordinate data
  const [coordinates, setCoordinates] = useState<null | Coordinates>(null);
  //declare and effect to fetch the coordinate data.
  //coordinate data changes with the breakpoint, so make layout.breakPointKey
  //a dependency of the effect
  useEffect(() => {
    //abort controller to prevent race conditions
    //see https://maxrozen.com/race-conditions-fetching-data-react-with-useeffect#useeffect-clean-up-function-with-abortcontroller
    const abortController = new AbortController();
    //We run this effect whenever the screensize changes.
    //We don't want to display data that is mis-matched
    //to the actual screensize while we wait for the
    //data appropriate for the new screensize to load.  So set
    //the coorinates to null. This will trigger the fallback view
    //until the fetch completes.
    //also, it will insure that coordinates stays null if the fetch fails for some reason.
    setCoordinates(null);
    //data fetching function
    const fetchData = () => {
      //if the layout is undefined, do nothing, because
      //without a defined layout, we don't know which data to fetch!
      if (layout) {
        fetch("/coordinates/viz-" + layout.breakPointKey + ".json", {
          signal: abortController.signal,
        })
          .then(async (response) => {
            //set coordinates
            const newCoordinates = (await response.json()) as VizByImpVar;

            //note that we're assuming there's nothing totally weird
            //that alters the structure of the JSON that's been
            //delivered as part of the distribution!
            //Consider adding here a zod validator, which will throw
            //an error if the coordinates do not have the right structure.

            //get the questionText and shortText from the questions
            const out = (
              Object.entries(newCoordinates) as [
                string,
                { segments: SegmentViewsUnMapped; points: PointsMapUnMapped },
              ][]
            ).map(
              ([impVar, coordinates]: [
                string,
                { segments: SegmentViewsUnMapped; points: PointsMapUnMapped },
              ]) => {
                //find the matching entry in the questions object
                const matchingEntry = questions.prompts.find(
                  (p: {
                    variable_name: string;
                    question_text: string;
                    short_text: string;
                  }) => p.variable_name === impVar
                );
                return [
                  impVar,
                  {
                    ...coordinates,
                    questionText: matchingEntry
                      ? matchingEntry.question_text
                      : "",
                    shortText: matchingEntry ? matchingEntry.short_text : "",
                  },
                ];
              }
            ) as [
              string,
              {
                questionText: string;
                shortText: string;
                segments: SegmentViewsUnMapped;
                points: PointsMapUnMapped;
              },
            ][];
            setCoordinates(Object.fromEntries(out) as Coordinates);
          })
          .catch((err) => {
            if (err.name === "AbortError") {
            }
            //handle other fetch errors here.
          });
      }
    };
    fetchData();
    //cleanup code
    return () => {
      abortController.abort();
    };
  }, [layout]);
  //fallback if layout or coordinates are null
  //for instnace, coordinates will be null if/until the coordinates data sucessfully loads
  if (!layout || !coordinates) {
    return null;
  }
  //add the text of the questions to the coordinates so we can display them

  return (
    <>
      <Controls
        waveState={{ state: isSplitByWave, setter: setIsSplitByWave }}
        partyState={{ state: isSplitByParty, setter: setIsSplitByParty }}
      />
      {(
        Object.entries(coordinates) as [
          string,
          {
            questionText: string;
            shortText: string;
            segments: SegmentViewsUnMapped;
            points: PointsMapUnMapped;
          },
        ][]
      ).map(
        (
          [impVarName, impVarCoordinates]: [
            string,
            {
              questionText: string;
              shortText: string;
              segments: SegmentViewsUnMapped;
              points: PointsMapUnMapped;
            },
          ],
          _impVarIdx: number,
          _impVarEntries: [
            string,
            {
              questionText: string;
              shortText: string;
              segments: SegmentViewsUnMapped;
              points: PointsMapUnMapped;
            },
          ][]
        ) => (
          <div key={impVarName}>{impVarCoordinates.questionText}</div>
        )
      )}
    </>
  );
}
