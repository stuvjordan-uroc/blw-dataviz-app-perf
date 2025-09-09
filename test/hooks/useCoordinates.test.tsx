import UseCoordinatesWrapper from "./useCoordinatesWrapper";
import { render, waitFor } from "@testing-library/react";
import { test } from "vitest";

test("useCoordinates", async () => {
  const result = render(<UseCoordinatesWrapper />);
  result.debug();
  await waitFor(() => {
    result.debug();
  });
});
