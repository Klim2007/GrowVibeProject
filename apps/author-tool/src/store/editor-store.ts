import { create } from "zustand";
import type { HotspotType } from "../api/types.js";

interface EditorState {
  selectedHotspotId: string | null;
  drawType: HotspotType | null;
  selectHotspot: (hotspotId: string | null) => void;
  setDrawType: (type: HotspotType | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedHotspotId: null,
  drawType: null,
  selectHotspot: (selectedHotspotId) => set({ selectedHotspotId }),
  setDrawType: (drawType) => set({ drawType }),
}));
