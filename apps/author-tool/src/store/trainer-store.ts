import { create } from "zustand";
import * as trainersApi from "../api/trainers.js";
import * as screensApi from "../api/screens.js";
import * as hotspotsApi from "../api/hotspots.js";
import type { CreateHotspotInput, UpdateHotspotInput } from "../api/hotspots.js";
import type { HotspotDto, ScreenDto, TrainerDto } from "../api/types.js";

interface TrainerState {
  trainer: TrainerDto | null;
  loading: boolean;
  error: string | null;
  selectedScreenId: string | null;

  loadTrainer: (id: string) => Promise<void>;
  updateTrainerSettings: (patch: Partial<{ title: string; passingScore: number }>) => Promise<void>;
  selectScreen: (screenId: string | null) => void;

  addScreen: (file: File) => Promise<void>;
  deleteScreen: (screenId: string) => Promise<void>;
  reorderScreens: (orderedIds: string[]) => Promise<void>;
  updateScreenNarration: (screenId: string, narration: string) => Promise<void>;

  addHotspot: (screenId: string, input: CreateHotspotInput) => Promise<void>;
  updateHotspot: (hotspotId: string, input: UpdateHotspotInput) => Promise<void>;
  deleteHotspot: (hotspotId: string) => Promise<void>;
}

function replaceScreen(trainer: TrainerDto, screen: ScreenDto): TrainerDto {
  return { ...trainer, screens: trainer.screens.map((s) => (s.id === screen.id ? screen : s)) };
}

function replaceHotspotInTrainer(trainer: TrainerDto, hotspot: HotspotDto): TrainerDto {
  return {
    ...trainer,
    screens: trainer.screens.map((screen) =>
      screen.id === hotspot.screenId
        ? { ...screen, hotspots: screen.hotspots.map((h) => (h.id === hotspot.id ? hotspot : h)) }
        : screen,
    ),
  };
}

export const useTrainerStore = create<TrainerState>((set, get) => ({
  trainer: null,
  loading: false,
  error: null,
  selectedScreenId: null,

  async loadTrainer(id) {
    set({ loading: true, error: null });
    try {
      const trainer = await trainersApi.getTrainer(id);
      set({ trainer, loading: false, selectedScreenId: trainer.screens[0]?.id ?? null });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : String(err) });
    }
  },

  async updateTrainerSettings(patch) {
    const { trainer } = get();
    if (!trainer) return;
    const updated = await trainersApi.updateTrainer(trainer.id, patch);
    set({ trainer: updated });
  },

  selectScreen(screenId) {
    set({ selectedScreenId: screenId });
  },

  async addScreen(file) {
    const { trainer } = get();
    if (!trainer) return;
    const asset = await trainersApi.uploadAsset(trainer.id, file);
    const screen = await trainersApi.createScreen(trainer.id, {
      imageUrl: asset.url,
      order: trainer.screens.length,
    });
    set({
      trainer: { ...trainer, screens: [...trainer.screens, screen] },
      selectedScreenId: screen.id,
    });
  },

  async deleteScreen(screenId) {
    const { trainer } = get();
    if (!trainer) return;
    await screensApi.deleteScreen(screenId);
    const remaining = trainer.screens.filter((s) => s.id !== screenId);
    set({
      trainer: { ...trainer, screens: remaining },
      selectedScreenId: get().selectedScreenId === screenId ? (remaining[0]?.id ?? null) : get().selectedScreenId,
    });
  },

  async reorderScreens(orderedIds) {
    const { trainer } = get();
    if (!trainer) return;
    const order = orderedIds.map((id, index) => ({ id, order: index }));
    await trainersApi.reorderScreens(trainer.id, order);
    const byId = new Map(trainer.screens.map((s) => [s.id, s]));
    const reordered = orderedIds.map((id, index) => ({ ...byId.get(id)!, order: index }));
    set({ trainer: { ...trainer, screens: reordered } });
  },

  async updateScreenNarration(screenId, narration) {
    const screen = await screensApi.updateScreen(screenId, { narration });
    const { trainer } = get();
    if (!trainer) return;
    set({ trainer: replaceScreen(trainer, screen) });
  },

  async addHotspot(screenId, input) {
    const hotspot = await screensApi.createHotspot(screenId, input);
    const { trainer } = get();
    if (!trainer) return;
    set({
      trainer: {
        ...trainer,
        screens: trainer.screens.map((s) => (s.id === screenId ? { ...s, hotspots: [...s.hotspots, hotspot] } : s)),
      },
    });
  },

  async updateHotspot(hotspotId, input) {
    const hotspot = await hotspotsApi.updateHotspot(hotspotId, input);
    const { trainer } = get();
    if (!trainer) return;
    set({ trainer: replaceHotspotInTrainer(trainer, hotspot) });
  },

  async deleteHotspot(hotspotId) {
    await hotspotsApi.deleteHotspot(hotspotId);
    const { trainer } = get();
    if (!trainer) return;
    set({
      trainer: {
        ...trainer,
        screens: trainer.screens.map((s) => ({ ...s, hotspots: s.hotspots.filter((h) => h.id !== hotspotId) })),
      },
    });
  },
}));
