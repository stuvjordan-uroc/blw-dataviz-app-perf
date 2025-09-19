//css
import "./Segment.css";
//types
import type { RequestedView } from "../../../hooks/use-view";
import type { SegmentCoordinates } from "../../../../build-data";
import type { MouseEvent } from "react";
//components
import ResponseLabel from "./ResponseLabel";
import PercentageLabel from "./PercentageLabel";
import * as Dialog from "@radix-ui/react-dialog";
//hooks
import { useState } from "react";

function detailsText(
  segmentGroups: {
    response: string[];
    wave?: number;
    party?: string[];
  },
  proportion: number
) {
  //This is janky hardcoding
  //Clean up after we're done with the sprint
  const waveToLabel = new Map<number, string>([
    [3, "October<br /> 2017"],
    [8, "March<br /> 2019"],
    [14, "February<br /> 2021"],
    [23, "December<br /> 2024"],
  ]);
  const waveGroupText =
    segmentGroups.wave && waveToLabel.get(segmentGroups.wave)
      ? "to the " +
        waveToLabel.get(segmentGroups.wave)?.replace("<br />", "") +
        " survey "
      : "";
  const partyGroupText = segmentGroups.party
    ? segmentGroups.party.length > 1
      ? "who identify as " +
        segmentGroups.party.map((id) => id + "s").join(" or ") +
        " "
      : "who identify as " + segmentGroups.party[0] + "s "
    : "";
  const responseGroupText =
    segmentGroups.response.length > 1
      ? segmentGroups.response
          .map(
            (r) =>
              "said this characteristic is " +
              r.toLowerCase() +
              " for democratic government"
          )
          .join(" or ") + "."
      : "said this characteristic is " +
        segmentGroups.response[0].toLowerCase() +
        " for democratic government.";
  return (
    Math.round(proportion * 100).toString() +
    "% of respondents " +
    waveGroupText +
    partyGroupText +
    responseGroupText
  );
}

/*
How the details dialog works

+ When labelsAreVisible is true, a tap on either label will open the details model
+ A tap on the segment, but not the label will toggle the label


*/

export default function Segment({
  segment,
  vizRootNode,
}: {
  segment: {
    view: RequestedView;
    groups?: {
      response: string[];
      wave?: number;
      party?: string[];
    };
    coordinates: SegmentCoordinates;
    proportion: number;
  };
  vizRootNode: HTMLElement;
}) {
  const [labelsAreVisible, setLabelsAreVisible] = useState(false);
  const [detailsAreVisible, setDetailsAreVisible] = useState(false);
  const detailsVisibleText = segment.groups
    ? detailsText(segment.groups, segment.proportion)
    : "";
  return (
    <>
      <div
        //appearance is specified in the Segment.css under className "segment-rectangle"
        className="segment-rectangle"
        //positioning
        style={{
          position: "absolute",
          top: segment.coordinates.topLeftY.toString() + "px",
          left: segment.coordinates.topLeftX.toString() + "px",
          width: segment.coordinates.width.toString() + "px",
          height: segment.coordinates.height.toString() + "px",
          border:
            "1px solid " +
            (detailsAreVisible ? "var(--blw-gray100)" : "transparent"),
        }}
        onClick={(event: MouseEvent) => {
          event.preventDefault();
          //tap on the segment toggles the label
          setLabelsAreVisible((prevLabelsAreVisible) => !prevLabelsAreVisible);
        }}
      ></div>
      {labelsAreVisible && (
        <ResponseLabel
          segment={segment}
          clickHandler={(event: MouseEvent) => {
            //click on a label should should open the details modal if it is closed
            event.preventDefault();
            //setLabelsAreVisible(true);
            setDetailsAreVisible(true);
          }}
        />
      )}
      {labelsAreVisible && (
        <PercentageLabel
          segment={segment}
          clickHandler={(event: MouseEvent) => {
            //click on a label should should open the details modal if it is closed
            event.preventDefault();
            //setLabelsAreVisible(true);
            setDetailsAreVisible(true);
          }}
        />
      )}
      <Dialog.Root
        open={detailsAreVisible}
        onOpenChange={() => {
          console.log("onOpenChange handler called");
        }}
        modal={true}
      >
        <Dialog.Portal container={vizRootNode}>
          {detailsAreVisible && (
            <Dialog.Overlay
              className="segment-details-overlay"
              onClick={() => {
                setDetailsAreVisible((prevDetailsAreVisible) => {
                  if (prevDetailsAreVisible) {
                    return false;
                  }
                  return false;
                });
              }}
            />
          )}
          <Dialog.Content className="segment-details-dialog">
            {/* <Dialog.Title />  Add back in if you want this to work with screen readers */}
            {/* <Dialog.Description /> Add back in if you want this to work with screen readers */}
            <button
              className="segment-details-close-button"
              onClick={() => {
                setDetailsAreVisible((prevDetailsAreVisible) => {
                  //if details are visible, make then not visible
                  if (prevDetailsAreVisible) {
                    return false;
                  }
                  //if details are not visible, keep them that way
                  return false;
                });
              }}
            >
              <svg
                width="25"
                height="25"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.877075 7.49988C0.877075 3.84219 3.84222 0.877045 7.49991 0.877045C11.1576 0.877045 14.1227 3.84219 14.1227 7.49988C14.1227 11.1575 11.1576 14.1227 7.49991 14.1227C3.84222 14.1227 0.877075 11.1575 0.877075 7.49988ZM7.49991 1.82704C4.36689 1.82704 1.82708 4.36686 1.82708 7.49988C1.82708 10.6329 4.36689 13.1727 7.49991 13.1727C10.6329 13.1727 13.1727 10.6329 13.1727 7.49988C13.1727 4.36686 10.6329 1.82704 7.49991 1.82704ZM9.85358 5.14644C10.0488 5.3417 10.0488 5.65829 9.85358 5.85355L8.20713 7.49999L9.85358 9.14644C10.0488 9.3417 10.0488 9.65829 9.85358 9.85355C9.65832 10.0488 9.34173 10.0488 9.14647 9.85355L7.50002 8.2071L5.85358 9.85355C5.65832 10.0488 5.34173 10.0488 5.14647 9.85355C4.95121 9.65829 4.95121 9.3417 5.14647 9.14644L6.79292 7.49999L5.14647 5.85355C4.95121 5.65829 4.95121 5.3417 5.14647 5.14644C5.34173 4.95118 5.65832 4.95118 5.85358 5.14644L7.50002 6.79289L9.14647 5.14644C9.34173 4.95118 9.65832 4.95118 9.85358 5.14644Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
            <div className="segment-details-text">{detailsVisibleText}</div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
