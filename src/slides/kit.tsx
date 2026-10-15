import React from "react";
import { C, F } from "../deck/theme";
import { POP, useSteps } from "../deck/steps";
import { clamp01 } from "./common";

const KW = /\b(class|instance|where|data|deriving|do|let|in|type|newtype|if|then|else|case|of)\b/;
const OP = /(::|->|<-|=>|>>=|>>|<\$>|<\*>|<>|\+\+|\||=|\.\.\.|…)/;

const renderPlain = (text: string, key: string) =>
  text
    .split(new RegExp(`${KW.source}|${OP.source}`))
    .filter((p) => p !== undefined && p !== "")
    .map((p, i) => (
      <span key={`${key}-${i}`} style={{ color: KW.test(p) && /^[a-z]+$/.test(p) ? C.kw : OP.test(p) && !/[A-Za-z]/.test(p) ? C.op : C.text }}>
        {p}
      </span>
    ));

/** One template line: `{Name}` marks a metavariable, `--` starts a comment. */
export const TemplateLine: React.FC<{ line: string }> = ({ line }) => {
  const cut = line.indexOf("--");
  const code = cut < 0 ? line : line.slice(0, cut);
  const note = cut < 0 ? "" : line.slice(cut);
  const parts = (text: string, comment: boolean, key: string) =>
    text.split(/(\{[^}]+\})/).map((part, i) =>
      part.startsWith("{") ? (
        <span key={`${key}${i}`} style={{ color: C.amber, fontStyle: "italic" }}>
          {part.slice(1, -1)}
        </span>
      ) : comment ? (
        <span key={`${key}${i}`} style={{ color: C.comment, fontStyle: "italic" }}>
          {part}
        </span>
      ) : (
        <React.Fragment key={`${key}${i}`}>{renderPlain(part, `${key}${i}`)}</React.Fragment>
      ),
    );
  return (
    <div style={{ whiteSpace: "pre", minHeight: "1.4em" }}>
      {parts(code, false, "c")}
      {parts(note, true, "n")}
    </div>
  );
};

/** General syntax of a construct, shown before its concrete example. */
export const SyntaxBox: React.FC<{
  x: number;
  y: number;
  w?: number;
  step: number;
  delay?: number;
  lines: string[];
  size?: number;
  title?: string;
}> = ({ x, y, w, step, delay = 0, lines, size = 30, title = "Загальний синтаксис" }) => {
  const { s } = useSteps();
  const p = s(step, delay, POP);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        padding: "16px 26px 18px",
        borderRadius: 16,
        border: `2px dashed ${C.amber}`,
        background: "rgba(242,193,125,0.06)",
        boxSizing: "border-box",
        opacity: clamp01(p),
        transform: `translateY(${(1 - p) * 20}px)`,
      }}
    >
      <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 20, letterSpacing: 1, color: C.amber, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: F.mono, fontWeight: 600, fontSize: size, lineHeight: 1.4, fontVariantLigatures: "none" }}>
        {lines.map((l, i) => (
          <TemplateLine key={i} line={l} />
        ))}
      </div>
    </div>
  );
};

/** A plain value chip. */
export const Val: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = C.mint, size = 30 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: size * 1.4,
      height: size * 1.6,
      padding: "0 10px",
      borderRadius: 10,
      border: `2px solid ${color}`,
      background: `${color}1f`,
      color,
      fontFamily: F.mono,
      fontWeight: 700,
      fontSize: size,
      boxSizing: "border-box",
      whiteSpace: "pre",
    }}
  >
    {children}
  </span>
);

/** A context around values, e.g. `Just 5`; dashed when it carries no value (`Nothing`). */
export const Ctx: React.FC<{ label: string; color?: string; empty?: boolean; children?: React.ReactNode; size?: number; glow?: number }> = ({
  label,
  color = C.accentHi,
  empty,
  children,
  size = 26,
  glow = 0,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: "8px 14px",
      borderRadius: 16,
      border: `3px ${empty ? "dashed" : "solid"} ${color}`,
      background: `${color}14`,
      boxShadow: glow > 0.02 ? `0 0 ${24 * glow}px ${color}` : undefined,
      boxSizing: "border-box",
      whiteSpace: "nowrap",
    }}
  >
    <span style={{ fontFamily: F.mono, fontWeight: 700, fontSize: size, color }}>{label}</span>
    {children}
  </span>
);

/** Absolutely placed block that pops in at (step, delay). */
export const Pop: React.FC<{ x: number; y: number; step: number; delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  x,
  y,
  step,
  delay = 0,
  children,
  style,
}) => {
  const { s } = useSteps();
  const p = s(step, delay, POP);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: clamp01(p), transform: `scale(${0.75 + 0.25 * p})`, transformOrigin: "left center", ...style }}>
      {children}
    </div>
  );
};

/** Small caption used as a column header. */
export const Caption: React.FC<{ x: number; y: number; step: number; delay?: number; color?: string; children: React.ReactNode }> = ({
  x,
  y,
  step,
  delay = 0,
  color = C.dim,
  children,
}) => {
  const { s } = useSteps();
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: F.body, fontWeight: 800, fontSize: 26, color, opacity: clamp01(s(step, delay)) }}>
      {children}
    </div>
  );
};

/** `at` = [step, delay] overrides when this item's arrow starts drawing. */
export type FlowItem = { el: React.ReactNode; via?: string; skip?: boolean; at?: [number, number] };

/** A horizontal arrow that draws itself, with an optional label above. */
export const FlowArrow: React.FC<{ p: number; label?: string; w: number; skip?: boolean }> = ({ p, label, w, skip }) => {
  const color = skip ? C.faint : C.dim;
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", width: w, margin: "0 10px", flexShrink: 0 }}>
      <span
        style={{
          fontFamily: F.mono,
          fontWeight: 700,
          fontSize: 22,
          color: skip ? C.faint : C.amber,
          textDecoration: skip ? "line-through" : undefined,
          whiteSpace: "nowrap",
          fontVariantLigatures: "none",
          height: 30,
          opacity: clamp01(p),
        }}
      >
        {label ?? ""}
      </span>
      <span style={{ position: "relative", width: "100%", height: 12 }}>
        <span
          style={{
            position: "absolute",
            left: 0,
            top: 4,
            height: 3,
            width: `${clamp01(p) * 100}%`,
            borderRadius: 2,
            background: skip ? `repeating-linear-gradient(90deg, ${color} 0 8px, transparent 8px 14px)` : color,
          }}
        />
        <span
          style={{
            position: "absolute",
            right: -2,
            top: -1,
            width: 0,
            height: 0,
            borderTop: "7px solid transparent",
            borderBottom: "7px solid transparent",
            borderLeft: `12px solid ${color}`,
            opacity: clamp01(p * 3 - 2),
          }}
        />
      </span>
      <span style={{ height: 30 }} />
    </span>
  );
};

/** A left-to-right chain of values joined by labelled arrows; each element pops in after its arrow. */
export const Flow: React.FC<{ x: number; y: number; step: number; delay?: number; gap?: number; arrowW?: number; items: FlowItem[] }> = ({
  x,
  y,
  step,
  delay = 0,
  gap = 18,
  arrowW = 150,
  items,
}) => {
  const { s, lin } = useSteps();
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center" }}>
      {items.map((it, i) => {
        const [st, from] = it.at ?? [step, delay + i * gap - gap * 0.6];
        const pe = s(st, from + gap * 0.6, POP);
        return (
          <React.Fragment key={i}>
            {i > 0 && <FlowArrow p={lin(st, from, gap * 0.6)} label={it.via} w={arrowW} skip={it.skip} />}
            <span style={{ display: "inline-flex", opacity: clamp01(pe), transform: `scale(${0.8 + 0.2 * pe})`, flexShrink: 0 }}>{it.el}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** Inline text in the dim secondary colour, monospace. */
export const Dim: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 26 }) => (
  <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: size, color: C.dim, whiteSpace: "pre" }}>{children}</span>
);
