import { useState } from "react";
import { assetUrl } from "../../api/client.js";
import { exportTrainerToScorm } from "../../api/trainers.js";

interface Props {
  trainerId: string;
}

export function ExportScormButton({ trainerId }: Props) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  async function handleExport() {
    setExporting(true);
    setError(null);
    setWarnings([]);
    try {
      const result = await exportTrainerToScorm(trainerId);
      setWarnings(result.warnings);
      const a = document.createElement("a");
      a.href = assetUrl(result.downloadUrl);
      a.download = "scorm-package.zip";
      a.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <button type="button" className="button" onClick={() => void handleExport()} disabled={exporting}>
        {exporting ? "Экспорт..." : "Экспорт SCORM"}
      </button>
      {error && <span className="toolbar-error">{error}</span>}
      {warnings.length > 0 && <span className="toolbar-warning">{warnings.join("; ")}</span>}
    </>
  );
}
