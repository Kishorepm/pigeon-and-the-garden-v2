import { emptyPicks, type ChapterFile, type Picks, type SavedPlan } from "./types";

export const STORAGE_KEY = "garden-missing-meal-v1";

export const defaultChapter: ChapterFile = {
  revision: "stop02-1",
  stage: "inviting",
  current: "02",
  inherited: { throne: "the gilded one" },
  courtyard: [],
  completed: [{ stop: "01", plaque: "Complete. Nobody starved. Nobody drank." }],
  itinerary: null,
  memory: null,
};

export function readPlan(): SavedPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedPlan;
    if (data?.v !== 1 || !data.picks) return null;
    return data;
  } catch {
    return null;
  }
}

export function writePlan(status: SavedPlan["status"], picks: Picks): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, status, picks } satisfies SavedPlan));
    return true;
  } catch {
    return false;
  }
}

export function clearPlan(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function isLocalHost(): boolean {
  if (typeof location === "undefined") return true;
  return ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
}

export function mergePicks(chapter: ChapterFile, saved: SavedPlan | null): Picks {
  const base = emptyPicks(chapter.inherited.throne);
  if (!saved?.picks) return base;
  return { ...base, ...saved.picks, drink: "iced", throne: chapter.inherited.throne };
}
