import { loadScenario, ProgressTracker, resolveAssetUrl, ScreenRenderer, validateHotspot } from "player-core";
import type { Scenario } from "scenario-schema";
import { createNarrationRegion } from "./a11y/instructions.js";
import { renderLoginScreen } from "./auth/login-screen.js";
import { renderTrainerPicker } from "./auth/trainer-picker.js";
import { createScormFacade } from "./scorm/scorm-facade.js";
import { createAttemptCounter } from "./ui/attempt-counter.js";
import { createHintBanner } from "./ui/hint-banner.js";
import { createProgressBar } from "./ui/progress-bar.js";
import { createScoreDisplay } from "./ui/score-display.js";
import { renderResultsScreen } from "./ui/results-screen.js";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const appEl = document.getElementById("app");
if (!appEl) throw new Error("#app root element not found");

function computeMaxScore(scenario: Scenario): number {
  return scenario.screens.reduce(
    (sum, screen) => sum + screen.hotspots.reduce((s, h) => s + h.on_success.score, 0),
    0,
  );
}

async function startPlayer(scenarioUrl: string): Promise<void> {
  appEl!.innerHTML = "";
  const playerEl = document.createElement("div");
  playerEl.className = "gv-player";

  const progressBar = createProgressBar();
  const narration = createNarrationRegion();
  const screenContainer = document.createElement("div");
  screenContainer.className = "gv-player__screen";
  const hintBanner = createHintBanner();
  const statusRow = document.createElement("div");
  statusRow.className = "gv-status-row";
  const attemptCounter = createAttemptCounter();
  const scoreDisplay = createScoreDisplay();
  statusRow.append(attemptCounter.el, scoreDisplay.el);

  playerEl.append(progressBar.el, narration.el, screenContainer, hintBanner.el, statusRow);
  appEl!.appendChild(playerEl);

  try {
    const scenario = await loadScenario(scenarioUrl);
    const screensById = new Map(scenario.screens.map((screen) => [screen.screen_id, screen]));
    const screenOrder = scenario.screens.map((s) => s.screen_id);
    const maxScore = computeMaxScore(scenario);

    const scormFacade = createScormFacade(scenario.trainer_id);
    scormFacade.initialize();

    const resumeState = scormFacade.getResumeState();
    const startScreenId = resumeState && screensById.has(resumeState.screenId) ? resumeState.screenId : screenOrder[0];

    const tracker = new ProgressTracker(startScreenId, resumeState ?? undefined);
    const firstAttemptResult = new Map<string, boolean>();

    const renderer = new ScreenRenderer(screenContainer, {
      onHotspotClick: (hotspotId) => handleAttempt(hotspotId),
      onHotspotInputSubmit: (hotspotId, value) => handleAttempt(hotspotId, value),
    });

    function renderCurrentScreen() {
      const screenId = tracker.getState().currentScreenId;
      const screen = screensById.get(screenId);
      if (!screen) return;

      hintBanner.clear();
      narration.set(screen.narration ?? "");
      progressBar.update(screenOrder.indexOf(screenId), screenOrder.length);
      scoreDisplay.update(tracker.getState().score);
      attemptCounter.update(0);
      renderer.render(screen, resolveAssetUrl(scenarioUrl, screen.image));

      scormFacade.recordProgress(screenId, tracker.getState().score, tracker.getState().attempts);
      scormFacade.commit();
    }

    function handleAttempt(hotspotId: string, value?: string) {
      const screenId = tracker.getState().currentScreenId;
      const screen = screensById.get(screenId);
      const hotspot = screen?.hotspots.find((h) => h.hotspot_id === hotspotId);
      if (!hotspot) return;

      const result = validateHotspot(hotspot, value);
      const wasFirstAttempt = tracker.getAttemptCount(hotspotId) === 0;
      tracker.recordAttempt(hotspotId, result.success, hotspot.on_success.score);
      if (wasFirstAttempt) {
        firstAttemptResult.set(hotspotId, result.success);
      }

      scormFacade.recordInteraction({
        id: hotspotId,
        type: hotspot.type === "input" ? "fill-in" : "choice",
        studentResponse: value ?? "click",
        result: result.success ? "correct" : "wrong",
      });

      if (result.success) {
        hintBanner.clear();
        scoreDisplay.update(tracker.getState().score);
        const nextScreenId = hotspot.on_success.next_screen;
        if (nextScreenId) {
          tracker.goToScreen(nextScreenId);
          renderCurrentScreen();
        } else {
          finish();
        }
      } else {
        hintBanner.show(result.hint ?? "");
        attemptCounter.update(tracker.getAttemptCount(hotspotId));
      }
    }

    function finish() {
      renderer.destroy();
      const state = tracker.getState();
      const percent = maxScore > 0 ? Math.round((state.score / maxScore) * 100) : 0;
      const passed = percent >= scenario.passing_score;

      const correctFirstTry = [...firstAttemptResult.values()].filter(Boolean).length;
      const firstAttemptPercent =
        firstAttemptResult.size > 0 ? Math.round((correctFirstTry / firstAttemptResult.size) * 100) : 0;

      tracker.complete(passed);
      scormFacade.recordScore(state.score, maxScore);
      scormFacade.recordLessonStatus(passed ? "passed" : "failed");
      scormFacade.commit();
      scormFacade.terminate();

      progressBar.update(screenOrder.length - 1, screenOrder.length);
      narration.set("");
      hintBanner.clear();
      statusRow.remove();
      renderResultsScreen(screenContainer, { score: state.score, maxScore, firstAttemptPercent, passed });
    }

    renderCurrentScreen();
  } catch (err) {
    playerEl.textContent = `Ошибка загрузки сценария: ${err instanceof Error ? err.message : String(err)}`;
    console.error(err);
  }
}

async function hasLocalScenario(): Promise<boolean> {
  try {
    const res = await fetch(new URL("scenario.json", window.location.href).toString());
    if (!res.ok) return false;
    // Vite's dev server serves index.html as an SPA fallback for any
    // unmatched path with a 200 status, so `res.ok` alone isn't enough —
    // a real scenario.json is served with a JSON content type.
    const contentType = res.headers.get("content-type") ?? "";
    return contentType.includes("json");
  } catch {
    return false;
  }
}

async function boot(): Promise<void> {
  // Exported SCORM packages ship with a scenario.json next to index.html —
  // in that deployment the LMS already handles authentication, so the
  // player boots straight into the trainer. Without one (e.g. this dev
  // server used as a standalone testing environment), show a login gate
  // and a trainer picker backed by the live API instead.
  if (await hasLocalScenario()) {
    await startPlayer(new URL("scenario.json", window.location.href).toString());
    return;
  }

  renderLoginScreen(appEl!, {
    onSuccess: () => {
      void renderTrainerPicker(appEl!, {
        apiBase: API_BASE,
        onSelect: (trainerId) => {
          void startPlayer(`${API_BASE}/api/trainers/${trainerId}/scenario.json`);
        },
      });
    },
  });
}

void boot();
