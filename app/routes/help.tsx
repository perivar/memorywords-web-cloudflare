// app/routes/help.tsx
import { useTranslation } from "react-i18next";

export default function Help() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-center text-3xl font-bold">
          {t("help.title")}
        </h1>
        <div className="mb-8 rounded-lg p-6 shadow">
          <h2 className="mb-2 text-xl font-semibold">
            {t("help.how_it_works")}
          </h2>
          <p className="mb-4">{t("help.how_it_works_description")}</p>

          <h3 className="mb-2 text-lg font-medium">
            {t("help.norwegian_adaptation")}
          </h3>
          <p className="mb-4">{t("help.norwegian_adaptation_description")}</p>

          <h2 className="mb-2 text-xl font-semibold">{t("help.example")}</h2>
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

          <h3 className="mb-2 mt-10 text-lg font-medium">
            {t("help.norwegian_mapping_table")}
          </h3>
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border-b px-4 py-2 text-sm">
                  {t("help.digit")}
                </th>
                <th className="border-b px-4 py-2 text-sm">
                  {t("help.speach_sounds")}
                </th>
                <th className="border-b px-4 py-2 text-sm">
                  {t("help.associated_letters")}
                </th>
                <th className="border-b px-4 py-2 text-sm">
                  {t("help.notes")}
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  digit: "0",
                  sounds: "/s/, /z/",
                  letters: "S som i Sirkel, Z som i Zalo",
                  note: "0 er en Sirkel, 0 på engelsk er Zero",
                },
                {
                  digit: "1",
                  sounds: "/t/, /d/",
                  letters: "T som i Tal, D som i Dal",
                  note: "t og d har én nedstrek",
                },
                {
                  digit: "2",
                  sounds: "/n/",
                  letters: "N som i Nei",
                  note: "n har to nedstreker",
                },
                {
                  digit: "3",
                  sounds: "/m/",
                  letters: "M som i Meg",
                  note: "m har tre nedstreker",
                },
                {
                  digit: "4",
                  sounds: "/r/",
                  letters: "R som i Rein",
                  note: "tenk på fiRe, eller R som i rein, fire bein",
                },
                {
                  digit: "5",
                  sounds: "/l/",
                  letters: "L som i Liv",
                  note: "Romertallet L er 50",
                },
                {
                  digit: "6",
                  sounds: "/ʃ/, /tʃ/",
                  letters:
                    "SJ som i Sjø, SKJ som i Skje, KJ som i Kjede, TJ som i Tjue",
                  note: "J har en kurve nederst slik som 6 har",
                },
                {
                  digit: "7",
                  sounds: "/k/, /g/",
                  letters: "K som i Kul, G som i Gul",
                  note: "K inneholder to 7-tall",
                },
                {
                  digit: "8",
                  sounds: "/f/, /v/",
                  letters: "F som i Fisk, V som i Visk",
                  note: "Jeg assosierer V med en V8-motor. F lyder som V når den uttales. F ligner på 8",
                },
                {
                  digit: "9",
                  sounds: "/p/, /b/",
                  letters: "P som i Pil, B som i Bil",
                  note: "9 rotert 180 grader ser ut som b. 9 speilvendt ser ut som P. P og B lyder likt når de uttales.",
                },
              ].map((row, index) => (
                <tr key={index}>
                  <td className="border-b px-4 py-2 text-sm">{row.digit}</td>
                  <td className="border-b px-4 py-2 text-sm">{row.sounds}</td>
                  <td className="border-b px-4 py-2 text-sm">{row.letters}</td>
                  <td className="border-b px-4 py-2 text-sm">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="mb-2 mt-10 text-lg font-medium">
            {t("help.original_mapping")}
          </h3>
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border-b px-4 py-2 text-sm">
                  {t("help.digit")}
                </th>
                <th className="border-b px-4 py-2 text-sm">
                  {t("help.speach_sounds")}
                </th>
                <th className="border-b px-4 py-2 text-sm">
                  {t("help.associated_letters")}
                </th>
                <th className="border-b px-4 py-2 text-sm">
                  {t("help.notes")}
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  digit: "0",
                  sounds: "/s/, /z/",
                  letters: "S as in See, Z as in Zero",
                  note: "Zero begins with Z. Other letters sound similar when spoken.",
                },
                {
                  digit: "1",
                  sounds: "/t/, /d/, /θ/, /ð/",
                  letters:
                    "T as in Take, D as in Day, TH as in Thing, TH as in This",
                  note: "t and d each have one downstroke, and sound similar when voiced.",
                },
                {
                  digit: "2",
                  sounds: "/n/",
                  letters: "N as in Nay",
                  note: "n has two downstrokes when written.",
                },
                {
                  digit: "3",
                  sounds: "/m/",
                  letters: "M as in May",
                  note: "m has three downstrokes when written.",
                },
                {
                  digit: "4",
                  sounds: "/r/",
                  letters: "R as in Ray",
                  note: "Last letter of four.",
                },
                {
                  digit: "5",
                  sounds: "/l/",
                  letters: "L as in Lay",
                  note: "Roman numeral L = 50.",
                },
                {
                  digit: "6",
                  sounds: "/tʃ/, /dʒ/, /ʃ/, /ʒ/",
                  letters:
                    "CH as in Chip, J as in Jump, SH as in Ship, S as in vision",
                  note: "J has a curve near the bottom, like 6 does.",
                },
                {
                  digit: "7",
                  sounds: "/k/, /g/",
                  letters: "K as in Key, G as in Gee",
                  note: "K contains two 7s.",
                },
                {
                  digit: "8",
                  sounds: "/f/, /v/",
                  letters: "F as in Few, V as in View",
                  note: "I associate V with a V8 engine. F sounds like V when spoken. F looks like 8.",
                },
                {
                  digit: "9",
                  sounds: "/p/, /b/",
                  letters: "P as in Pay, B as in Bay",
                  note: "9 rotated 180 degrees looks like b. 9 flipped horizontally looks like P. P and B sound similar when spoken.",
                },
              ].map((row, index) => (
                <tr key={index}>
                  <td className="border-b px-4 py-2 text-sm">{row.digit}</td>
                  <td className="border-b px-4 py-2 text-sm">{row.sounds}</td>
                  <td className="border-b px-4 py-2 text-sm">{row.letters}</td>
                  <td className="border-b px-4 py-2 text-sm">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="mt-8 text-lg font-medium">
            {t("help.ignored_letters")}
          </h3>
          <p className="mb-4">{t("help.ignored_description")}</p>
        </div>
      </div>
    </div>
  );
}
