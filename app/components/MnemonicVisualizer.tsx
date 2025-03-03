interface Part {
  type: "phoneme" | "vowel";
  value: string;
  digit?: string;
}

interface MnemonicVisualizerProps {
  mnemonic: string;
}

export function MnemonicVisualizer({ mnemonic }: MnemonicVisualizerProps) {
  const parts: Part[] = [];
  const segments = mnemonic.split(" ");

  for (const segment of segments) {
    const phonemeMatch = segment.match(/(\w+)\((\d+)\)/);
    if (phonemeMatch) {
      parts.push({
        type: "phoneme",
        value: phonemeMatch[1],
        digit: phonemeMatch[2],
      });
      continue;
    }

    const vowelMatch = segment.match(/\[([^\]]+)\]/);
    if (vowelMatch) {
      parts.push({
        type: "vowel",
        value: vowelMatch[1],
      });
    }
  }

  return (
    <div className="flex flex-wrap gap-1">
      {parts.map((part, index) => {
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
