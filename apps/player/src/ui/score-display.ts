export interface ScoreDisplay {
  el: HTMLElement;
  update(score: number): void;
}

export function createScoreDisplay(): ScoreDisplay {
  const el = document.createElement("div");
  el.className = "gv-score";

  return {
    el,
    update(score) {
      el.textContent = `Баллы: ${score}`;
    },
  };
}
