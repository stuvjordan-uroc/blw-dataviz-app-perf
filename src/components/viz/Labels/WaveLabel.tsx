//css
import "./WaveLable.css";
//hooks
import { useLabelDimensions } from "../../../hooks/useLabelDimensions";

//This is janky hardcoding
//Clean up after we're done with the sprint
const waveToLabel = new Map<number, string>([
  [3, "October<br /> 2017"],
  [8, "March<br /> 2019"],
  [14, "February<br /> 2021"],
  [23, "December<br /> 2024"],
]);

export default function WaveLabel({
  wave,
  waveIdx,
  labelHeight,
  waveHeight,
}: {
  wave: number;
  waveIdx: number;
  labelHeight: number;
  waveHeight: number;
}) {
  const [labelDimensions, labelRef] = useLabelDimensions();
  return (
    <div
      ref={labelRef}
      //appearance is specified in WaveLabel.css under className "wave-label"
      className="wave-label"
      //positioning
      style={{
        position: "absolute",
        top:
          (
            (waveIdx + 1) * (labelHeight + waveHeight) -
            0.5 * waveHeight -
            labelDimensions.height * 0.5
          ).toString() + "px",
        left: (-labelDimensions.width * 1).toString() + "px",
      }}
      dangerouslySetInnerHTML={{
        __html: waveToLabel.get(wave) ? waveToLabel.get(wave)! : "",
      }}
    ></div>
  );
}
