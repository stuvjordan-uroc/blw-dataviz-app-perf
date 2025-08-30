export type BreakpointKey = "small" | "medium" | "large" | "xLarge"
export interface BreakpointConfig {
  screenWidthRange: [number, number],
  vizWidth: number,
  waveHeight: number,
  pointRadius: number,
  responseGap: number,
  partyGap: number,
  labelHeight: number
}