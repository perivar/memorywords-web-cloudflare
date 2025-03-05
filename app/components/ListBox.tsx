// ListBox.tsx
import { useToast } from "@/components/ui/use-toast";
import { toMnemonic } from "~/utils/mnemonic";
import { Clipboard, Info, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { MnemonicVisualizer } from "./MnemonicVisualizer";

interface ListBoxProps {
  selectedWords: string[];
  setSelectedWords: (words: string[]) => void;
}

const ListBox: React.FC<ListBoxProps> = ({
  selectedWords,
  setSelectedWords,
}) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  return (
    <div className="fixed right-4 top-20 z-10 max-h-[70vh] w-64 max-w-[90%] overflow-y-auto rounded-lg border border-border bg-background p-4 shadow-lg md:max-w-xs">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {t("listbox.selected_words")}
        </h3>
        {selectedWords.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(selectedWords.join("\n"));
                  toast({
                    title: t("listbox.success"),
                    description: t("listbox.success_description"),
                  });
                } catch (err) {
                  console.error("Failed to copy:", err);
                  toast({
                    title: t("listbox.error"),
                    description: t("listbox.error_description"),
                    variant: "destructive",
                  });
                }
              }}
              className="p-1 text-foreground/80 transition-colors hover:text-foreground"
              aria-label={t("listbox.copy_list_to_clipboard")}>
              <Clipboard size={18} />
            </button>
            <button
              onClick={() => setSelectedWords([])}
              className="p-1 text-foreground/80 transition-colors hover:text-foreground"
              aria-label={t("listbox.empty_list")}>
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
      {selectedWords.length > 0 ? (
        <ul className="space-y-2">
          {selectedWords.map((word, index) => (
            <li key={index} className="text-sm text-foreground">
              <MnemonicVisualizer mnemonic={toMnemonic(word)} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-start gap-2">
          <Info size={18} className="mt-1 shrink-0 text-foreground/80" />
          <p className="text-sm text-foreground/80">
            {t("listbox.selected_words_description")}
          </p>
        </div>
      )}
    </div>
  );
};

export default ListBox;
