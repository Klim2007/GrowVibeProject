import { useState } from "react";
import { EditorPage } from "./pages/EditorPage.js";
import { ProjectListPage } from "./pages/ProjectListPage.js";

export function App() {
  const [openTrainerId, setOpenTrainerId] = useState<string | null>(null);

  if (openTrainerId) {
    return <EditorPage trainerId={openTrainerId} onBack={() => setOpenTrainerId(null)} />;
  }

  return <ProjectListPage onOpen={setOpenTrainerId} />;
}
