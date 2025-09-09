import useCoordinates from "../../src/hooks/useCoordinates";

export default function UseCoordinatesWrapper() {
  const coordinates = useCoordinates("/public/coordinates/viz-small.json");
  return (
    <>
      {coordinates.data ? (
        <div data-testid="coordinates-data-not-null"></div>
      ) : (
        <div data-testid="coordinates-data-null"></div>
      )}
      {coordinates.didError ? (
        <div data-testid="coordinates-error-true"></div>
      ) : (
        <div data-testid="coordinates-error-false"></div>
      )}
      {coordinates.isLoading ? (
        <div data-testid="coordinates-loading-true"></div>
      ) : (
        <div data-testid="coordinates-loading-false"></div>
      )}
    </>
  );
}
