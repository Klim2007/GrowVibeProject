import { useEffect, useState } from "react";
import { HotspotCanvas } from "../components/HotspotEditor/HotspotCanvas.js";
import { HotspotInspector } from "../components/HotspotEditor/HotspotInspector.js";
import { HotspotList } from "../components/HotspotEditor/HotspotList.js";
import { PreviewModal } from "../components/Preview/PreviewModal.js";
import { ScreenList } from "../components/ScreenList/ScreenList.js";
import { ExportJsonButton } from "../components/Toolbar/ExportJsonButton.js";
import { ExportScormButton } from "../components/Toolbar/ExportScormButton.js";
import { ImportJsonButton } from "../components/Toolbar/ImportJsonButton.js";
import { useEditorStore } from "../store/editor-store.js";
import { useTrainerStore } from "../store/trainer-store.js";

interface Props {
  trainerId: string;
  onBack: () => void;
}

export function EditorPage({ trainerId, onBack }: Props) {
  const trainer = useTrainerStore((s) => s.trainer);
  const loading = useTrainerStore((s) => s.loading);
  const error = useTrainerStore((s) => s.error);
  const selectedScreenId = useTrainerStore((s) => s.selectedScreenId);
  const loadTrainer = useTrainerStore((s) => s.loadTrainer);
  const selectScreen = useTrainerStore((s) => s.selectScreen);
  const updateTrainerSettings = useTrainerStore((s) => s.updateTrainerSettings);
  const updateScreenNarration = useTrainerStore((s) => s.updateScreenNarration);

  const drawType = useEditorStore((s) => s.drawType);
  const setDrawType = useEditorStore((s) => s.setDrawType);
  const selectHotspot = useEditorStore((s) => s.selectHotspot);

  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    void loadTrainer(trainerId);
  }, [trainerId, loadTrainer]);

  if (loading || !trainer) {
    return <p className="page-status">{error ?? "Загрузка..."}</p>;
  }

  const selectedScreen = trainer.screens.find((s) => s.id === selectedScreenId) ?? null;

  return (
    <div className="editor-page">
      <header className="editor-page__toolbar">
        <button type="button" onClick={onBack}>
          ← Тренажёры
        </button>
        <input
          className="editor-page__title"
          defaultValue={trainer.title}
          onBlur={(e) => void updateTrainerSettings({ title: e.target.value })}
        />
        <label className="field field--inline">
          <span>Проходной балл, %</span>
          <input
            type="number"
            min={0}
            max={100}
            defaultValue={trainer.passingScore}
            onBlur={(e) => void updateTrainerSettings({ passingScore: Number(e.target.value) })}
          />
        </label>
        <div className="draw-type-toggle">
          <button
            type="button"
            className={drawType === "click" ? "button button--active" : "button"}
            onClick={() => setDrawType(drawType === "click" ? null : "click")}
          >
            + Клик
          </button>
          <button
            type="button"
            className={drawType === "input" ? "button button--active" : "button"}
            onClick={() => setDrawType(drawType === "input" ? null : "input")}
          >
            + Ввод
          </button>
        </div>
        <button type="button" className="button" onClick={() => setPreviewOpen(true)}>
          Предпросмотр
        </button>
        <ExportJsonButton trainerId={trainer.id} trainerTitle={trainer.title} />
        <ImportJsonButton trainerId={trainer.id} onImported={() => void loadTrainer(trainerId)} />
        <ExportScormButton trainerId={trainer.id} />
      </header>

      {previewOpen && <PreviewModal trainer={trainer} onClose={() => setPreviewOpen(false)} />}

      <div className="editor-page__body">
        <ScreenList
          trainer={trainer}
          selectedScreenId={selectedScreenId}
          onSelect={(screenId) => {
            selectScreen(screenId);
            selectHotspot(null);
          }}
        />

        <div className="editor-page__canvas-area">
          {selectedScreen ? (
            <>
              <label className="field">
                <span>Инструкция для этого экрана</span>
                <textarea
                  defaultValue={selectedScreen.narration ?? ""}
                  onBlur={(e) => void updateScreenNarration(selectedScreen.id, e.target.value)}
                />
              </label>
              <HotspotCanvas screen={selectedScreen} />
              <HotspotList screen={selectedScreen} />
            </>
          ) : (
            <p className="page-status">Загрузите первый экран, чтобы начать разметку.</p>
          )}
        </div>

        <aside className="editor-page__inspector">
          <HotspotInspector trainer={trainer} />
        </aside>
      </div>
    </div>
  );
}
