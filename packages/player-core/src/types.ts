export interface ValidationResult {
  success: boolean;
  hint?: string;
}

export interface ProgressState {
  currentScreenId: string;
  score: number;
  attempts: Record<string, number>;
  completionStatus: "incomplete" | "completed";
  successStatus: "unknown" | "passed" | "failed";
}

export interface ContainRect {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}
