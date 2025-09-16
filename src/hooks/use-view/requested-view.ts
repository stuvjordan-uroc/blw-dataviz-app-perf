export type RequestedView =
  | {
      response: false;
      wave: false;
      party: false;
    }
  | {
      response: true;
      wave: boolean;
      party: boolean;
    };

export function patchRequestedView(
  prevView: RequestedView,
  viewKey: "response" | "wave" | "party",
  value: boolean
): RequestedView {
  //if no change is requested, return the prevView
  if (prevView[viewKey] === value) {
    return prevView;
  }
  //if we get here, the caller is requesting a change.
  if (viewKey === "response") {
    if (!value) {
      //caller is requesting to turn response to false
      return {
        response: false,
        wave: false,
        party: false,
      };
    } else {
      //caller is requesting to turn response to true.  We assume prevView is valid.
      //thus prevView must have all properties false.  Thus the patch value has only response true.
      return {
        response: true,
        wave: false,
        party: false,
      };
    }
  }
  if (value) {
    //if we get here, the caller is requesting to turn either "wave" or "party" to true.
    //and the prevView has whichever one it is false.
    //we require that what is return is valid.  Thus:
    if (viewKey === "party") {
      return {
        response: true,
        wave: prevView.wave,
        party: true,
      };
    } else {
      return {
        response: true,
        wave: true,
        party: prevView.party,
      };
    }
  }
  //if we get here, caller is requesting to turn party to false or wave to false.
  //and preview has whichever one true.  We are assuming prevView is valid, thus
  // since it has either wave or party true, it must have response true.
  // so return the only thing that could be valid
  return {
    ...prevView,
    response: true,
    [viewKey]: false,
  };
}

export type ViewKeyString =
  | "unsplit"
  | "byResponse"
  | "byResponseAndWave"
  | "byResponseAndParty"
  | "byResponseAndWaveAndParty";

export function requestedViewToString(
  requestedView: RequestedView
): ViewKeyString {
  if (!requestedView.response) {
    return "unsplit";
  }
  return ("byResponse" +
    (requestedView.wave ? "AndWave" : "") +
    (requestedView.party ? "AndParty" : "")) as ViewKeyString;
}
