// app/routes/_index.tsx

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, Link } from "@remix-run/react";
import i18next from "~/i18n/i18n.server";
import { DigitsWords } from "~/utils/DigitsWords";
import { parseDigits, toMnemonic } from "~/utils/mnemonic";
import { FindWords } from "~/utils/wordFinder";
import { useTranslation } from "react-i18next";

import { MnemonicVisualizer, Part } from "../components/MnemonicVisualizer";

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
  const [mnemonicResults, setMnemonicResults] = useState<
    Array<{
      word: string;
      digits: string;
      mnemonic: Part[];
    }>
  >([]);
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
      return { word, digits: foundDigits, mnemonic };
    });

    setMnemonicResults(results);
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
            {t("help.example_description")}
            <br />
            {"LAM"} (5=L, 3=M) - {"DUM"} (1=D, 3=M) - {"FLY"} (8=F, 5=L) -{" "}
            {"LYN"} (5=L, 2=N)
          </p>
          <p>
            {t("convert.for_more_info")}{" "}
            <Link to="/help" className="text-blue-500">
              {t("help.title")}
            </Link>
            .
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="size-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <span className="ml-3">{t("convert.loading_dictionary")}</span>
          </div>
        ) : (
          <>
            {/* Words for Number Section */}
            <div className="mb-6 rounded-lg p-6 shadow">
              <h2 className="mb-2 text-xl font-semibold">
                {t("convert.words_for_number")}
              </h2>
              <p className="mb-4 text-sm">
                {t("convert.enter_number_description")}
              </p>
              <form onSubmit={handleDigitSubmit} className="mb-6">
                <div className="mb-4">
                  <Label
                    htmlFor="digits"
                    className="mb-1 block text-sm font-medium">
                    {t("convert.enter_number")}
                  </Label>
                  <Input
                    type="text"
                    id="digits"
                    value={digits}
                    onChange={e => setDigits(e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                    placeholder={`${t("convert.default")}: ${DEFAULT_DIGITS}`}
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
                  {isProcessing
                    ? `${t("convert.processing")}`
                    : `${t("convert.show_words")}`}
                </Button>
              </form>

              {(isProcessing || wordGroups.length > 0) && (
                <div className="mt-6 space-y-6">
                  {isProcessing && (
                    <div className="flex items-center justify-center py-4">
                      <div className="size-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                      <span className="ml-3">{t("convert.finding_words")}</span>
                    </div>
                  )}

                  {wordGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="rounded-md p-4">
                      <h3 className="mb-3 text-lg font-medium">
                        {t("convert.found_digits")} : {group.Digits.join(" ")}
                      </h3>
                      <div className="pl-4">
                        <div className="columns-1 items-start gap-4 sm:columns-2 md:columns-3">
                          {group.WordCandidates.map((word, wordIndex) => (
                            // <div
                            //   key={wordIndex}
                            //   className="break-inside-avoid text-sm">
                            //   {word}
                            // </div>
                            <div
                              key={wordIndex}
                              className="break-inside-avoid pb-2">
                              <MnemonicVisualizer mnemonic={toMnemonic(word)} />
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
              <h2 className="mb-2 text-xl font-semibold">
                {t("convert.number_for_words")}
              </h2>
              <p className="mb-4 text-sm">
                {t("convert.enter_words_description")}
              </p>
              <form onSubmit={handleWordSubmit} className="mb-6">
                <div className="mb-4">
                  <Label
                    htmlFor="words"
                    className="mb-1 block text-sm font-medium">
                    {t("convert.enter_words")}
                  </Label>
                  <Input
                    type="text"
                    id="words"
                    value={words}
                    onChange={e => setWords(e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                    placeholder={`${t("convert.default")}: ${DEFAULT_WORDS}`}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  {t("convert.convert_words_to_digits")}
                </Button>
              </form>

              {mnemonicResults.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium">{t("convert.result")}</h3>
                  {mnemonicResults.map((result, index) => (
                    <div key={index} className="rounded-md border p-4">
                      <div className="mb-2 flex flex-row items-center">
                        <div className="text-muted-foreground">
                          {result.word} :
                        </div>
                        <div className="ml-2 text-sm font-medium tracking-widest">
                          {result.digits}
                        </div>
                      </div>
                      <MnemonicVisualizer mnemonic={result.mnemonic} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
