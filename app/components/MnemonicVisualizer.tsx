export interface Part {
  type: "phoneme" | "vowel";
  value: string;
  digit?: string;
}

interface MnemonicVisualizerProps {
  mnemonic: Part[];
  onClick?: () => void;
}

export function MnemonicVisualizer({
  mnemonic,
  onClick,
}: MnemonicVisualizerProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-wrap gap-1 border-b border-transparent ${onClick ? "cursor-pointer hover:border-current" : "pointer-events-none"}`}>
      {mnemonic.map((part, index) => {
        if (part.type === "phoneme") {
          return (
            <div key={index} className="flex flex-col items-center">
              <span className="text-sm font-thin">{part.digit}</span>
              <span className="font-medium">{part.value}</span>
            </div>
          );
        } else {
          return (
            <div key={index} className="flex flex-col items-center">
              <span className="text-sm font-thin">&#8203;</span>
              <span className="text-muted-foreground">{part.value}</span>
            </div>
          );
        }
      })}
    </button>
  );
}
