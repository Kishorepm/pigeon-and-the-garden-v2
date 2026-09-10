import { useEffect, useMemo, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { beatFor, locations, planRows, planText } from "@/game/copy";
import { applyChoice, nextScene, planReady, roomFor } from "@/game/flow";
import {
  clearPlan,
  defaultChapter,
  isLocalHost,
  mergePicks,
  readPlan,
  writePlan,
} from "@/game/storage";
import type { ChapterFile, Choice, Picks, SceneId } from "@/game/types";
import { emptyPicks } from "@/game/types";
import { Pigeon } from "./figures";
import { Stage } from "./Stage";

function qaSkip() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("qa");
}

function prefersReduced() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function GardenApp() {
  const [chapter, setChapter] = useState<ChapterFile>(defaultChapter);
  const [scene, setScene] = useState<SceneId>("curtain");
  const [picks, setPicks] = useState<Picks>(emptyPicks());
  const [hotTaps, setHotTaps] = useState(0);
  const [leaveAsk, setLeaveAsk] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [copied, setCopied] = useState("");
  const [burst, setBurst] = useState(0);
  const [editFrom, setEditFrom] = useState<SceneId | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setReduced(prefersReduced());
    let cancelled = false;
    fetch("/chapter.json")
      .then((r) => r.json())
      .then((data: ChapterFile) => {
        if (cancelled) return;
        setChapter({ ...defaultChapter, ...data });
        const saved = readPlan();
        setPicks(mergePicks({ ...defaultChapter, ...data }, saved));
        if (qaSkip()) setScene("letter");
        else if (saved?.status === "sent" && planReady(saved.picks)) setScene("waiting");
      })
      .catch(() => {
        const saved = readPlan();
        if (saved) setPicks(mergePicks(defaultChapter, saved));
        if (qaSkip()) setScene("letter");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const theme = document.querySelector('meta[name="theme-color"]');
    if (!theme) return;
    theme.setAttribute("content", scene === "curtain" || scene === "left" ? "#15291f" : "#c6e8ec");
  }, [scene]);

  useEffect(() => {
    const el = panelRef.current;
    if (!el || reduced || scene === "curtain") return;
    const anim = animate(el, { opacity: [0.65, 1], translateY: [8, 0], duration: 240, ease: "out(3)" });
    return () => {
      anim.pause();
    };
  }, [scene, reduced]);

  useEffect(() => {
    if (scene !== "walk") return;
    const delay = reduced ? 120 : 1450;
    const t = window.setTimeout(() => setScene("table"), delay);
    return () => window.clearTimeout(t);
  }, [scene, reduced]);

  useEffect(() => {
    const el = actionsRef.current;
    if (!el || reduced) return;
    const buttons = el.querySelectorAll("button");
    if (!buttons.length) return;
    const anim = animate(buttons, {
      opacity: [0, 1],
      translateY: [6, 0],
      delay: stagger(40),
      duration: 220,
      ease: "out(2)",
    });
    return () => {
      anim.pause();
    };
  }, [scene, reduced, hotTaps]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as unknown as { __garden: { scene: SceneId; room: string; picks: Picks } }).__garden = {
      scene,
      room: roomFor(scene),
      picks,
    };
  }, [scene, picks]);

  const beat = useMemo(() => beatFor(scene, picks, hotTaps), [scene, picks, hotTaps]);

  function go(next: SceneId) {
    setLeaveAsk(false);
    setScene(next);
    if (next === "correct") setBurst((n) => n + 1);
  }

  function onContinue() {
    if (scene === "walk") {
      go("table");
      return;
    }
    if (scene === "decree") {
      void seal();
      return;
    }
    if (scene === "waiting") {
      void copyPlan();
      return;
    }
    go(nextScene(scene, picks));
  }

  function onChoice(c: Choice) {
    if (c.disabled) {
      if (c.id === "hot") setHotTaps((n) => n + 1);
      return;
    }
    const nextPicks = applyChoice(scene, c.id, picks);
    setPicks(nextPicks);
    writePlan("draft", nextPicks);
    if (editFrom === "decree") {
      setEditFrom(null);
      go("decree");
      return;
    }
    const nxt = nextScene(scene, nextPicks);
    if (nxt === "walk" && !reduced) {
      go("walk");
      return;
    }
    go(nxt);
  }

  async function seal() {
    if (!planReady(picks)) return;
    const local = isLocalHost();
    if (!local) {
      try {
        const controller = new AbortController();
        const t = window.setTimeout(() => controller.abort(), 10000);
        await fetch("/api/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ choice: "sealed", picks }),
          signal: controller.signal,
        });
        window.clearTimeout(t);
        writePlan("sent", picks);
      } catch {
        writePlan("draft", picks);
      }
    } else {
      writePlan("draft", picks);
    }
    go("correct");
  }

  async function copyPlan() {
    const text = planText(picks);
    try {
      await navigator.clipboard.writeText(text);
      setCopied("copied · ready to share by text");
    } catch {
      setCopied("select the plan to copy it");
    }
  }

  function startEdit() {
    setEditFrom("decree");
    go("travel");
  }

  if (scene === "left") {
    return (
      <div className="garden-app">
        <Stage scene={scene} picks={picks} reduced={reduced} location={locations.left} burst={0} />
        <section className="panel">
          <div className="dialogue">
            <p className="line-title">{beat.title}</p>
            <div className="check-band my-3.5 h-2" />
            {beat.body.map((p) => (
              <p key={p} className="line-body">
                {p}
              </p>
            ))}
            <p className="hint">You can close the tab. We are good.</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="garden-app">
      <button type="button" className="icon-btn motion-btn" aria-pressed={reduced} onClick={() => setReduced((v) => !v)}>
        {reduced ? "motion off" : "≈"}
      </button>
      {leaveAsk ? (
        <div className="leave-card">
          <p className="m-0 font-pixel text-[18px] leading-tight">Leave the garden?</p>
          <p className="mt-1 mb-2.5 text-xs leading-snug opacity-60">Nothing you have picked is sent.</p>
          <div className="flex gap-2">
            <button type="button" className="btn-pixel sky min-h-11 flex-1" onClick={() => setLeaveAsk(false)}>
              stay
            </button>
            <button type="button" className="min-h-11 flex-1 border-2 border-ink/40 bg-transparent font-pixel text-base" onClick={() => go("left")}>
              leave
            </button>
          </div>
        </div>
      ) : (
        scene !== "curtain" && (
          <button type="button" className="icon-btn leave-btn" onClick={() => setLeaveAsk(true)}>
            leave
          </button>
        )
      )}

      {scene === "curtain" ? (
        <Curtain onOpen={() => go("letter")} />
      ) : (
        <Stage scene={scene} picks={picks} reduced={reduced} location={locations[scene] ?? ""} burst={burst} />
      )}

      {scene !== "curtain" && (
        <section ref={panelRef} className="panel">
          <div className="dialogue">
            {beat.speaker && <p className="speaker">{beat.speaker}</p>}
            <h1 className={`line-title ${scene === "correct" ? "correct" : ""}`}>{beat.title}</h1>
            {scene === "correct" && <div className="check-band my-3 h-2" />}
            {beat.body.map((line) => (
              <p key={line} className="line-body">
                {line}
              </p>
            ))}
            {scene === "decree" && (
              <>
                <dl className="plan-details">
                  {planRows(picks).map(([k, v]) => (
                    <span key={k} className="contents">
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </span>
                  ))}
                </dl>
                <label className="speaker" htmlFor="note">
                  Anything else I should know?
                </label>
                <textarea
                  id="note"
                  className="note-box mt-1"
                  maxLength={300}
                  rows={2}
                  placeholder="A preference, a must-have, or something to avoid…"
                  value={picks.note}
                  onChange={(e) => {
                    const next = { ...picks, note: e.target.value };
                    setPicks(next);
                    writePlan("draft", next);
                  }}
                />
              </>
            )}
            {scene === "waiting" && isLocalHost() && (
              <p className="hint">Local preview · saved on this device. Copy it to share.</p>
            )}
            {copied && <p className="hint">{copied}</p>}
          </div>
          <div ref={actionsRef} className={`actions ${beat.choices && beat.choices.length > 3 ? "routes" : ""}`}>
            {beat.choices?.map((c, i) => (
              <button
                key={c.id + c.label}
                type="button"
                disabled={c.disabled}
                onClick={() => onChoice(c)}
                className={`btn-pixel ${c.id === "his choice" || c.id === "iced" ? "primary" : ""} ${c.struck ? "is-struck" : ""} ${i === beat.choices!.length - 1 && beat.choices!.length % 2 === 1 ? "span-all" : ""}`}
              >
                {c.label}
                {c.hint && <span className="hint">{c.hint}</span>}
              </button>
            ))}
            {!beat.choices && beat.continueLabel && (
              <button type="button" className="btn-pixel primary span-all" onClick={onContinue}>
                {beat.continueLabel}
              </button>
            )}
            {beat.secondaryLabel === "not this time" && (
              <button type="button" className="btn-pixel span-all" onClick={() => go("left")}>
                {beat.secondaryLabel}
              </button>
            )}
            {beat.secondaryLabel === "change a detail" && (
              <button type="button" className="btn-pixel span-all" onClick={startEdit}>
                {beat.secondaryLabel}
              </button>
            )}
            {scene === "waiting" && (
              <button
                type="button"
                className="btn-pixel span-all"
                onClick={() => {
                  clearPlan();
                  setPicks(emptyPicks(chapter.inherited.throne));
                  setCopied("");
                  go("letter");
                }}
              >
                start again
              </button>
            )}
          </div>
          <div className="foot">
            <span>{beat.progress}</span>
            <span>stop 02</span>
          </div>
        </section>
      )}
    </div>
  );
}

function Curtain({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" aria-label="Open the note" onClick={onOpen} className="relative min-h-0 flex-1 cursor-pointer text-left">
      <div className="absolute inset-0 overflow-hidden bg-night-sky">
        {[
          [14, 9, 0.55],
          [31, 5, 0.32],
          [47, 13, 0.7],
          [68, 6, 0.45],
          [82, 16, 0.6],
          [23, 21, 0.26],
          [59, 24, 0.38],
        ].map(([l, t, o], i) => (
          <div key={i} className="star" style={{ left: `${l}%`, top: `${t}%`, opacity: o }} />
        ))}
        <div className="bg-wood absolute inset-x-0 top-[46.4%] h-[2.2%]" />
        <div className="bg-terra absolute inset-x-0 top-[48.6%] h-[1.6%]" />
        <div className="bg-honey absolute inset-x-0 top-[50.2%] h-[1%]" />
        <div className="bg-shadow absolute inset-x-0 top-[51.2%] bottom-0" />
        <div className="absolute top-[calc(51.2%-30px)] left-[71.2%] h-[5px] w-[5px] animate-[glow_2.8s_steps(2,end)_infinite_alternate] bg-honey" />
        <div className="absolute top-[58%] left-[12%]">
          <Pigeon flap />
        </div>
      </div>
      <div className="curtain-note">
        <div className="rod" />
        <div className="scroll">
          <p className="m-0 text-center text-[11.5px] tracking-[0.22em] text-ink/50">FOR PEANUT</p>
          <h1 className="font-pixel mt-3.5 mb-0 text-center text-[clamp(24px,7vw,29px)] leading-[1.08] font-semibold text-balance">
            The road continues.
          </h1>
          <div className="mx-[34px] mt-4 h-[3px] bg-honey" />
          <p className="mt-4 mb-0 text-center text-sm leading-relaxed text-ink/70">A pigeon has arrived again.</p>
        </div>
        <div className="rod" />
      </div>
      <div className="absolute right-0 bottom-[clamp(60px,10.5vh,92px)] left-0 flex justify-center">
        <div className="border-ink bg-cream/90 font-pixel flex min-h-11 animate-[nudgeup_1.6s_steps(2,end)_3s_infinite_alternate] items-center gap-2 border-2 px-[18px] text-[15px]">
          tap to open
        </div>
      </div>
    </button>
  );
}
