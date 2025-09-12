import "./impVarCanvas.css";
export default function ImpVarCanvas({
  width,
  height,
  vizRefCallBack,
}: {
  width: number;
  height: number;
  vizRefCallBack: (node: HTMLCanvasElement) => () => void;
}) {
  return (
    <canvas
      className="impvar-canvas"
      width={width}
      height={height}
      ref={vizRefCallBack}
    ></canvas>
  );
}
