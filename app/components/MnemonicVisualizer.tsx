export interface Part {
  type: "phoneme" | "vowel";
  value: string;
  digit?: string;
}

interface MnemonicVisualizerProps {
  mnemonic: Part[];
}

export function MnemonicVisualizer({ mnemonic }: MnemonicVisualizerProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {mnemonic.map((part, index) => {
        if (part.type === "phoneme") {
          return (
            <div key={index} className="flex flex-col items-center">
              <span className="text-sm font-medium">{part.digit}</span>
              <span className="font-medium">{part.value}</span>
            </div>
          );
        } else {
          return (
            <div key={index} className="mb-0.5 flex">
              <span className="self-end text-sm text-muted-foreground">
                {part.value}
              </span>
            </div>
          );
        }
      })}
    </div>
  );
}
