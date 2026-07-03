export interface AttemptCounter {
  el: HTMLElement;
  update(count: number): void;
}

export function createAttemptCounter(): AttemptCounter {
  const el = document.createElement("div");
  el.className = "gv-attempt-counter";

  return {
    el,
    update(count) {
      el.textContent = count > 0 ? `Попытка: ${count}` : "";
    },
  };
}
