import type { InteractionRecord, LessonStatus, ResumeState, ScormFacade } from "./types.js";

interface PersistedState {
  score: number;
  max: number;
  lessonStatus: LessonStatus;
  screenId: string | null;
  attempts: Record<string, number>;
  interactions: InteractionRecord[];
}

const EMPTY_STATE: PersistedState = {
  score: 0,
  max: 0,
  lessonStatus: "incomplete",
  screenId: null,
  attempts: {},
  interactions: [],
};

export class LocalStorageFacade implements ScormFacade {
  readonly mode = "standalone" as const;
  private readonly storageKey: string;
  private state: PersistedState;

  constructor(trainerId: string) {
    this.storageKey = `growvibe:trainer:${trainerId}:progress`;
    this.state = this.readFromStorage() ?? { ...EMPTY_STATE };
  }

  initialize(): void {}

  getResumeState(): ResumeState | null {
    if (!this.state.screenId) return null;
    return { screenId: this.state.screenId, score: this.state.score, attempts: this.state.attempts };
  }

  recordScore(raw: number, max: number): void {
    this.state.score = raw;
    this.state.max = max;
    this.persist();
  }

  recordLessonStatus(status: LessonStatus): void {
    this.state.lessonStatus = status;
    this.persist();
  }

  recordInteraction(interaction: InteractionRecord): void {
    this.state.interactions.push(interaction);
    this.persist();
  }

  recordProgress(screenId: string, score: number, attempts: Record<string, number>): void {
    this.state.screenId = screenId;
    this.state.score = score;
    this.state.attempts = attempts;
    this.persist();
  }

  commit(): void {
    this.persist();
  }

  terminate(): void {
    this.persist();
  }

  private readFromStorage(): PersistedState | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as PersistedState) : null;
    } catch {
      return null;
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch {
      // localStorage unavailable (private browsing, quota) — degrade silently,
      // in-memory state still lets the current session continue normally.
    }
  }
}
