export type LessonStatus = "passed" | "failed" | "completed" | "incomplete";

export interface InteractionRecord {
  id: string;
  type: "choice" | "fill-in";
  studentResponse: string;
  result: "correct" | "wrong";
}

export interface ResumeState {
  screenId: string;
  score: number;
  attempts: Record<string, number>;
}

export interface ScormFacade {
  readonly mode: "scorm" | "standalone";
  initialize(): void;
  getResumeState(): ResumeState | null;
  recordScore(raw: number, max: number): void;
  recordLessonStatus(status: LessonStatus): void;
  recordInteraction(interaction: InteractionRecord): void;
  recordProgress(screenId: string, score: number, attempts: Record<string, number>): void;
  commit(): void;
  terminate(): void;
}
