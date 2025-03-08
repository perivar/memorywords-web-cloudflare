// app/routes/frontpage.tsx

import { useEffect, useState } from "react";
import ClearableInput from "@/components/ClearableInput";
import ListBox from "@/components/ListBox";
import { MnemonicVisualizer, Part } from "@/components/MnemonicVisualizer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, Link } from "@remix-run/react";
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
  const [splitLength, setSplitLength] = useState("3");
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
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const handleWordClick = (word: string) => {
    setSelectedWords(prevWords => [...prevWords, word]);
  };

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

  const handleSplitDigits = () => {
    if (!digits) return; // Handle empty input

    const cleanedDigits = digits.replace(/[^0-9]/g, "");
    if (!cleanedDigits) return; // Handle no numbers

    const length = parseInt(splitLength);
    const splitResult =
      cleanedDigits.match(new RegExp(`.{1,${length}}`, "g")) || [];
    setDigits(splitResult.join(" "));
  };

  const handleDigitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use default digits if none are entered
    const digitsToUse = digits.replace(/[^\d\s]/g, "").trim() || DEFAULT_DIGITS;
    const parts = digitsToUse.split(/\s+/).filter(part => part.length > 0);

    setIsProcessing(true);
    setWordGroups([]);

    try {
      for (const part of parts) {
        const digitArray = part.split("").map(Number);
        if (digitArray.some(d => isNaN(d))) {
          throw new Error(`Invalid digit sequence: ${part}`);
        }
        await FindWords(dictionary, digitArray, foundWords => {
          setWordGroups(prev => [...prev, foundWords]);
        });
      }
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
        <div className="rounded-lg border border-border p-6 shadow-lg">
          <h2 className="mb-2 text-xl font-semibold text-red-500">Error</h2>
          <p className="">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <ListBox
        selectedWords={selectedWords}
        setSelectedWords={setSelectedWords}
      />
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-center text-3xl font-bold">{t("title")}</h1>
        <div className="mb-8 rounded-lg border border-border p-6 shadow-lg">
          <p className="mb-4">{t("description")}</p>
          <p className="mb-4">
            {t("help.example_description")}
            <br />
            <span className="font-mono">
              <span className="text-primary">LAM</span> (5=L, 3=M) -{" "}
              <span className="text-primary">DUM</span> (1=D, 3=M) -{" "}
              <span className="text-primary">FLY</span> (8=F, 5=L) -{" "}
              <span className="text-primary">LYN</span> (5=L, 2=N)
            </span>
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
            <div className="mb-6 rounded-lg border border-border p-6 shadow-lg">
              <h2 className="mb-2 text-xl font-semibold">
                {t("convert.words_for_number")}
              </h2>
              <p className="mb-4 text-sm">
                {t("convert.enter_number_description")}
              </p>
              <form onSubmit={handleDigitSubmit} className="mb-6">
                <div className="mb-4">
                  <Label className="mb-2 block text-sm font-medium">
                    {t("convert.tools")}
                  </Label>
                  <span className="text-sm">
                    {t("convert.tools_description")}
                  </span>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={() =>
                          setDigits(
                            "3.14159265358979323846264338327950288419716939937510"
                          )
                        }
                        variant="outline">
                        Π
                      </Button>
                      <Button
                        type="button"
                        onClick={() =>
                          setDigits(
                            "2.71828182845904523536028747135266249775724709369995"
                          )
                        }
                        variant="outline">
                        e
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2 pb-5">
                      <Label
                        htmlFor="splitLength"
                        className="text-sm font-medium">
                        {t("convert.split_length")}:
                      </Label>
                      <Select
                        value={splitLength}
                        onValueChange={setSplitLength}>
                        <SelectTrigger className="w-[70px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 9 }, (_, i) => i + 2).map(
                            length => (
                              <SelectItem
                                key={length}
                                value={length.toString()}>
                                {length}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSplitDigits}>
                        {t("convert.split")}
                      </Button>
                    </div>
                  </div>
                  <Label
                    htmlFor="digits"
                    className="mb-1 block text-sm font-medium">
                    {t("convert.enter_number")}
                  </Label>
                  <ClearableInput
                    type="text"
                    id="digits"
                    value={digits}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setDigits(e.target.value)
                    }
                    onClear={() => setDigits("")}
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
                              <MnemonicVisualizer
                                mnemonic={toMnemonic(word)}
                                onClick={() => handleWordClick(word)}
                              />
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
            <div className="rounded-lg border border-border p-6 shadow-lg">
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
                  <ClearableInput
                    type="text"
                    id="words"
                    value={words}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setWords(e.target.value)
                    }
                    onClear={() => setWords("")}
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
                      <MnemonicVisualizer
                        mnemonic={result.mnemonic}
                        onClick={() => handleWordClick(result.word)}
                      />
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
