import { Player, PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useRef, useState } from "react";
import { PresenterLayer, Screen, Tool } from "./deck/Presenter";
import { Toolbar } from "./deck/Toolbar";
import { FullscreenButton, toggleFullscreen } from "./deck/FullscreenButton";
import { Scrubber } from "./deck/Scrubber";
import { SlideRoot } from "./deck/SlideRoot";
import { stopsOf, totalOf } from "./deck/steps";
import { C, F, FPS, H, W } from "./deck/theme";
import { SLIDES } from "./slides";

const Gap = () => <span style={{ display: "inline-block", width: 36 }} />;

type Pos = { slide: number; step: number; mode: "play" | "jump" };

const lastStep = (slide: number) => SLIDES[slide].steps.length - 1;

const initialSlide = () => {
  const n = parseInt(window.location.hash.slice(1), 10);
  return Number.isFinite(n) ? Math.min(Math.max(n - 1, 0), SLIDES.length - 1) : 0;
};

export default function App() {
  const ref = useRef<PlayerRef>(null);
  const target = useRef<number | null>(null);
  const [pos, setPos] = useState<Pos>({ slide: initialSlide(), step: 0, mode: "play" });
  const [hud, setHud] = useState(false);
  const [help, setHelp] = useState(false);
  const [jump, setJump] = useState("");
  const [tool, setTool] = useState<Tool>("none");
  const [ink, setInk] = useState(0);
  const [screen, setScreen] = useState<Screen>("none");
  const [clearNonce, setClearNonce] = useState(0);

  const def = SLIDES[pos.slide];
  const stops = stopsOf(def.steps);

  // Drive the player to the current step's stop frame.
  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const stop = stops[pos.step];
    const onFrame = (e: { detail: { frame: number } }) => {
      if (target.current !== null && e.detail.frame >= target.current) {
        const tgt = target.current;
        target.current = null;
        p.pause();
        p.seekTo(tgt);
      }
    };
    p.addEventListener("frameupdate", onFrame);
    if (pos.mode === "jump") {
      target.current = null;
      p.pause();
      p.seekTo(stop);
    } else {
      const from = pos.step === 0 ? 0 : stops[pos.step - 1];
      if (p.getCurrentFrame() !== from) p.seekTo(from);
      target.current = stop;
      p.play();
    }
    // A freshly mounted player may ignore the first play(); retry once it is ready.
    const retry = window.setTimeout(() => {
      if (target.current !== null && !p.isPlaying()) p.play();
    }, 80);
    window.history.replaceState(null, "", `#${pos.slide + 1}`);
    return () => {
      window.clearTimeout(retry);
      p.removeEventListener("frameupdate", onFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos]);

  const next = useCallback(() => {
    const p = ref.current;
    // A step still animating: finish it instantly first.
    if (p && target.current !== null) {
      const tgt = target.current;
      target.current = null;
      p.pause();
      p.seekTo(tgt);
      return;
    }
    setPos((cur) => {
      if (cur.step < lastStep(cur.slide)) return { slide: cur.slide, step: cur.step + 1, mode: "play" };
      if (cur.slide < SLIDES.length - 1) return { slide: cur.slide + 1, step: 0, mode: "play" };
      return cur;
    });
  }, []);

  const prev = useCallback(() => {
    target.current = null;
    setPos((cur) => {
      if (cur.step > 0) return { slide: cur.slide, step: cur.step - 1, mode: "jump" };
      if (cur.slide > 0) return { slide: cur.slide - 1, step: lastStep(cur.slide - 1), mode: "jump" };
      return { ...cur, mode: "jump" };
    });
  }, []);

  const goto = useCallback((slide: number) => {
    target.current = null;
    setPos({ slide: Math.min(Math.max(slide, 0), SLIDES.length - 1), step: 0, mode: "play" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      const drawing = tool === "pen" || tool === "highlighter";
      if (drawing && /^[1-4]$/.test(k)) {
        setInk(parseInt(k, 10) - 1);
        return;
      }
      const toggleTool = (t: Tool) => setTool((cur) => (cur === t ? "none" : t));
      if (k === "l") return toggleTool("laser");
      if (k === "d") return toggleTool("pen");
      if (k === "m") return toggleTool("highlighter");
      if (k === "s") return toggleTool("spotlight");
      if (k === "b") return setScreen((cur) => (cur === "black" ? "none" : "black"));
      if (k === "w") return setScreen((cur) => (cur === "white" ? "none" : "white"));
      if (k === "c") return setClearNonce((n) => n + 1);
      if (/^[0-9]$/.test(k)) {
        setJump((j) => (j + k).slice(-3));
        return;
      }
      if (k === "Enter" && jump) {
        goto(parseInt(jump, 10) - 1);
        setJump("");
        return;
      }
      setJump("");
      if (["ArrowRight", "ArrowDown", " ", "PageDown", "Enter", "n"].includes(k)) {
        e.preventDefault();
        next();
      } else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace", "p"].includes(k)) {
        e.preventDefault();
        prev();
      } else if (k === "Home") goto(0);
      else if (k === "End") goto(SLIDES.length - 1);
      else if (k === "r") setPos((cur) => ({ ...cur, mode: "play" }));
      else if (k === "f") toggleFullscreen(); else if (k === "h") setHud((v) => !v);
      else if (k === "?") setHelp((v) => !v);
      else if (k === "Escape") {
        setHelp(false);
        setTool("none");
        setScreen("none");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goto, jump, tool]);

  const progress = (pos.slide + (pos.step + 1) / def.steps.length) / SLIDES.length;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: C.bg,
        position: "relative",
        cursor: tool === "laser" || tool === "spotlight" ? "none" : undefined,
      }}
      onClick={next}
      onContextMenu={(e) => {
        e.preventDefault();
        prev();
      }}
    >
      <Player
        key={pos.slide}
        ref={ref}
        component={SlideRoot}
        inputProps={{ index: pos.slide }}
        durationInFrames={totalOf(def.steps)}
        fps={FPS}
        compositionWidth={W}
        compositionHeight={H}
        style={{ width: "100%", height: "100%" }}
        clickToPlay={false}
        doubleClickToFullscreen={false}
        spaceKeyToPlayOrPause={false}
        loop={false}
        initialFrame={pos.mode === "jump" ? stops[pos.step] : 0}
        autoPlay={pos.mode === "play" && pos.step === 0}
        initiallyMuted
        acknowledgeRemotionLicense
      />
      <Scrubber progress={progress} current={pos.slide} onSeek={goto} />
      <PresenterLayer tool={tool} ink={ink} screen={screen} clearKey={`${pos.slide}-${clearNonce}`} />
      <Toolbar
        tool={tool}
        setTool={setTool}
        ink={ink}
        setInk={setInk}
        screen={screen}
        setScreen={setScreen}
        onClear={() => setClearNonce((n) => n + 1)}
      />
      <FullscreenButton />
      {(hud || jump) && (
        <div
          style={{
            position: "absolute",
            right: 20,
            bottom: 14,
            fontFamily: F.mono,
            fontSize: 14,
            color: C.dim,
            background: "rgba(0,0,0,0.35)",
            padding: "6px 10px",
            borderRadius: 6,
            whiteSpace: "pre",
          }}
        >
          {jump ? `→ ${jump}` : `${pos.slide + 1} / ${SLIDES.length}    крок ${pos.step + 1}/${def.steps.length}    ${def.title}`}
        </div>
      )}
      {help && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(10,12,20,0.75)",
          }}
        >
          <div style={{ fontFamily: F.body, color: C.text, fontSize: 18, lineHeight: 1.9, background: C.panel, padding: "28px 40px", borderRadius: 14 }}>
            <b>→ / Space / PgDn / click</b> – наступний крок
            <br />
            <b>← / PgUp / right-click</b> – назад
            <br />
            <b>число + Enter</b> – перейти до слайда
            <br />
            <b>r</b> – повторити крок<Gap /><b>f</b> – повний екран<Gap /><b>h</b> – лічильник
            <br />
            <b>Home / End</b> – перший / останній слайд
            <hr style={{ border: 0, borderTop: `1px solid ${C.line}`, margin: "12px 0" }} />
            <b>l</b> – лазерна указка<Gap /><b>s</b> – прожектор (коліщатко – розмір)
            <br />
            <b>d</b> – перо<Gap /><b>m</b> – маркер, що зникає<Gap /><b>1–4</b> – колір<Gap /><b>c</b> – стерти
            <br />
            <b>b</b> – чорний екран<Gap /><b>w</b> – білий екран<Gap /><b>Esc</b> – вимкнути все
          </div>
        </div>
      )}
    </div>
  );
}
