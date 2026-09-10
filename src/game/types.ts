export type SceneId =
  | "curtain"
  | "letter"
  | "complaint"
  | "basket"
  | "travel"
  | "range"
  | "outing"
  | "iced"
  | "day"
  | "hour"
  | "duration"
  | "courtyard"
  | "walk"
  | "table"
  | "ask"
  | "decree"
  | "correct"
  | "waiting"
  | "left";

export type RoomId = "lawn" | "cross" | "path" | "yard" | "table";

export type TravelId = "near" | "middle" | "pickup" | "yours" | "his choice";
export type RangeId = "short" | "medium" | "flexible" | "his choice";
export type OutingId =
  | "meal"
  | "picnic"
  | "drive"
  | "cosy"
  | "surprise"
  | "his choice";
export type DayId = "Monday" | "Saturday" | "next week" | "later" | "his choice";
export type HourId = "morning" | "early afternoon" | "late afternoon" | "his choice";
export type DurationId =
  | "forty-five minutes"
  | "an hour or two"
  | "until one of us has to go"
  | "his choice";
export type CourtyardId = "fountain" | "arch" | "lantern" | "his choice";
export type ThroneId = "the gilded one" | "the beanbag" | "the one with a cat on it" | "his choice";

export type ChapterStage = "inviting" | "proposed" | "completed" | "resting";

export type Picks = {
  travel: TravelId | null;
  range: RangeId | null;
  outing: OutingId | null;
  drink: "iced";
  day: DayId | null;
  hour: HourId | null;
  duration: DurationId | null;
  courtyard: CourtyardId | null;
  throne: ThroneId;
  note: string;
};

export type Choice = {
  id: string;
  label: string;
  disabled?: boolean;
  struck?: boolean;
  hint?: string;
};

export type Beat = {
  speaker?: string;
  title: string;
  body: string[];
  choices?: Choice[];
  continueLabel?: string;
  secondaryLabel?: string;
  progress: string;
};

export type ChapterFile = {
  revision: string;
  stage: ChapterStage;
  current: string;
  inherited: { throne: ThroneId };
  courtyard: CourtyardId[];
  completed: { stop: string; plaque: string }[];
  itinerary: { venue?: string; day?: string; time?: string; note?: string } | null;
  memory: string | null;
};

export type SavedPlan = {
  v: 1;
  status: "draft" | "sent";
  picks: Picks;
};

export function emptyPicks(throne: ThroneId = "the gilded one"): Picks {
  return {
    travel: null,
    range: null,
    outing: null,
    drink: "iced",
    day: null,
    hour: null,
    duration: null,
    courtyard: null,
    throne,
    note: "",
  };
}

export const HOT_LINES = ["(iced only)", "he has strong feelings about this.", "still iced."];
