import type { Screen } from "scenario-schema";
import { computeContainRect } from "./geometry.js";

export interface ScreenRendererCallbacks {
  onHotspotClick: (hotspotId: string) => void;
  onHotspotInputSubmit: (hotspotId: string, value: string) => void;
}

export class ScreenRenderer {
  private readonly wrapper: HTMLDivElement;
  private readonly imgEl: HTMLImageElement;
  private readonly overlayEl: HTMLDivElement;
  private readonly resizeObserver: ResizeObserver;
  private readonly callbacks: ScreenRendererCallbacks;

  constructor(container: HTMLElement, callbacks: ScreenRendererCallbacks) {
    this.callbacks = callbacks;

    container.innerHTML = "";
    container.classList.add("gv-screen");

    this.wrapper = document.createElement("div");
    this.wrapper.className = "gv-screen__wrapper";

    this.imgEl = document.createElement("img");
    this.imgEl.className = "gv-screen__image";
    this.imgEl.alt = "";
    this.imgEl.addEventListener("load", () => this.layout());

    this.overlayEl = document.createElement("div");
    this.overlayEl.className = "gv-screen__overlay";

    this.wrapper.appendChild(this.imgEl);
    this.wrapper.appendChild(this.overlayEl);
    container.appendChild(this.wrapper);

    this.resizeObserver = new ResizeObserver(() => this.layout());
    this.resizeObserver.observe(this.wrapper);
  }

  render(screen: Screen, imageUrl: string): void {
    this.imgEl.src = imageUrl;
    this.overlayEl.replaceChildren();

    for (const hotspot of screen.hotspots) {
      const el = hotspot.type === "click" ? document.createElement("button") : document.createElement("input");
      el.style.position = "absolute";
      el.style.left = `${hotspot.region.x * 100}%`;
      el.style.top = `${hotspot.region.y * 100}%`;
      el.style.width = `${hotspot.region.width * 100}%`;
      el.style.height = `${hotspot.region.height * 100}%`;

      if (hotspot.type === "click" && el instanceof HTMLButtonElement) {
        el.type = "button";
        el.className = "gv-hotspot gv-hotspot--click";
        el.setAttribute("aria-label", screen.narration ?? "Активная зона");
        el.addEventListener("click", () => this.callbacks.onHotspotClick(hotspot.hotspot_id));
      } else if (el instanceof HTMLInputElement) {
        el.type = "text";
        el.className = "gv-hotspot gv-hotspot--input";
        el.setAttribute("aria-label", screen.narration ?? "Поле ввода");
        el.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            this.callbacks.onHotspotInputSubmit(hotspot.hotspot_id, el.value);
          }
        });
      }

      this.overlayEl.appendChild(el);
    }

    this.layout();
  }

  private layout(): void {
    const containerWidth = this.wrapper.clientWidth;
    const containerHeight = this.wrapper.clientHeight;
    const rect = computeContainRect(
      containerWidth,
      containerHeight,
      this.imgEl.naturalWidth,
      this.imgEl.naturalHeight,
    );

    this.overlayEl.style.width = `${rect.width}px`;
    this.overlayEl.style.height = `${rect.height}px`;
    this.overlayEl.style.left = `${rect.offsetX}px`;
    this.overlayEl.style.top = `${rect.offsetY}px`;
  }

  destroy(): void {
    this.resizeObserver.disconnect();
    this.wrapper.remove();
  }
}
