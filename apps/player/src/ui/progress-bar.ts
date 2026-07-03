export interface ProgressBar {
  el: HTMLElement;
  update(currentIndex: number, total: number): void;
}

export function createProgressBar(): ProgressBar {
  const el = document.createElement("div");
  el.className = "gv-progress";
  el.setAttribute("role", "progressbar");
  el.setAttribute("aria-valuemin", "0");
  el.setAttribute("aria-valuemax", "100");

  const fill = document.createElement("div");
  fill.className = "gv-progress__fill";
  el.appendChild(fill);

  return {
    el,
    update(currentIndex, total) {
      const percent = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;
      fill.style.width = `${percent}%`;
      el.setAttribute("aria-valuenow", String(percent));
      el.setAttribute("aria-label", `Экран ${currentIndex + 1} из ${total}`);
    },
  };
}
