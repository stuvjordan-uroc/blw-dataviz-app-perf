import segmentPoints from "../functions-and-types/set-point-coordinates/segment-points.ts";

import { test, describe, expect } from '@jest/globals'

const topLeftX = 0
const topLeftY = 0
const width = 100
const height = 100
const numPoints = 100
const pointRadius = 1
const points = segmentPoints(topLeftX, topLeftY, width, height, numPoints, pointRadius)
const leftMostX = points.reduce((acc, curr) => curr.x < acc.x ? curr : acc, points[0]).x
const rightMostCx = points.reduce((acc, curr) => curr.cx > acc.cx ? curr : acc, points[0]).cx
const topMostY = points.reduce((acc, curr) => curr.y < acc.y ? curr : acc, points[0]).y
const bottomMostCy = points.reduce((acc, curr) => curr.cy > acc.cy ? curr : acc, points[0]).cy

describe('Array of points returned by segmentPoints...', () => {
  test('has the right number of elements', () => {
    expect(points.length).toBe(numPoints)
  })
  test('has left-most point edge inside the left segment boundary', () => {
    expect(leftMostX).toBeGreaterThanOrEqual(topLeftX)
  })
  test('has right-most point edge inside the right segment boundary', () => {
    expect(rightMostCx + pointRadius).toBeLessThanOrEqual(topLeftX + width)
  })
  test('has top-most point edge inside the top segment boundary', () => {
    expect(topMostY).toBeGreaterThanOrEqual(topLeftY)
  })
  test('has bottom-most point edge inside the bottom segment boundary', () => {
    expect(bottomMostCy - pointRadius).toBeLessThanOrEqual(topLeftY + height)
  })
})