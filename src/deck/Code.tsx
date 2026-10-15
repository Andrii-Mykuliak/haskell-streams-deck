import React from "react";
import { C, CH, F } from "./theme";
import { mix, useSteps } from "./steps";

/* ------------------------------------------------------------------ *
 * Haskell-ish syntax colouring
 * ------------------------------------------------------------------ */

const TOK =
  /(--.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)')|(\b\d+(?:\.\d+)?\b)|\b(data|type|newtype|if|then|else|case|of|where|let|in|otherwise|deriving|class|instance)\b|(\b[A-Z][\w']*)|(::|->|<-|=>|\+\+|\b_\b|_|[=|\\:+*<>^.,()[\]{}-])/g;

const colorFor = (m: RegExpExecArray) =>
  m[1] ? C.comment
  : m[2] ? C.amber
  : m[3] ? C.orange
  : m[4] ? C.kw
  : m[5] ? C.lav
  : m[6] === "_" ? C.kw
  : m[6] ? C.op
  : C.mint;

export const highlight = (text: string, keyBase = "t"): React.ReactNode[] => {
  const out: React.ReactNode[] = [];
  let last = 0;
  TOK.lastIndex = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = TOK.exec(text))) {
    if (m.index > last) out.push(<span key={`${keyBase}${k++}`}>{text.slice(last, m.index)}</span>);
    out.push(
      <span key={`${keyBase}${k++}`} style={{ color: colorFor(m), fontStyle: m[1] ? "italic" : undefined }}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
    if (m[0].length === 0) TOK.lastIndex++;
  }
  if (last < text.length) out.push(<span key={`${keyBase}${k++}`}>{text.slice(last)}</span>);
  return out;
};

/* ------------------------------------------------------------------ *
 * Inline markers
 *   [[n|txt]]    highlight at step n
 *   [[+n|txt]]   grow in at step n
 *   [[-n|txt]]   strike out at step n
 *   [[.n|txt]]   dim at step n
 *   [[!n|txt]]   error (red, shake) appears at step n
 *   optional @d (delay frames) and ~d (highlight lasts d frames)
 *   e.g. [[2@15~20|Red]]
 * ------------------------------------------------------------------ */

const MARK = /\[\[([+\-.!]?)(\d+)(?:@(\d+))?(?:~(\d+))?\|(.*?)\]\]/g;

const Marker: React.FC<{ kind: string; step: number; delay: number; dur?: number; text: string }> = ({ kind, step, delay, dur, text }) => {
  const { s, t } = useSteps();
  const p = s(step, delay);
  if (kind === "+") {
    return (
      <span
        style={{
          display: "inline-block",
          verticalAlign: "top",
          overflow: "hidden",
          whiteSpace: "pre",
          maxWidth: `${text.length * p}ch`,
          opacity: p,
        }}
      >
        {highlight(text)}
      </span>
    );
  }
  if (kind === "-") {
    return (
      <span style={{ position: "relative", opacity: mix(1, 0.4, p) }}>
        {highlight(text)}
        <span
          style={{
            position: "absolute",
            left: 0,
            top: "52%",
            height: 4,
            borderRadius: 2,
            width: `${p * 100}%`,
            background: C.red,
          }}
        />
      </span>
    );
  }
  if (kind === ".") {
    return <span style={{ opacity: mix(1, 0.3, p) }}>{highlight(text)}</span>;
  }
  if (kind === "!") {
    const tt = Math.max(0, t(step, delay));
    const shake = Math.sin(tt * 1.5) * 10 * Math.max(0, 1 - tt / 20);
    return (
      <span style={{ display: "inline-block", color: C.red, opacity: p, transform: `translateX(${shake}px)` }}>{text}</span>
    );
  }
  const off = dur === undefined ? 0 : s(step, delay + dur);
  const lvl = Math.max(0, p - off);
  return (
    <span
      style={{
        borderRadius: 8,
        background: `rgba(141,118,220,${0.34 * lvl})`,
        boxShadow: `0 0 0 ${7 * lvl}px rgba(141,118,220,${0.34 * lvl})`,
        filter: lvl > 0.01 ? `brightness(${1 + 0.25 * lvl})` : undefined,
      }}
    >
      {highlight(text)}
    </span>
  );
};

const renderLine = (text: string, key: string) => {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  const re = new RegExp(MARK.source, "g");
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(...highlight(text.slice(last, m.index), `${key}p${k++}_`));
    parts.push(
      <Marker
        key={`${key}m${k++}`}
        kind={m[1]}
        step={+m[2]}
        delay={m[3] ? +m[3] : 0}
        dur={m[4] ? +m[4] : undefined}
        text={m[5]}
      />,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(...highlight(text.slice(last), `${key}e${k++}_`));
  return parts;
};

const dedent = (src: string) => {
  const lines = src.replace(/^\n+|\s+$/g, "").split("\n");
  const ind = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length));
  return lines.map((l) => l.slice(ind));
};

type Line = { text: string; step: number; delay: number };

export const parseCode = (code: string, step: number, delay: number, stagger: number): Line[] => {
  const counters: Record<number, number> = {};
  return dedent(code).map((raw) => {
    const m = raw.match(/^@(\d+)(?:\+(\d+))? ?/);
    const st = m ? +m[1] : step;
    const text = m ? raw.slice(m[0].length) : raw;
    const idx = (counters[st] = (counters[st] ?? -1) + 1);
    const base = st === step ? delay : 0;
    const d = m && m[2] !== undefined ? base + +m[2] : base + idx * stagger;
    return { text, step: st, delay: d };
  });
};

const CodeLine: React.FC<{ line: Line; lh: number; k: string }> = ({ line, lh, k }) => {
  const { s } = useSteps();
  const p = s(line.step, line.delay);
  return (
    <div
      style={{
        height: lh,
        whiteSpace: "pre",
        opacity: p,
        transform: `translateX(${(1 - p) * -24}px)`,
      }}
    >
      {line.text ? renderLine(line.text, k) : " "}
    </div>
  );
};

/**
 * Code block. Lines reveal at `step` staggered; a line prefixed with `@n` or `@n+d`
 * reveals at step n (with optional delay d).
 */
export const Code: React.FC<{
  code: string;
  x: number;
  y: number;
  step?: number;
  delay?: number;
  stagger?: number;
  size?: number;
  lh?: number;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ code, x, y, step = 0, delay = 0, stagger = 5, size = 44, lh, weight = 600, style }) => {
  const lines = parseCode(code, step, delay, stagger);
  const L = lh ?? Math.round(size * 1.45);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: F.mono,
        fontSize: size,
        fontWeight: weight,
        lineHeight: `${L}px`,
        color: C.mint,
        fontVariantLigatures: "none",
        ...style,
      }}
    >
      {lines.map((l, i) => (
        <CodeLine key={i} line={l} lh={L} k={`l${i}`} />
      ))}
    </div>
  );
};

/** Pixel x of a monospace column. */
export const colX = (x: number, col: number, size: number) => x + col * CH * size;
