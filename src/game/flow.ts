import { needsRange } from "./copy";
import type { CourtyardId, DayId, DurationId, HourId, OutingId, Picks, RangeId, RoomId, SceneId, TravelId } from "./types";

export function roomFor(scene: SceneId): RoomId {
  if (scene === "travel" || scene === "range") return "cross";
  if (scene === "outing" || scene === "iced" || scene === "day" || scene === "hour" || scene === "duration") return "path";
  if (scene === "courtyard" || scene === "walk") return "yard";
  if (scene === "table" || scene === "ask" || scene === "decree" || scene === "correct" || scene === "waiting") return "table";
  return "lawn";
}

export function nextScene(scene: SceneId, picks: Picks): SceneId {
  switch (scene) {
    case "curtain":
      return "letter";
    case "letter":
      return "complaint";
    case "complaint":
      return "basket";
    case "basket":
      return "travel";
    case "travel":
      return needsRange(picks.travel) ? "range" : "outing";
    case "range":
      return "outing";
    case "outing":
      return "iced";
    case "iced":
      return "day";
    case "day":
      return "hour";
    case "hour":
      return "duration";
    case "duration":
      return "courtyard";
    case "courtyard":
      return "walk";
    case "walk":
      return "table";
    case "table":
      return "ask";
    case "ask":
      return "decree";
    case "decree":
      return "correct";
    case "correct":
      return "waiting";
    default:
      return scene;
  }
}

export function applyChoice(scene: SceneId, id: string, picks: Picks): Picks {
  const next = { ...picks };
  if (scene === "travel") {
    next.travel = id as TravelId;
    if (!needsRange(next.travel)) next.range = "short";
  }
  if (scene === "range") next.range = id as RangeId;
  if (scene === "outing") next.outing = id as OutingId;
  if (scene === "iced") next.drink = "iced";
  if (scene === "day") next.day = id as DayId;
  if (scene === "hour") next.hour = id as HourId;
  if (scene === "duration") next.duration = id as DurationId;
  if (scene === "courtyard") next.courtyard = id as CourtyardId;
  return next;
}

export function planReady(p: Picks): boolean {
  return Boolean(p.travel && p.outing && p.day && p.hour && p.duration && p.courtyard && p.drink === "iced");
}
