import { test, expect, describe } from "bun:test";

import compareSchedules from "../src/helpers/compare-schedules";

describe("compare schedules", () => {
  test("compare two simples buffers", () => {
    const buffer = Buffer.from([1, 2, 3]);
    const secondBuffer = Buffer.from([1, 2, 3]);
    expect(compareSchedules(buffer, secondBuffer)).toBe(true);
  });

  test("compare two different simples buffers", () => {
    const buffer = Buffer.from([1, 2, 3]);
    const secondBuffer = Buffer.from([4, 5, 6]);
    expect(compareSchedules(buffer, secondBuffer)).toBe(false);
  });
});
