import type { Beat, CourtyardId, DayId, DurationId, HourId, OutingId, Picks, RangeId, SceneId, TravelId } from "./types";

const HOT_HINT = ["(iced only)", "he has strong feelings about this.", "still iced."];

export const leaveCopy = {
  title: "That is a complete answer.",
  body: [
    "No appeal, no second attempt, no version of this that comes back in three weeks wearing a different font.",
    "The garden stays. It was fun to build.",
  ],
  foot: "You can close the tab. We are good.",
};

export const sincere =
  "Underneath all of this: we still have not eaten. I would like to fix that. The rest is decoration.";

export const askCopy = {
  title: "Will you go on a second date with me?",
  foot: "the throne is still there. lunch is not.",
};

export function travelLabel(id: TravelId | null): string {
  if (id === "near" || id === "his choice") return "he comes to your side around Waiuku";
  if (id === "middle") return "meet somewhere between";
  if (id === "pickup") return "he picks you up";
  if (id === "yours") return "you come his way";
  return "undecided";
}

export function rangeLabel(id: RangeId | null): string {
  if (id === "short") return "not far";
  if (id === "medium") return "a bit of a drive";
  if (id === "flexible" || id === "his choice") return "work it out together";
  return "—";
}

export function outingLabel(id: OutingId | null): string {
  if (id === "meal") return "a proper meal and iced drinks";
  if (id === "picnic") return "a takeaway picnic";
  if (id === "drive") return "a scenic drive, then food";
  if (id === "cosy") return "a cosy table and dessert";
  if (id === "surprise" || id === "his choice") return "he plans it";
  return "undecided";
}

export function dayLabel(id: DayId | null): string {
  if (!id) return "undecided";
  if (id === "his choice") return "he chooses";
  if (id === "later") return "later, by text";
  return id;
}

export function hourLabel(id: HourId | null): string {
  if (!id) return "undecided";
  if (id === "his choice") return "he chooses";
  return id;
}

export function durationLabel(id: DurationId | null): string {
  if (!id) return "undecided";
  if (id === "his choice") return "he chooses";
  return id;
}

export function courtyardLabel(id: CourtyardId | null): string {
  if (id === "fountain" || id === "his choice") return "a fountain";
  if (id === "arch") return "a flower arch";
  if (id === "lantern") return "a lantern tree";
  return "not yet";
}

export function needsRange(travel: TravelId | null): boolean {
  return travel === "middle" || travel === "pickup" || travel === "yours";
}

export function resolveCourtyard(id: CourtyardId | null): Exclude<CourtyardId, "his choice"> {
  if (id === "arch" || id === "lantern" || id === "fountain") return id;
  return "fountain";
}

export function beatFor(scene: SceneId, _picks: Picks, hotTaps = 0): Beat {
  switch (scene) {
    case "letter":
      return {
        speaker: "the pigeon",
        title: "Stop 01 is stamped.",
        body: ["The throne remains. Lunch does not. The iced glass does not."],
        continueLabel: "Open the note.",
        progress: "01 / 12",
      };
    case "complaint":
      return {
        speaker: "a small plaque",
        title: "A complaint has been filed.",
        body: ["Nobody starved. Nobody drank. The builder has filed this against both of you."],
        continueLabel: "I will hear it.",
        progress: "02 / 12",
      };
    case "basket":
      return {
        speaker: "him",
        title: "Two things. Remembered.",
        body: ["Food. And those iced drinks. You pick the shape. I find the place."],
        continueLabel: "Pick up the basket.",
        progress: "03 / 12",
      };
    case "travel":
      return {
        title: "Who travels.",
        body: ["You came this way last time. Where should the next one start?"],
        choices: [
          { id: "near", label: "come to my side" },
          { id: "middle", label: "meet somewhere between" },
          { id: "pickup", label: "pick me up" },
          { id: "yours", label: "I will come your way" },
          { id: "his choice", label: "you choose" },
        ],
        progress: "04 / 12",
      };
    case "range":
      return {
        title: "How far is comfortable.",
        body: ["Roughly. One way. We will use this to pick somewhere sensible."],
        choices: [
          { id: "short", label: "not far" },
          { id: "medium", label: "a bit of a drive" },
          { id: "flexible", label: "we can decide later" },
          { id: "his choice", label: "you choose" },
        ],
        progress: "04 / 12",
      };
    case "outing":
      return {
        title: "Something to eat this time.",
        body: ["The first date skipped this. That was not a plan. It is being corrected."],
        choices: [
          { id: "meal", label: "a proper meal" },
          { id: "picnic", label: "a takeaway picnic" },
          { id: "drive", label: "a scenic drive, then food" },
          { id: "cosy", label: "a cosy table and dessert" },
          { id: "surprise", label: "plan it for me" },
          { id: "no", label: "white chocolate", disabled: true, struck: true, hint: "(not chocolate)" },
          { id: "his choice", label: "you choose" },
        ],
        progress: "05 / 12",
      };
    case "iced":
      return {
        title: "Iced or hot?",
        body: ["He has strong feelings about this."],
        choices: [
          { id: "iced", label: "iced" },
          {
            id: "hot",
            label: "hot",
            disabled: true,
            struck: true,
            hint: HOT_HINT[Math.min(hotTaps, HOT_HINT.length - 1)],
          },
        ],
        progress: "06 / 12",
      };
    case "day":
      return {
        title: "When?",
        body: ["A Monday is still her day off. That is not a guess."],
        choices: [
          { id: "Monday", label: "a Monday" },
          { id: "Saturday", label: "Saturday" },
          { id: "next week", label: "next week" },
          { id: "later", label: "later, by text" },
          { id: "his choice", label: "you choose" },
        ],
        progress: "07 / 12",
      };
    case "hour":
      return {
        title: "What hour?",
        body: ["Daylight. Public. An easy exit."],
        choices: [
          { id: "morning", label: "morning" },
          { id: "early afternoon", label: "early afternoon" },
          { id: "late afternoon", label: "late afternoon" },
          { id: "his choice", label: "you choose" },
        ],
        progress: "08 / 12",
      };
    case "duration":
      return {
        title: "How long?",
        body: ["You set the length, and therefore the exit."],
        choices: [
          { id: "forty-five minutes", label: "forty-five minutes" },
          { id: "an hour or two", label: "an hour or two" },
          { id: "until one of us has to go", label: "until one of us has to go" },
          { id: "his choice", label: "you choose" },
        ],
        progress: "09 / 12",
      };
    case "courtyard":
      return {
        title: "The castle, a little further.",
        body: ["Progress: 12%. A window happened. Pick one thing to add. The crown can wait."],
        choices: [
          { id: "fountain", label: "a fountain" },
          { id: "arch", label: "a flower arch" },
          { id: "lantern", label: "a lantern tree" },
          { id: "his choice", label: "you choose" },
        ],
        progress: "10 / 12",
      };
    case "walk":
      return {
        title: "The table is this way.",
        body: ["The pigeon knows. He will be early."],
        continueLabel: "Walk.",
        progress: "11 / 12",
      };
    case "table":
      return {
        title: "Sit.",
        body: ["The throne came too. It was always going to. Venue stays off this card."],
        continueLabel: "Look at the plan.",
        progress: "12 / 12",
      };
    case "ask":
      return {
        title: askCopy.title,
        body: [askCopy.foot],
        continueLabel: "Yes",
        secondaryLabel: "not this time",
        progress: "·",
      };
    case "decree":
      return {
        speaker: "the decree",
        title: "Stop 02 · the missing meal",
        body: [sincere],
        continueLabel: "Seal the plan.",
        secondaryLabel: "change a detail",
        progress: "seal",
      };
    case "correct":
      return {
        title: "CORRECT.",
        body: ["The pigeon is relieved. Lunch is still outstanding."],
        continueLabel: "Send the pigeon.",
        progress: "stamped",
      };
    case "waiting":
      return {
        speaker: "the pigeon",
        title: "A plan, taking shape.",
        body: [
          "I will find somewhere that fits. Address and map link arrive by text. So does the hour, if we left it open.",
        ],
        continueLabel: "Copy the plan.",
        secondaryLabel: "change a detail",
        progress: "sent",
      };
    case "left":
      return {
        title: leaveCopy.title,
        body: leaveCopy.body,
        progress: "",
      };
    default:
      return { title: "", body: [], progress: "" };
  }
}

export function planRows(p: Picks): [string, string][] {
  const rows: [string, string][] = [
    ["travel", travelLabel(p.travel)],
    ["outing", outingLabel(p.outing)],
    ["drink", "iced"],
    ["day", dayLabel(p.day)],
    ["hour", hourLabel(p.hour)],
    ["length", durationLabel(p.duration)],
    ["courtyard", courtyardLabel(p.courtyard)],
    ["throne", "the one you already picked"],
    ["castle", "13%"],
    ["crown", "not awarded"],
    ["place", "to arrange by text"],
  ];
  if (needsRange(p.travel) && p.range) rows.splice(1, 0, ["how far", rangeLabel(p.range)]);
  return rows;
}

export function planText(p: Picks): string {
  return [
    "STOP 02 · THE MISSING MEAL",
    "",
    ...planRows(p).map(([k, v]) => `${k}: ${v}`),
    p.note ? `a note: ${p.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export const locations: Record<string, string> = {
  curtain: "the garden, closed",
  letter: "the throne lawn",
  complaint: "Stop 01, complete",
  basket: "the throne lawn",
  travel: "the little crossroads",
  range: "the little crossroads",
  outing: "the kitchen gardens",
  iced: "the icehouse",
  day: "the lookout",
  hour: "the lookout",
  duration: "the lookout",
  courtyard: "the unfinished courtyard",
  walk: "the connected road",
  table: "a table, finally",
  ask: "a table, finally",
  decree: "the decree",
  correct: "stamped",
  waiting: "home, with a plan",
  left: "the garden, closed",
};
