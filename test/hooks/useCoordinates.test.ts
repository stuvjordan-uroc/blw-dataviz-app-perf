import { renderHook } from "@testing-library/react";
import useCoordinates from "../../src/hooks/useCoordinates";
import { vi, describe, it, expect, beforeEach } from 'vitest'

global.fetch = vi.fn()


describe("useCoordinates", () => {
  const mockFetch = vi.spyOn(globalThis, 'fetch')
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({})
    });
  });
  it("should return the correct initial values for coordinates, coordinatesAreLoading, and coordinatesDidError", async () => {
    const { result } = renderHook(() => useCoordinates("medium"))
    const [coordinates, coordinatesAreLoading, coordinatesDidError] = result.current
    expect(coordinates).toBe(null)
    expect(coordinatesAreLoading).toBe(true)
    expect(coordinatesDidError).toBe(false)
  })
})