export interface NarrationRegion {
  el: HTMLElement;
  set(text: string): void;
}

export function createNarrationRegion(): NarrationRegion {
  const el = document.createElement("p");
  el.className = "gv-narration";
  el.setAttribute("aria-live", "polite");

  return {
    el,
    set(text) {
      el.textContent = text;
    },
  };
}
