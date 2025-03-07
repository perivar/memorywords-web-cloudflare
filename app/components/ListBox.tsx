// ListBox.tsx

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";
import { toMnemonic } from "~/utils/mnemonic";
import { ChevronsUpDown, Clipboard, Info, Trash2, X } from "lucide-react";
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
    <Collapsible className="fixed right-4 top-20 z-10 max-w-64 overflow-y-auto rounded-lg border border-border bg-background p-2 shadow-lg">
      <CollapsibleTrigger className="flex h-8 w-16 items-center justify-center">
        <div className="relative flex w-full items-start justify-between">
          <ChevronsUpDown className="size-6" />
          <Badge className="">{selectedWords.length}</Badge>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="max-h-[80vh] w-full overflow-y-auto p-2 md:max-h-[70vh]">
        <div className="mb-2 flex items-center justify-end">
          {selectedWords.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      selectedWords.join("\n")
                    );
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
                className="p-0.5 text-foreground/80 transition-colors hover:text-foreground"
                aria-label={t("listbox.empty_list")}>
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
        {selectedWords.length > 0 ? (
          <ul className="space-y-2">
            {selectedWords.map((word, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-5 text-sm text-foreground">
                <MnemonicVisualizer mnemonic={toMnemonic(word)} />
                <button
                  onClick={() => {
                    const newWords = selectedWords.filter(
                      (_, i) => i !== index
                    );
                    setSelectedWords(newWords);
                  }}
                  className="p-1 text-foreground/80 transition-colors hover:text-foreground"
                  aria-label={t("listbox.remove_word")}>
                  <X size={14} />
                </button>
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
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ListBox;
