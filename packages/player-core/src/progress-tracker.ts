import type { ProgressState } from "./types.js";

export class ProgressTracker {
  private state: ProgressState;
  private readonly listeners = new Set<(state: ProgressState) => void>();

  constructor(initialScreenId: string, initial?: Partial<ProgressState>) {
    this.state = {
      currentScreenId: initialScreenId,
      score: 0,
      attempts: {},
      completionStatus: "incomplete",
      successStatus: "unknown",
      ...initial,
    };
  }

  getState(): ProgressState {
    return { ...this.state, attempts: { ...this.state.attempts } };
  }

  onChange(listener: (state: ProgressState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  recordAttempt(hotspotId: string, success: boolean, scoreDelta: number): void {
    this.state.attempts[hotspotId] = (this.state.attempts[hotspotId] ?? 0) + 1;
    if (success) {
      this.state.score += scoreDelta;
    }
    this.emit();
  }

  getAttemptCount(hotspotId: string): number {
    return this.state.attempts[hotspotId] ?? 0;
  }

  goToScreen(screenId: string): void {
    this.state.currentScreenId = screenId;
    this.emit();
  }

  complete(passed: boolean): void {
    this.state.completionStatus = "completed";
    this.state.successStatus = passed ? "passed" : "failed";
    this.emit();
  }

  private emit(): void {
    const snapshot = this.getState();
    for (const listener of this.listeners) listener(snapshot);
  }
}
