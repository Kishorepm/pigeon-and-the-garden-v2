import { useEffect, useRef, type CSSProperties } from "react";
import { animate } from "animejs";
import { resolveCourtyard } from "@/game/copy";
import { roomFor } from "@/game/flow";
import type { HourId, Picks, RoomId, SceneId } from "@/game/types";
import { Her, Him, Pigeon } from "./figures";

const ROOMS: RoomId[] = ["lawn", "cross", "path", "yard", "table"];

function skyFor(scene: SceneId, hour: HourId | null): { top: string; mid: string; low: string; night: boolean } {
  if (scene === "curtain" || scene === "left") {
    return { top: "#1b2830", mid: "#243d30", low: "#15291f", night: true };
  }
  if (hour === "morning") return { top: "#f0d9a8", mid: "#c6e8ec", low: "#9ec9c4", night: false };
  if (hour === "late afternoon") return { top: "#e8b07a", mid: "#d4c07a", low: "#7eaea4", night: false };
  return { top: "#c6e8ec", mid: "#9ec9c4", low: "#7eaea4", night: false };
}

function poseFor(scene: SceneId): "stand" | "walk" | "sit" {
  if (scene === "walk") return "walk";
  if (scene === "table" || scene === "ask" || scene === "decree" || scene === "correct" || scene === "waiting") return "sit";
  return "stand";
}

export function Stage({
  scene,
  picks,
  reduced,
  location,
  burst,
}: {
  scene: SceneId;
  picks: Picks;
  reduced: boolean;
  location: string;
  burst: number;
}) {
  const clip = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const pigeon = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const room = roomFor(scene);
  const sky = skyFor(scene, picks.hour);
  const pose = poseFor(scene);
  const yardPiece = resolveCourtyard(picks.courtyard);
  const showPair = scene !== "curtain";
  const himGone = scene === "waiting" || scene === "left";
  const carry = Boolean(picks.travel) || scene === "basket" || ["outing", "iced", "day", "hour", "duration", "courtyard", "walk"].includes(scene);

  useEffect(() => {
    const el = world.current;
    const host = clip.current;
    if (!el || !host) return;
    const idx = ROOMS.indexOf(room);
    const x = -idx * host.clientWidth;
    if (reduced) {
      el.style.transform = `translateX(${x}px)`;
      return;
    }
    const anim = animate(el, {
      translateX: x,
      duration: scene === "walk" ? 1400 : 520,
      ease: scene === "walk" ? "inOut(3)" : "out(3)",
    });
    return () => {
      anim.pause();
    };
  }, [room, scene, reduced]);

  useEffect(() => {
    const node = pigeon.current;
    if (!node || reduced) return;
    if (scene === "letter" || scene === "correct" || scene === "waiting") {
      const anim = animate(node, {
        translateX: scene === "waiting" ? [0, 160] : [scene === "letter" ? -80 : 0, scene === "correct" ? 40 : 0],
        translateY: scene === "waiting" ? [0, -90] : [scene === "letter" ? -50 : 0, 0],
        duration: scene === "waiting" ? 1600 : 900,
        ease: "inOut(2)",
      });
      return () => {
        anim.pause();
      };
    }
  }, [scene, reduced]);

  useEffect(() => {
    const c = canvas.current;
    const host = clip.current;
    if (!c || !host) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t0 = performance.now();
    const petals = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random(),
      y: Math.random() * -1,
      s: 3 + (i % 4),
      sp: 18 + (i % 7) * 4,
      col: i % 3 === 0 ? "#d9a3a0" : "#fff8ea",
      r: Math.random() * Math.PI,
    }));
    const motes = Array.from({ length: 10 }, () => ({
      x: Math.random(),
      y: 0.55 + Math.random() * 0.3,
      o: 0.2 + Math.random() * 0.5,
    }));

    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = host.clientWidth * dpr;
      c.height = host.clientHeight * dpr;
      c.style.width = `${host.clientWidth}px`;
      c.style.height = `${host.clientHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);

    const tick = (now: number) => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;
      ctx.clearRect(0, 0, w, h);
      if (!reduced && !sky.night) {
        for (const m of motes) {
          m.x += dt * 0.02;
          if (m.x > 1) m.x -= 1;
          ctx.globalAlpha = m.o;
          ctx.fillStyle = "#fff8ea";
          ctx.fillRect(m.x * w, m.y * h, 3, 3);
        }
      }
      const raining = burst > 0 || scene === "correct";
      if (!reduced && raining) {
        for (const p of petals) {
          p.y += (p.sp * dt) / h;
          p.x += (Math.sin(now / 400 + p.r) * 12 * dt) / w;
          p.r += dt * 1.2;
          if (p.y > 1.1) {
            p.y = -0.1;
            p.x = Math.random();
          }
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = p.col;
          ctx.fillRect(p.x * w, p.y * h, p.s, p.s);
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduced, scene, burst, sky.night]);

  const himPose = pose;
  const herPose = pose;

  return (
    <div ref={clip} className="stage-clip" data-scene={scene} data-room={room}>
      <div
        ref={world}
        className="world"
        style={
          {
            "--sky-top": sky.top,
            "--sky-mid": sky.mid,
            "--sky-low": sky.low,
          } as CSSProperties
        }
      >
        <Lawn night={sky.night} throne={picks.throne} />
        <Cross />
        <Path hour={picks.hour} />
        <Yard piece={picks.courtyard ? yardPiece : null} />
        <TableRoom piece={picks.courtyard ? yardPiece : null} picnic={picks.outing === "picnic"} />
      </div>

      <canvas ref={canvas} className="ambient" aria-hidden />

      {showPair && (
        <div className="actors">
          {!himGone && (
            <div className="absolute bottom-[18%] left-[22%]">
              <Him pose={himPose} basket={carry} />
            </div>
          )}
          <div className="absolute bottom-[18%] left-[42%]">
            <Her pose={herPose} />
          </div>
          {scene !== "left" && (
            <div ref={pigeon} className="absolute bottom-[34%] left-[58%]">
              <Pigeon flap={!reduced && scene !== "table"} />
            </div>
          )}
        </div>
      )}

      <div className="location-chip">{location}</div>
    </div>
  );
}

function Sky({ night }: { night: boolean }) {
  return (
    <>
      <div className="sky" />
      {night ? <div className="moon" /> : <div className="sun" />}
      {!night && (
        <>
          <div className="cloud" style={{ top: "12%", left: "40%", width: 36, animationDelay: "-2s" }} />
          <div className="cloud" style={{ top: "20%", left: "70%", width: 28, animationDelay: "-7s" }} />
          <div className="cloud" style={{ top: "8%", left: "8%", width: 22, animationDelay: "-11s" }} />
        </>
      )}
      {night &&
        [
          [14, 9, 0.55],
          [31, 5, 0.32],
          [47, 13, 0.7],
          [68, 6, 0.45],
          [82, 16, 0.6],
          [23, 21, 0.26],
        ].map(([l, t, o], i) => <div key={i} className="star" style={{ left: `${l}%`, top: `${t}%`, opacity: o }} />)}
      <div className="horizon" />
      <div className="sky-dither" />
      <div className="ground" />
    </>
  );
}

function Lawn({ night, throne }: { night: boolean; throne: string }) {
  const src =
    throne === "the beanbag"
      ? "/art/art-throne-beanbag.png"
      : throne === "the one with a cat on it"
        ? "/art/art-throne-cat.png"
        : "/art/art-throne-gilded.png";
  return (
    <section className="room" aria-hidden>
      <Sky night={night} />
      <div className="castle" />
      <div className="castle-mist" />
      <div className="smoke" style={{ right: "18%", bottom: "72%" }} />
      <div className="tree" style={{ left: "4%", bottom: "28%" }} />
      <div className="hedge" style={{ right: "28%", bottom: "26%" }} />
      <div className="flowers" style={{ left: "18%", bottom: "26%" }} />
      <div className="prop-img" style={{ left: "8%", bottom: "22%", width: 72, height: 72, backgroundImage: `url(${src})` }} />
      <div className="plaque">STOP 01 · COMPLETE</div>
      <div className="path" />
    </section>
  );
}

function Cross() {
  return (
    <section className="room" aria-hidden>
      <Sky night={false} />
      <div className="tree" style={{ left: "2%" }} />
      <div className="tree" style={{ right: "6%", transform: "scaleX(-1)" }} />
      <div className="pond">
        <div className="ripple" />
        <div className="ripple" style={{ left: "55%", animationDelay: "-1.4s" }} />
      </div>
      <div className="prop-img" style={{ left: "8%", bottom: "22%", width: 56, height: 48, backgroundImage: "url(/art/art-duck.png)" }} />
      <div className="path" />
      <div className="absolute bottom-[40%] left-1/2 -translate-x-1/2">
        <div className="sign">two ways. both overdue.</div>
      </div>
    </section>
  );
}

function Path({ hour }: { hour: HourId | null }) {
  return (
    <section className="room" aria-hidden>
      <Sky night={false} />
      <div className="tree" style={{ left: "8%" }} />
      <div className="tree" style={{ left: "62%", bottom: "32%" }} />
      <div className="hedge" style={{ left: "36%" }} />
      <div className="flowers" style={{ right: "12%" }} />
      <div className="prop-img" style={{ right: "22%", bottom: "24%", width: 52, height: 44, backgroundImage: "url(/art/art-hen.png)" }} />
      {hour === "late afternoon" && <div className="lantern-glow" style={{ left: "20%", bottom: "48%" }} />}
      <div className="path" />
    </section>
  );
}

function Yard({ piece }: { piece: "fountain" | "arch" | "lantern" | null }) {
  return (
    <section className="room" aria-hidden>
      <Sky night={false} />
      <div className="castle" style={{ right: "10%", bottom: "32%", width: 150, height: 150 }} />
      <div className="smoke" style={{ right: "28%", bottom: "78%" }} />
      <div className="path-stone" />
      {piece === "fountain" && (
        <div className="prop-img" style={{ left: "12%", bottom: "22%", width: 110, height: 110, backgroundImage: "url(/art/fountain.png)" }} />
      )}
      {piece === "arch" && (
        <div className="arch" style={{ left: "14%" }}>
          <div className="post" style={{ left: 0 }} />
          <div className="post" style={{ right: 0 }} />
          <div className="beam" />
          <div className="flowers" style={{ left: -8, top: -6, bottom: "auto" }} />
          <div className="flowers" style={{ right: -8, top: -8, bottom: "auto" }} />
        </div>
      )}
      {piece === "lantern" && (
        <>
          <div className="tree" style={{ left: "12%", bottom: "22%" }} />
          <div className="lantern-glow" style={{ left: "22%", bottom: "52%" }} />
          <div className="lantern-glow" style={{ left: "28%", bottom: "58%", animationDelay: "-1s" }} />
        </>
      )}
      <div className="plaque" style={{ right: "10%", left: "auto" }}>
        13%
      </div>
    </section>
  );
}

function TableRoom({ piece, picnic }: { piece: "fountain" | "arch" | "lantern" | null; picnic: boolean }) {
  return (
    <section className="room" aria-hidden>
      <Sky night={false} />
      <div className="castle" style={{ right: "6%", width: 96, height: 96, opacity: 0.7 }} />
      <div className="flowers" style={{ left: "6%" }} />
      <div className="table-cloth" />
      <div
        className="prop-img"
        style={{
          left: "22%",
          bottom: "22%",
          width: picnic ? 120 : 70,
          height: picnic ? 80 : 56,
          backgroundImage: picnic ? "url(/art/picnic.png)" : "url(/art/art-drink.png)",
        }}
      />
      <div
        className="prop-img"
        style={{ right: "12%", bottom: "20%", width: 64, height: 64, backgroundImage: "url(/art/art-throne-gilded.png)" }}
      />
      {piece === "fountain" && (
        <div className="prop-img" style={{ left: "4%", bottom: "28%", width: 80, height: 80, backgroundImage: "url(/art/fountain.png)" }} />
      )}
      {piece === "lantern" && <div className="lantern-glow" style={{ left: "14%", bottom: "46%" }} />}
      <div className="path" />
    </section>
  );
}
