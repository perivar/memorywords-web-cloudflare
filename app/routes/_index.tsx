// app/routes/_index.tsx

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/react";
import i18next from "~/i18n/i18n.server";
import { DigitsWords } from "~/utils/DigitsWords";
import { parseDigits, toMnemonic } from "~/utils/mnemonic";
import { FindWords } from "~/utils/wordFinder";
import { useTranslation } from "react-i18next";

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18next.getFixedT(request);
  return json({ title: t("title"), description: t("description") });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.title },
    { name: "description", content: data?.description },
  ];
};

export default function Index() {
  const { t } = useTranslation();

  const [digits, setDigits] = useState("");
  const [words, setWords] = useState("");
  const [mnemonicResult, setMnemonicResult] = useState("");
  const [wordGroups, setWordGroups] = useState<DigitsWords[]>([]);
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const DEFAULT_DIGITS = "31415926535897932384"; // First 20 digits of π
  const DEFAULT_WORDS = "motorhotell penkjole milf byggeboomen omveier";

  // Load dictionary when component mounts
  useEffect(() => {
    const loadDictionary = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/assets/dict/nsf2023.txt");
        if (!response.ok) {
          throw new Error(
            `Failed to load dictionary (${response.status} ${response.statusText})`
          );
        }
        const text = await response.text();
        const dictArray = text.split(/\r?\n/).filter(Boolean);
        if (dictArray.length === 0) {
          throw new Error("Dictionary file is empty");
        }
        setDictionary(dictArray);
      } catch (err) {
        console.error("Dictionary loading error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dictionary"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDictionary();
  }, []);

  const handleDigitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use default digits if none are entered
    const digitsToUse = digits.trim() || DEFAULT_DIGITS;
    const digitArray = digitsToUse.split("").map(Number);

    setIsProcessing(true);
    setWordGroups([]); // Clear previous results

    try {
      await FindWords(dictionary, digitArray, foundWords => {
        setWordGroups(prev => [...prev, foundWords]);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error processing words");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Split the input into individual words and process each one
    const wordList = (words.trim() || DEFAULT_WORDS).split(/\s+/);
    const results = wordList.map(word => {
      const foundDigits = parseDigits(word);
      const mnemonic = toMnemonic(word);
      return `${word}\n${foundDigits}\n${mnemonic}`;
    });

    setMnemonicResult(results.join("\n\n"));
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg p-6 shadow">
          <h2 className="mb-2 text-xl font-semibold text-red-500">Error</h2>
          <p className="">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-center text-3xl font-bold">{t("title")}</h1>
        <div className="mb-8 rounded-lg p-6 shadow">
          <p className="mb-4">{t("description")}</p>
          <p className="mb-4">
            For example: The number {"53138552"} becomes:
            <br />
            {"LAM"} (5=L, 3=M) - {"DUM"} (1=D, 3=M) - {"FLY"} (8=F, 5=L) -{""}
            {"LYN"} (5=L, 2=N)
          </p>
          <p className="">
            See the reference table below for the complete Norwegian mapping
            system.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="size-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <span className="ml-3">Loading dictionary...</span>
          </div>
        ) : (
          <>
            {/* Words for Number Section */}
            <div className="mb-6 rounded-lg p-6 shadow">
              <h2 className="mb-2 text-xl font-semibold">Words for Number</h2>
              <p className="mb-4 text-sm">
                Enter a number to find Norwegian words that can help you
                remember it using the mapping table above. For example: {"53"}
                {""}
                can be {"LAM"} (L=5, M=3).
              </p>
              <form onSubmit={handleDigitSubmit} className="mb-6">
                <div className="mb-4">
                  <Label
                    htmlFor="digits"
                    className="mb-1 block text-sm font-medium">
                    Enter Number
                  </Label>
                  <Input
                    type="text"
                    id="digits"
                    value={digits}
                    onChange={e => setDigits(e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                    placeholder={`Enter a number (default: ${DEFAULT_DIGITS})`}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full rounded-md bg-blue-600 px-4 py-2 text-white ${
                    isProcessing
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-blue-700"
                  }`}>
                  {isProcessing ? "Processing..." : "Show Words"}
                </Button>
              </form>

              {(isProcessing || wordGroups.length > 0) && (
                <div className="mt-6 space-y-6">
                  {isProcessing && (
                    <div className="flex items-center justify-center py-4">
                      <div className="size-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                      <span className="ml-3">Finding words...</span>
                    </div>
                  )}

                  {wordGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="rounded-md p-4">
                      <h3 className="mb-3 text-lg font-medium">
                        Found digits {group.Digits.join(",")}:
                      </h3>
                      <div className="pl-4">
                        <div className="columns-3 gap-4">
                          {group.WordCandidates.map((word, wordIndex) => (
                            <div
                              key={wordIndex}
                              className="break-inside-avoid text-sm">
                              {word}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Number for Words Section */}
            <div className="rounded-lg p-6 shadow">
              <h2 className="mb-2 text-xl font-semibold">Number for Words</h2>
              <p className="mb-4 text-sm">
                Enter Norwegian words to see their digit representations using
                the mapping table above. For example: {"LAM"} becomes {"53"}
                {""}
                (L=5, M=3).
              </p>
              <form onSubmit={handleWordSubmit} className="mb-6">
                <div className="mb-4">
                  <Label
                    htmlFor="words"
                    className="mb-1 block text-sm font-medium">
                    Enter Word(s)
                  </Label>
                  <Input
                    type="text"
                    id="words"
                    value={words}
                    onChange={e => setWords(e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                    placeholder={`Enter word(s) (default: ${DEFAULT_WORDS})`}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  Convert Words to Digits
                </Button>
              </form>

              {mnemonicResult && (
                <div className="mt-6 rounded-md p-4">
                  <h3 className="mb-2 text-lg font-medium">Result</h3>
                  <pre className="whitespace-pre font-mono text-sm">
                    {mnemonicResult}
                  </pre>
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-8 rounded-lg p-6 shadow">
          <h2 className="mb-2 text-xl font-semibold">
            Norwegian Mapping Table
          </h2>
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border-b px-4 py-2 text-sm">Digit</th>
                <th className="border-b px-4 py-2 text-sm">
                  Speech Sounds (IPA)
                </th>
                <th className="border-b px-4 py-2 text-sm">
                  Associated Letters & Examples
                </th>
                <th className="border-b px-4 py-2 text-sm">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b px-4 py-2 text-sm">0</td>
                <td className="border-b px-4 py-2 text-sm">/s/, /z/</td>
                <td className="border-b px-4 py-2 text-sm">
                  S som i Sirkel, Z som i Zalo
                </td>
                <td className="border-b px-4 py-2 text-sm">
                  Sirkel eller 0 på engelsk ZERO
                </td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2 text-sm">1</td>
                <td className="border-b px-4 py-2 text-sm">/t/, /d/</td>
                <td className="border-b px-4 py-2 text-sm">
                  T som i Tal, D som i Dal
                </td>
                <td className="border-b px-4 py-2 text-sm">
                  t og d har én nedstrek
                </td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2 text-sm">2</td>
                <td className="border-b px-4 py-2 text-sm">/n/</td>
                <td className="border-b px-4 py-2 text-sm">N som i Nei</td>
                <td className="border-b px-4 py-2 text-sm">
                  n har to nedstreker
                </td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2 text-sm">3</td>
                <td className="border-b px-4 py-2 text-sm">/m/</td>
                <td className="border-b px-4 py-2 text-sm">M som i Meg</td>
                <td className="border-b px-4 py-2 text-sm">
                  m har tre nedstreker
                </td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2 text-sm">4</td>
                <td className="border-b px-4 py-2 text-sm">/r/</td>
                <td className="border-b px-4 py-2 text-sm">R som i Rein</td>
                <td className="border-b px-4 py-2 text-sm">
                  tenk på fiRe, eller R som i rein, fire bein
                </td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2 text-sm">5</td>
                <td className="border-b px-4 py-2 text-sm">/l/</td>
                <td className="border-b px-4 py-2 text-sm">L som i Liv</td>
                <td className="border-b px-4 py-2 text-sm">
                  Romertallet L er 50
                </td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2 text-sm">6</td>
                <td className="border-b px-4 py-2 text-sm">/ʃ/, /tʃ/</td>
                <td className="border-b px-4 py-2 text-sm">
                  SJ som i Sjø, SKJ som i Skje, KJ som i Kjede, TJ som i Tjue
                </td>
                <td className="border-b px-4 py-2 text-sm">
                  J har en kurve nederst slik som 6 har
                </td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2 text-sm">7</td>
                <td className="border-b px-4 py-2 text-sm">/k/, /g/</td>
                <td className="border-b px-4 py-2 text-sm">
                  K som i Kul, G som i Gul
                </td>
                <td className="border-b px-4 py-2 text-sm">
                  K inneholder to 7-tall
                </td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2 text-sm">8</td>
                <td className="border-b px-4 py-2 text-sm">/f/, /v/</td>
                <td className="border-b px-4 py-2 text-sm">
                  F som i Fisk, V som i Visk
                </td>
                <td className="border-b px-4 py-2 text-sm">
                  Jeg assosierer V med V8. F lyder som V når den uttales. F
                  ligner på 8
                </td>
              </tr>
              <tr>
                <td className="border-b px-4 py-2 text-sm">9</td>
                <td className="border-b px-4 py-2 text-sm">/p/, /b/</td>
                <td className="border-b px-4 py-2 text-sm">
                  P som i Pil, B som i Bil
                </td>
                <td className="border-b px-4 py-2 text-sm">
                  9 rotert 180 grader ser ut som b. 9 speilvendt ser ut som P. P
                  og B lyder likt når de uttales.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
