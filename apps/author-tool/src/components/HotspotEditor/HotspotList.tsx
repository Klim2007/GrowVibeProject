import type { ScreenDto } from "../../api/types.js";
import { useEditorStore } from "../../store/editor-store.js";

interface Props {
  screen: ScreenDto;
}

export function HotspotList({ screen }: Props) {
  const selectedHotspotId = useEditorStore((s) => s.selectedHotspotId);
  const selectHotspot = useEditorStore((s) => s.selectHotspot);

  if (screen.hotspots.length === 0) {
    return <p className="hotspot-list__empty">На этом экране пока нет хотспотов.</p>;
  }

  return (
    <ul className="hotspot-list">
      {screen.hotspots.map((hotspot) => (
        <li key={hotspot.id}>
          <button
            type="button"
            className={hotspot.id === selectedHotspotId ? "hotspot-list__item hotspot-list__item--selected" : "hotspot-list__item"}
            onClick={() => selectHotspot(hotspot.id)}
          >
            {hotspot.type === "click" ? "Клик" : "Ввод"} — {hotspot.slug ?? hotspot.id.slice(0, 8)}
          </button>
        </li>
      ))}
    </ul>
  );
}
