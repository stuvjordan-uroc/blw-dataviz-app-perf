/* eslint-disable @typescript-eslint/no-non-null-assertion */
/*
takes...
+ pointRadius
+ circleConfig
+ targetPartyGroup

create a utf8 buffer containing contents of a valid xml document containing a valid svg
describing the appropriate circle
*/

import type { CircleConfig } from "./index.ts";
import { DOMImplementation, XMLSerializer } from "xmldom";

const SVG_NAMESPACE_URI = "http://www.w3.org/2000/svg";

export default function standaloneSVG(
  pointRadius: number,
  circleConfig: CircleConfig,
  targetPartyGroup: string[]
) {
  //get the entry in the circleConfig for the partyGroup
  const fillEntry = circleConfig.fillByPartyGroup.find(
    ([partyGroup, _fill]: [string[], string]) =>
      targetPartyGroup.every((tp) => partyGroup.includes(tp)) &&
      partyGroup.every((pg) => targetPartyGroup.includes(pg))
  );
  if (fillEntry === undefined) {
    return undefined;
  }
  //create a new svg document for the ouput svg
  const svgDoc = new DOMImplementation().createDocument(
    SVG_NAMESPACE_URI,
    "svg",
    null
  );
  //get the root element
  const svgRoot = svgDoc.documentElement;
  //set the svg attributes
  svgRoot.setAttribute(
    "width",
    (2 * pointRadius + Math.ceil(parseFloat(circleConfig.stroke))).toString()
  );
  svgRoot.setAttribute(
    "height",
    (2 * pointRadius + Math.ceil(parseFloat(circleConfig.stroke))).toString()
  );
  svgRoot.setAttribute("version", "1.1");
  svgRoot.setAttribute("xmlns", SVG_NAMESPACE_URI);
  //create the circle element
  const circle = svgDoc.createElementNS(SVG_NAMESPACE_URI, "circle");
  //set circle attributes
  //cx,cy,r
  for (const attr of ["cx", "cy", "r"]) {
    circle.setAttribute(attr, pointRadius.toString());
  }
  //stroke
  circle.setAttribute("stroke", circleConfig.stroke);
  //stroke-width, stroke-opacity, fill-opacity
  for (const attr of [
    ["strokeWidth", "stroke-width"],
    ["strokeOpacity", "stroke-opacity"],
    ["fillOpacity", "fill-opacity"],
  ]) {
    circle.setAttribute(
      attr[1]!,
      circleConfig[attr[0] as keyof CircleConfig].toString()
    );
  }
  //fill
  circle.setAttribute("fill", fillEntry[1]);
  //append an empty text node as a child of the circle to force closing tag
  circle.appendChild(svgDoc.createTextNode(""));
  //add circle as a child of the svg
  svgRoot.appendChild(circle);
  //serialize the document to a string
  const svgString = new XMLSerializer().serializeToString(svgDoc);
  //convert to buffer
  const svgBuff = Buffer.from(svgString, "utf8");
  //return
  return svgBuff;
}
