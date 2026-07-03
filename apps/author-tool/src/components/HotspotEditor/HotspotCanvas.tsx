import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { assetUrl } from "../../api/client.js";
import type { ScreenDto } from "../../api/types.js";
import { clampRectToUnitSquare, pixelToRelative, type Rect } from "../../lib/geometry.js";
import { useEditorStore } from "../../store/editor-store.js";
import { useTrainerStore } from "../../store/trainer-store.js";

interface Props {
  screen: ScreenDto;
}

const MIN_SIZE = 0.01;

export function HotspotCanvas({ screen }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draft, setDraft] = useState<Rect | null>(null);
  const [movingRect, setMovingRect] = useState<Rect | null>(null);
  const drawStart = useRef<{ point: Rect; grabDx: number; grabDy: number; hotspotId?: string } | null>(null);

  const drawType = useEditorStore((s) => s.drawType);
  const selectedHotspotId = useEditorStore((s) => s.selectedHotspotId);
  const selectHotspot = useEditorStore((s) => s.selectHotspot);
  const addHotspot = useTrainerStore((s) => s.addHotspot);
  const updateHotspot = useTrainerStore((s) => s.updateHotspot);

  function toRelative(e: ReactPointerEvent) {
    const rect = svgRef.current!.getBoundingClientRect();
    return pixelToRelative({ x: e.clientX, y: e.clientY }, rect);
  }

  function handleSvgPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    if (!drawType || e.target !== svgRef.current) return;
    const point = toRelative(e);
    drawStart.current = { point: { x: point.x, y: point.y, width: 0, height: 0 }, grabDx: 0, grabDy: 0 };
    setDraft({ x: point.x, y: point.y, width: 0, height: 0 });
    svgRef.current?.setPointerCapture(e.pointerId);
  }

  function handleRectPointerDown(e: ReactPointerEvent<SVGRectElement>, hotspot: ScreenDto["hotspots"][number]) {
    e.stopPropagation();
    selectHotspot(hotspot.id);
    if (drawType) return;
    const point = toRelative(e);
    drawStart.current = {
      point: { ...hotspot.region },
      grabDx: point.x - hotspot.region.x,
      grabDy: point.y - hotspot.region.y,
      hotspotId: hotspot.id,
    };
    setMovingRect(hotspot.region);
    svgRef.current?.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    if (!drawStart.current) return;
    const point = toRelative(e);

    if (drawStart.current.hotspotId) {
      const { point: origin, grabDx, grabDy } = drawStart.current;
      setMovingRect(
        clampRectToUnitSquare({ x: point.x - grabDx, y: point.y - grabDy, width: origin.width, height: origin.height }),
      );
      return;
    }

    const origin = drawStart.current.point;
    setDraft({
      x: Math.min(origin.x, point.x),
      y: Math.min(origin.y, point.y),
      width: Math.abs(point.x - origin.x),
      height: Math.abs(point.y - origin.y),
    });
  }

  async function handlePointerUp() {
    const start = drawStart.current;
    drawStart.current = null;

    if (start?.hotspotId) {
      const rect = movingRect;
      setMovingRect(null);
      if (rect) await updateHotspot(start.hotspotId, { region: rect });
      return;
    }

    const region = draft;
    setDraft(null);
    if (!region || region.width < MIN_SIZE || region.height < MIN_SIZE || !drawType) return;

    if (drawType === "click") {
      await addHotspot(screen.id, {
        type: "click",
        region,
        onSuccess: { nextScreenId: null, score: 10 },
        onError: { hint: "", retry: true },
      });
    } else {
      await addHotspot(screen.id, {
        type: "input",
        region,
        expectedValue: { match: "nonEmpty" },
        onSuccess: { nextScreenId: null, score: 10 },
        onError: { hint: "", retry: true },
      });
    }
  }

  return (
    <div className="hotspot-canvas">
      <img src={assetUrl(screen.imageUrl)} alt="" className="hotspot-canvas__image" draggable={false} />
      <svg
        ref={svgRef}
        className={`hotspot-canvas__overlay${drawType ? " hotspot-canvas__overlay--drawing" : ""}`}
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        onPointerDown={handleSvgPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {screen.hotspots.map((hotspot) => {
          const isMoving = drawStart.current?.hotspotId === hotspot.id && movingRect;
          const displayRegion = isMoving ? movingRect : hotspot.region;
          return (
            <rect
              key={hotspot.id}
              x={displayRegion.x}
              y={displayRegion.y}
              width={displayRegion.width}
              height={displayRegion.height}
              className={
                hotspot.id === selectedHotspotId
                  ? "hotspot-canvas__rect hotspot-canvas__rect--selected"
                  : "hotspot-canvas__rect"
              }
              vectorEffect="non-scaling-stroke"
              onPointerDown={(e) => handleRectPointerDown(e, hotspot)}
            />
          );
        })}
        {draft && (
          <rect
            x={draft.x}
            y={draft.y}
            width={draft.width}
            height={draft.height}
            className="hotspot-canvas__draft"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  );
}
