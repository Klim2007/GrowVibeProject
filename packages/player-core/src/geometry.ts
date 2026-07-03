import type { ContainRect } from "./types.js";

/**
 * Computes the rendered rect of an image inside a container under
 * `object-fit: contain` semantics, so an overlay can be sized/positioned
 * to exactly match the visible (letterboxed) image area.
 */
export function computeContainRect(
  containerWidth: number,
  containerHeight: number,
  naturalWidth: number,
  naturalHeight: number,
): ContainRect {
  if (containerWidth <= 0 || containerHeight <= 0 || naturalWidth <= 0 || naturalHeight <= 0) {
    return { width: 0, height: 0, offsetX: 0, offsetY: 0 };
  }

  const containerRatio = containerWidth / containerHeight;
  const imageRatio = naturalWidth / naturalHeight;

  if (imageRatio > containerRatio) {
    const width = containerWidth;
    const height = containerWidth / imageRatio;
    return { width, height, offsetX: 0, offsetY: (containerHeight - height) / 2 };
  }

  const height = containerHeight;
  const width = containerHeight * imageRatio;
  return { width, height, offsetX: (containerWidth - width) / 2, offsetY: 0 };
}
