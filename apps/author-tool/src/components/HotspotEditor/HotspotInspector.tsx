import type { ChangeEvent } from "react";
import type { ExpectedValueDto, HotspotDto, TrainerDto } from "../../api/types.js";
import { useEditorStore } from "../../store/editor-store.js";
import { useTrainerStore } from "../../store/trainer-store.js";

interface Props {
  trainer: TrainerDto;
}

function findHotspot(trainer: TrainerDto, hotspotId: string): HotspotDto | undefined {
  for (const screen of trainer.screens) {
    const hotspot = screen.hotspots.find((h) => h.id === hotspotId);
    if (hotspot) return hotspot;
  }
  return undefined;
}

export function HotspotInspector({ trainer }: Props) {
  const selectedHotspotId = useEditorStore((s) => s.selectedHotspotId);
  const selectHotspot = useEditorStore((s) => s.selectHotspot);
  const updateHotspot = useTrainerStore((s) => s.updateHotspot);
  const deleteHotspot = useTrainerStore((s) => s.deleteHotspot);

  if (!selectedHotspotId) {
    return <p className="hotspot-inspector__empty">Выберите хотспот, чтобы редактировать его свойства.</p>;
  }

  const hotspot = findHotspot(trainer, selectedHotspotId);
  if (!hotspot) return null;

  function handleMatchTypeChange(e: ChangeEvent<HTMLSelectElement>) {
    const match = e.target.value as ExpectedValueDto["match"];
    const expectedValue: ExpectedValueDto =
      match === "exact" ? { match, value: "" } : match === "regex" ? { match, pattern: "" } : { match };
    void updateHotspot(hotspot!.id, { expectedValue });
  }

  return (
    <div className="hotspot-inspector">
      <h3>{hotspot.type === "click" ? "Хотспот: клик" : "Хотспот: ввод"}</h3>

      <label className="field">
        <span>Метка (slug)</span>
        <input
          type="text"
          defaultValue={hotspot.slug ?? ""}
          onBlur={(e) => void updateHotspot(hotspot!.id, { slug: e.target.value || undefined })}
        />
      </label>

      <fieldset className="field-group">
        <legend>Область (относительные координаты 0–1)</legend>
        {(["x", "y", "width", "height"] as const).map((key) => (
          <label className="field field--inline" key={key}>
            <span>{key}</span>
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              defaultValue={hotspot.region[key]}
              onBlur={(e) =>
                void updateHotspot(hotspot!.id, { region: { ...hotspot!.region, [key]: Number(e.target.value) } })
              }
            />
          </label>
        ))}
      </fieldset>

      {hotspot.type === "input" && (
        <fieldset className="field-group">
          <legend>Правило проверки ответа</legend>
          <label className="field">
            <span>Тип</span>
            <select defaultValue={hotspot.expectedValue?.match ?? "nonEmpty"} onChange={handleMatchTypeChange}>
              <option value="exact">Точное значение</option>
              <option value="regex">Регулярное выражение</option>
              <option value="nonEmpty">Любое непустое значение</option>
            </select>
          </label>
          {hotspot.expectedValue?.match === "exact" && (
            <label className="field">
              <span>Значение</span>
              <input
                type="text"
                defaultValue={hotspot.expectedValue.value}
                onBlur={(e) => void updateHotspot(hotspot!.id, { expectedValue: { match: "exact", value: e.target.value } })}
              />
            </label>
          )}
          {hotspot.expectedValue?.match === "regex" && (
            <label className="field">
              <span>Шаблон (regex)</span>
              <input
                type="text"
                defaultValue={hotspot.expectedValue.pattern}
                onBlur={(e) =>
                  void updateHotspot(hotspot!.id, { expectedValue: { match: "regex", pattern: e.target.value } })
                }
              />
            </label>
          )}
        </fieldset>
      )}

      <fieldset className="field-group">
        <legend>При успехе</legend>
        <label className="field">
          <span>Следующий экран</span>
          <select
            defaultValue={hotspot.onSuccess.nextScreenId ?? ""}
            onChange={(e) =>
              void updateHotspot(hotspot!.id, { onSuccess: { nextScreenId: e.target.value || null } })
            }
          >
            <option value="">— конец тренажёра —</option>
            {trainer.screens
              // A hotspot can't link to the screen it's already on — that
              // creates a dead loop the learner can never progress past.
              .filter((screen) => screen.id !== hotspot!.screenId)
              .map((screen) => (
                <option key={screen.id} value={screen.id}>
                  {screen.slug ?? `Экран ${trainer.screens.indexOf(screen) + 1}`}
                </option>
              ))}
          </select>
        </label>
        <label className="field">
          <span>Баллы</span>
          <input
            type="number"
            min={0}
            defaultValue={hotspot.onSuccess.score}
            onBlur={(e) => void updateHotspot(hotspot!.id, { onSuccess: { score: Number(e.target.value) } })}
          />
        </label>
      </fieldset>

      <fieldset className="field-group">
        <legend>При ошибке</legend>
        <label className="field">
          <span>Подсказка</span>
          <input
            type="text"
            defaultValue={hotspot.onError.hint}
            onBlur={(e) => void updateHotspot(hotspot!.id, { onError: { hint: e.target.value } })}
          />
        </label>
      </fieldset>

      <button
        type="button"
        className="button button--danger"
        onClick={async () => {
          await deleteHotspot(hotspot!.id);
          selectHotspot(null);
        }}
      >
        Удалить хотспот
      </button>
    </div>
  );
}
