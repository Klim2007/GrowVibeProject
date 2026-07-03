export interface HintBanner {
  el: HTMLElement;
  show(text: string): void;
  clear(): void;
}

export function createHintBanner(): HintBanner {
  const el = document.createElement("div");
  el.className = "gv-hint";
  el.setAttribute("role", "status");

  return {
    el,
    show(text) {
      el.textContent = text;
    },
    clear() {
      el.textContent = "";
    },
  };
}
