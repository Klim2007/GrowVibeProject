import { LocalStorageFacade } from "./local-storage-fallback.js";
import { locateScormApi, Scorm12ApiWrapper } from "./scorm-api-wrapper.js";
import type { ScormFacade } from "./types.js";

export function createScormFacade(trainerId: string): ScormFacade {
  const api = locateScormApi();
  return api ? new Scorm12ApiWrapper(api) : new LocalStorageFacade(trainerId);
}

export type { InteractionRecord, LessonStatus, ResumeState, ScormFacade } from "./types.js";
