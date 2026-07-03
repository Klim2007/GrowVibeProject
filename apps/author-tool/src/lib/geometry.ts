export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function pixelToRelative(clientPoint: Point, containerRect: DOMRect): Point {
  return {
    x: clamp01((clientPoint.x - containerRect.left) / containerRect.width),
    y: clamp01((clientPoint.y - containerRect.top) / containerRect.height),
  };
}

export function clampRectToUnitSquare(rect: Rect): Rect {
  const x = clamp01(rect.x);
  const y = clamp01(rect.y);
  const width = Math.min(rect.width, 1 - x);
  const height = Math.min(rect.height, 1 - y);
  return { x, y, width: Math.max(0, width), height: Math.max(0, height) };
}
