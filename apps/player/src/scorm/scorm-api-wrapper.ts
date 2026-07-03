import type { InteractionRecord, LessonStatus, ResumeState, ScormFacade } from "./types.js";

interface Scorm12Api {
  LMSInitialize(param: string): string;
  LMSFinish(param: string): string;
  LMSGetValue(name: string): string;
  LMSSetValue(name: string, value: string): string;
  LMSCommit(param: string): string;
  LMSGetLastError(): string;
}

const MAX_WINDOW_WALK = 20;

function findApiInWindowChain(win: Window): Scorm12Api | null {
  let current: Window | null = win;
  let steps = 0;
  while (current && steps < MAX_WINDOW_WALK) {
    const api = (current as unknown as { API?: Scorm12Api }).API;
    if (api) return api;
    if (current.parent && current.parent !== current) {
      current = current.parent;
    } else {
      current = null;
    }
    steps++;
  }
  return null;
}

export function locateScormApi(): Scorm12Api | null {
  if (typeof window === "undefined") return null;
  const fromSelf = findApiInWindowChain(window);
  if (fromSelf) return fromSelf;
  if (window.opener) return findApiInWindowChain(window.opener);
  return null;
}

const LESSON_STATUS_MAP: Record<LessonStatus, string> = {
  passed: "passed",
  failed: "failed",
  completed: "completed",
  incomplete: "incomplete",
};

export class Scorm12ApiWrapper implements ScormFacade {
  readonly mode = "scorm" as const;
  private interactionCount = 0;

  constructor(private readonly api: Scorm12Api) {}

  initialize(): void {
    this.api.LMSInitialize("");
  }

  getResumeState(): ResumeState | null {
    // Resuming an in-progress SCORM attempt from cmi.suspend_data is out of
    // scope for this MVP pass (see PRD §11 v1 milestone); we still record
    // suspend_data below so a future resume implementation is additive.
    return null;
  }

  recordScore(raw: number, max: number): void {
    this.api.LMSSetValue("cmi.core.score.raw", String(raw));
    this.api.LMSSetValue("cmi.core.score.min", "0");
    this.api.LMSSetValue("cmi.core.score.max", String(max));
  }

  recordLessonStatus(status: LessonStatus): void {
    this.api.LMSSetValue("cmi.core.lesson_status", LESSON_STATUS_MAP[status]);
  }

  recordInteraction(interaction: InteractionRecord): void {
    const n = this.interactionCount++;
    const prefix = `cmi.interactions.${n}`;
    this.api.LMSSetValue(`${prefix}.id`, interaction.id);
    this.api.LMSSetValue(`${prefix}.type`, interaction.type);
    this.api.LMSSetValue(`${prefix}.student_response`, interaction.studentResponse);
    this.api.LMSSetValue(`${prefix}.result`, interaction.result);
  }

  recordProgress(screenId: string, score: number, attempts: Record<string, number>): void {
    this.api.LMSSetValue("cmi.suspend_data", JSON.stringify({ screenId, score, attempts }));
  }

  commit(): void {
    this.api.LMSCommit("");
  }

  terminate(): void {
    this.api.LMSFinish("");
  }
}
