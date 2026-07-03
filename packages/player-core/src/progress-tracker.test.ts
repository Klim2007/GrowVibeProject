import { describe, expect, it } from "vitest";
import { ProgressTracker } from "./progress-tracker.js";

describe("ProgressTracker", () => {
  it("starts with zero score and the given initial screen", () => {
    const tracker = new ProgressTracker("screen_1");
    const state = tracker.getState();
    expect(state.currentScreenId).toBe("screen_1");
    expect(state.score).toBe(0);
    expect(state.completionStatus).toBe("incomplete");
  });

  it("accumulates score only on successful attempts", () => {
    const tracker = new ProgressTracker("screen_1");
    tracker.recordAttempt("h1", false, 10);
    expect(tracker.getState().score).toBe(0);
    tracker.recordAttempt("h1", true, 10);
    expect(tracker.getState().score).toBe(10);
  });

  it("tracks attempt counts per hotspot", () => {
    const tracker = new ProgressTracker("screen_1");
    tracker.recordAttempt("h1", false, 10);
    tracker.recordAttempt("h1", false, 10);
    tracker.recordAttempt("h1", true, 10);
    expect(tracker.getAttemptCount("h1")).toBe(3);
    expect(tracker.getAttemptCount("h2")).toBe(0);
  });

  it("notifies listeners on every state change", () => {
    const tracker = new ProgressTracker("screen_1");
    const seen: number[] = [];
    const unsubscribe = tracker.onChange((state) => seen.push(state.score));

    tracker.recordAttempt("h1", true, 5);
    tracker.goToScreen("screen_2");
    tracker.complete(true);

    expect(seen).toEqual([5, 5, 5]);
    unsubscribe();
    tracker.recordAttempt("h2", true, 5);
    expect(seen).toHaveLength(3);
  });

  it("sets completion and success status on complete()", () => {
    const tracker = new ProgressTracker("screen_1");
    tracker.complete(false);
    expect(tracker.getState().completionStatus).toBe("completed");
    expect(tracker.getState().successStatus).toBe("failed");
  });

  it("restores from an initial partial state (suspend/resume-style)", () => {
    const tracker = new ProgressTracker("screen_1", { score: 40, attempts: { h1: 2 } });
    expect(tracker.getState().score).toBe(40);
    expect(tracker.getAttemptCount("h1")).toBe(2);
  });
});
