import { fetchScenarioJson } from "../../api/scenario.js";

interface Props {
  trainerId: string;
  trainerTitle: string;
}

export function ExportJsonButton({ trainerId, trainerTitle }: Props) {
  async function handleExport() {
    const scenario = await fetchScenarioJson(trainerId);
    const blob = new Blob([JSON.stringify(scenario, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${trainerTitle || "scenario"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" className="button" onClick={() => void handleExport()}>
      Экспорт JSON
    </button>
  );
}
