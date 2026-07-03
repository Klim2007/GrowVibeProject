import { useEffect, useMemo, useRef, useState } from "react";
import { ScreenRenderer, validateHotspot } from "player-core";
import { parseScenario, type Scenario } from "scenario-schema";
import type { TrainerDto } from "../../api/types.js";
import { trainerToScenario } from "../../lib/to-scenario.js";

interface Props {
  trainer: TrainerDto;
  onClose: () => void;
}

function buildScenario(trainer: TrainerDto): { scenario: Scenario | null; error: string | null } {
  try {
    return { scenario: parseScenario(trainerToScenario(trainer)), error: null };
  } catch (err) {
    return { scenario: null, error: err instanceof Error ? err.message : String(err) };
  }
}

export function PreviewModal({ trainer, onClose }: Props) {
  const { scenario, error } = useMemo(() => buildScenario(trainer), [trainer]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<ScreenRenderer | null>(null);
  const [currentScreenId, setCurrentScreenId] = useState<string | null>(scenario?.screens[0]?.screen_id ?? null);
  const [hint, setHint] = useState("");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!scenario) return;
    if (!currentScreenId || !scenario.screens.some((s) => s.screen_id === currentScreenId)) {
      setCurrentScreenId(scenario.screens[0]?.screen_id ?? null);
    }
  }, [scenario, currentScreenId]);

  const handleAttemptRef = useRef<(hotspotId: string, value?: string) => void>(() => {});
  handleAttemptRef.current = (hotspotId, value) => {
    if (!scenario || !currentScreenId) return;
    const screen = scenario.screens.find((s) => s.screen_id === currentScreenId);
    const hotspot = screen?.hotspots.find((h) => h.hotspot_id === hotspotId);
    if (!hotspot) return;

    const result = validateHotspot(hotspot, value);
    if (result.success) {
      setHint("");
      const nextScreenId = hotspot.on_success.next_screen;
      if (nextScreenId) {
        setCurrentScreenId(nextScreenId);
      } else {
        setFinished(true);
      }
    } else {
      setHint(result.hint ?? "");
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const renderer = new ScreenRenderer(containerRef.current, {
      onHotspotClick: (hotspotId) => handleAttemptRef.current(hotspotId),
      onHotspotInputSubmit: (hotspotId, value) => handleAttemptRef.current(hotspotId, value),
    });
    rendererRef.current = renderer;
    return () => renderer.destroy();
  }, []);

  useEffect(() => {
    if (!scenario || !currentScreenId || !rendererRef.current || finished) return;
    const screen = scenario.screens.find((s) => s.screen_id === currentScreenId);
    if (!screen) return;
    setHint("");
    rendererRef.current.render(screen, screen.image);
  }, [scenario, currentScreenId, finished]);

  return (
    <div className="preview-modal" role="dialog" aria-label="Предпросмотр тренажёра">
      <div className="preview-modal__panel">
        <header className="preview-modal__header">
          <h2>Предпросмотр</h2>
          <button type="button" onClick={onClose}>
            Закрыть
          </button>
        </header>

        {error && <p className="preview-modal__error">Сценарий некорректен: {error}</p>}
        {!error && finished && <p className="preview-modal__finished">Тренажёр завершён.</p>}
        {!error && !finished && (
          <>
            <div ref={containerRef} className="preview-modal__screen" />
            <div className="preview-modal__hint">{hint}</div>
          </>
        )}
      </div>
    </div>
  );
}
