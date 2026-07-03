import { useRef, useState } from "react";
import { importScenarioJson } from "../../api/scenario.js";

interface Props {
  trainerId: string;
  onImported: () => void;
}

export function ImportJsonButton({ trainerId, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await importScenarioJson(trainerId, json);
      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <button type="button" className="button" onClick={() => inputRef.current?.click()}>
        Импорт JSON
      </button>
      {error && <span className="toolbar-error">{error}</span>}
    </>
  );
}
