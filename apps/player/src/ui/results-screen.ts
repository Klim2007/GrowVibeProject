export interface ResultsSummary {
  score: number;
  maxScore: number;
  firstAttemptPercent: number;
  passed: boolean;
}

export function renderResultsScreen(container: HTMLElement, summary: ResultsSummary): void {
  container.innerHTML = "";
  container.className = "gv-results";

  const heading = document.createElement("h2");
  heading.textContent = summary.passed ? "Тренажёр пройден" : "Тренажёр не пройден";
  heading.className = summary.passed ? "gv-results__heading gv-results__heading--pass" : "gv-results__heading gv-results__heading--fail";

  const scoreP = document.createElement("p");
  scoreP.textContent = `Баллы: ${summary.score} из ${summary.maxScore}`;

  const firstAttemptP = document.createElement("p");
  firstAttemptP.textContent = `Правильно с первой попытки: ${summary.firstAttemptPercent}%`;

  container.append(heading, scoreP, firstAttemptP);
}
