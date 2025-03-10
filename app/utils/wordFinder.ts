import { DigitsWords } from "./DigitsWords";

export function getDigitRegexp(singleDigit: number): string | null {
  switch (singleDigit) {
    case 0:
      // s not followed by j or kj (matches s in isolation, not part of sj or skj)
      return "s(?!j|kj)";
    case 1:
      // t or d, not followed by j
      return "[td](?!j)";
    case 2:
      // n anywhere in word
      return "n";
    case 3:
      // m anywhere in word
      return "m";
    case 4:
      // r anywhere in word
      return "r";
    case 5:
      // l anywhere in word
      return "l";
    case 6:
      // Matches sj, skj, kj, or tj combinations
      return "((s(k)?j)|(kj)|(tj))";
    case 7:
      // k or g, not followed by j
      return "[kg](?!j)";
    case 8:
      // f or v anywhere in word
      return "[fv]";
    case 9:
      // p or b anywhere in word
      return "[pb]";
    default:
      return null;
  }
}

// Cache for compiled regular expressions
const regexCache: Map<string, RegExp> = new Map();

function getRegexp(digits: number[], includeWC: boolean): RegExp {
  // Use the digits array and the includeWC flag as a unique key in the cache
  const key = digits.join(",") + `-${includeWC}`;
  if (regexCache.has(key)) {
    return regexCache.get(key)!;
  }

  // Ignored characters: vowels and other non-used characters like hjwc
  const baseIgnoredChars = "aeiouyæøåhj";
  const ignoredChars = includeWC
    ? `[${baseIgnoredChars}wc]`
    : `[${baseIgnoredChars}]`;
  const zeroOrMoreIgnoredChars = `${ignoredChars}*`;
  const oneOrMoreIgnoredChars = `${ignoredChars}+`;

  let pattern = "^("; // start regexp and define first group
  pattern += zeroOrMoreIgnoredChars; // zero or more ignored chars

  // the first digits
  let backReferenceCount = 2;
  let numPattern: string | null = null;

  for (let i = 0; i < digits.length - 1; i++) {
    if ((numPattern = getDigitRegexp(digits[i])) !== null) {
      // one or two consecutive consonants using backreference
      pattern += `(${numPattern})`;
      pattern += `\\${backReferenceCount}?`; // use backreference to group number
      backReferenceCount++;
    }

    if (i + 1 < digits.length) {
      // check if the next number is the same consonant,
      // if that is the case a ignored char is mandatory, otherwise ignored chars are optional
      if (digits[i] === digits[i + 1]) {
        pattern += oneOrMoreIgnoredChars; // one or more ignored chars
      } else {
        pattern += zeroOrMoreIgnoredChars; // zero or more ignored chars
      }
    } else {
      pattern += zeroOrMoreIgnoredChars;
    }
  }

  // the last digit
  if ((numPattern = getDigitRegexp(digits[digits.length - 1])) !== null) {
    // one or two consecutive consonants using backreference
    pattern += `(${numPattern})`;
    pattern += `\\${backReferenceCount}?`; // use backreference to group number
    pattern += zeroOrMoreIgnoredChars; // zero or more ignored chars
  }

  // end regexp and end group
  pattern += ")$";

  const regExpression = new RegExp(pattern, "i"); // i for case-insensitive
  regexCache.set(key, regExpression);

  return regExpression;
}

function getNextChunk(
  source: number[],
  startIndex: number,
  maxChunkSize: number
): number[] {
  const remainingLength = source.length - startIndex;
  const chunkSize = Math.min(maxChunkSize, remainingLength);
  return source.slice(startIndex, startIndex + chunkSize);
}

type ProgressCallback = (words: DigitsWords) => void;

function lookupWords(
  dictionary: string[],
  searchDigits: number[],
  noDigitsProcessed: { value: number },
  includeWC: boolean,
  onProgress?: ProgressCallback
): DigitsWords | null {
  const regExpression = getRegexp(searchDigits, includeWC);
  const matches: string[] = [];

  // Test each word individually like the C# version
  for (const word of dictionary) {
    if (regExpression.test(word)) {
      matches.push(word);
    }
  }

  if (matches.length > 0) {
    noDigitsProcessed.value = searchDigits.length; // store the number of digits already processed
    const word = new DigitsWords(searchDigits);
    word.wordCandidates = matches;

    if (onProgress) {
      onProgress(word);
    }

    return word;
  } else {
    // reduce the number of digits and try again
    const newLength = searchDigits.length - 1;
    if (newLength <= 0) return null;

    const reducedDigits = searchDigits.slice(0, newLength);
    return lookupWords(
      dictionary,
      reducedDigits,
      noDigitsProcessed,
      includeWC,
      onProgress
    );
  }
}

export async function FindWords(
  dictionary: string[],
  digits: number[],
  includeWC: boolean,
  onProgress?: ProgressCallback
): Promise<DigitsWords[]> {
  const maxChunkSize = 16;
  const wordList: DigitsWords[] = [];
  let digitsProcessed = 0;
  const lastProcessedCount = { value: 0 };

  while (digitsProcessed < digits.length) {
    const currentChunk = getNextChunk(digits, digitsProcessed, maxChunkSize);
    // Add small delay to allow UI updates
    await new Promise(resolve => setTimeout(resolve, 0));
    const word = lookupWords(
      dictionary,
      currentChunk,
      lastProcessedCount,
      includeWC,
      onProgress
    );

    if (lastProcessedCount.value === 0) {
      break; // No more words found
    }

    if (word) {
      wordList.push(word);
    }

    digitsProcessed += lastProcessedCount.value;
  }

  return wordList;
}
