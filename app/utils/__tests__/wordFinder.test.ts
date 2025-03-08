// wordFinder.test.ts

import { getDigitRegexp } from "../wordFinder";

describe("getDigitRegexp", () => {
  const testRegex = (
    pattern: string | null,
    match: string[],
    noMatch: string[]
  ) => {
    if (pattern === null) {
      expect(pattern).toBeNull();
      return;
    }
    const regex = new RegExp(pattern); // No 'i' flag, testing lowercase only
    match.forEach(str => {
      const result = regex.test(str);
      if (!result)
        console.log(`Failed to match: ${str} with pattern ${pattern}`);
      expect(result).toBe(true);
    });
    noMatch.forEach(str => {
      const result = regex.test(str);
      if (result)
        console.log(`Unexpected match: ${str} with pattern ${pattern}`);
      expect(result).toBe(false);
    });
  };

  it("returns null for invalid digits", () => {
    expect(getDigitRegexp(-1)).toBeNull();
    expect(getDigitRegexp(10)).toBeNull();
  });

  it("handles digit 0 - s or z, not preceded by sj or skj", () => {
    const pattern = getDigitRegexp(0);
    testRegex(
      pattern,
      ["is", "også", "kyss", "glass", "snus"], // Should match (s or z within word, not preceded by sj/skj)
      ["skje", "sjø"] // Should not match (s preceded by sj or skj in context)
    );
  });

  it("handles digit 1 - t or d, not preceded by j", () => {
    const pattern = getDigitRegexp(1);
    testRegex(
      pattern,
      ["våt", "godt", "midt", "hardt", "stad"], // Should match (t or d within word, not preceded by j)
      ["tjene", "tjore"] // Should not match (t preceded by j)
    );
  });

  it("handles digit 2 - n", () => {
    const pattern = getDigitRegexp(2);
    testRegex(
      pattern,
      ["snø", "enig", "barn", "tønne", "vann"], // Should match (n within word)
      ["måke", "tå"] // Should not match (no n)
    );
  });

  it("handles digit 3 - m", () => {
    const pattern = getDigitRegexp(3);
    testRegex(
      pattern,
      ["lame", "krem", "time", "stamme", "rom"], // Should match (m within word)
      ["snø", "rå"] // Should not match (no m)
    );
  });

  it("handles digit 4 - r", () => {
    const pattern = getDigitRegexp(4);
    testRegex(
      pattern,
      ["tør", "gård", "skrå", "høre", "par"], // Should match (r within word)
      ["lå", "fin"] // Should not match (no r)
    );
  });

  it("handles digit 5 - l", () => {
    const pattern = getDigitRegexp(5);
    testRegex(
      pattern,
      ["sult", "kule", "fugl", "skål", "smil"], // Should match (l within word)
      ["tå", "snø"] // Should not match (no l)
    );
  });

  it("handles digit 6 - sj, skj, kj, or tj", () => {
    const pattern = getDigitRegexp(6);
    testRegex(
      pattern,
      ["skje", "sjø", "kjerring", "tjue", "utjevne"], // Should match (sj, skj, kj, or tj within word)
      ["skalle", "is", "kino", "tann"] // Should not match (no sj, skj, kj, or tj)
    );
  });

  it("handles digit 7 - k or g, not preceded by j", () => {
    const pattern = getDigitRegexp(7);
    testRegex(
      pattern,
      ["snakk", "blek", "tøsk", "også", "vågen"], // Should match (k or g within word, not preceded by j)
      ["kjeller", "kjerre"] // Should not match (k preceded by j)
    );
  });

  it("handles digit 8 - f or v", () => {
    const pattern = getDigitRegexp(8);
    testRegex(
      pattern,
      ["aften", "luft", "gave", "skovl", "høvl"], // Should match (f or v within word)
      ["snakk", "gå"] // Should not match (no f or v)
    );
  });

  it("handles digit 9 - p or b", () => {
    const pattern = getDigitRegexp(9);
    testRegex(
      pattern,
      ["åpen", "kopp", "støp", "dobbelt", "stab"], // Should match (p or b within word)
      ["luft", "gå"] // Should not match (no p or b)
    );
  });
});
