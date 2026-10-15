import React from "react";
import { C, F } from "./theme";
import { clamp01, POP, useSteps } from "./steps";
import { LPNU_CIRCLES, LPNU_PATHS, LPNU_VIEWBOX } from "./lpnuLogo";

export const LpnuLogo: React.FC<{ height: number; color?: string }> = ({ height, color = C.lav }) => {
  const [, , vw, vh] = LPNU_VIEWBOX.split(" ").map(Number);
  return (
    <svg width={(height * vw) / vh} height={height} viewBox={LPNU_VIEWBOX} fill={color} role="img" aria-label="Логотип Національного університету «Львівська політехніка»">
      {LPNU_PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
      {LPNU_CIRCLES.map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} transform={c.transform} />
      ))}
    </svg>
  );
};

/** University logo and author credit for the bottom-right corner of a title slide. */
export const AuthorBlock: React.FC<{ delay?: number }> = ({ delay = 60 }) => {
  const { s } = useSteps();
  const logo = s(0, delay, POP);
  const text = s(0, delay + 12);
  return (
    <div style={{ position: "absolute", left: 1236, top: 712, display: "flex", alignItems: "center", gap: 38 }}>
      <div style={{ opacity: clamp01(logo), transform: `scale(${0.8 + 0.2 * logo})` }}>
        <LpnuLogo height={196} color="#6f639c" />
      </div>
      <div style={{ fontFamily: F.body, color: C.text, opacity: clamp01(text), transform: `translateX(${(1 - text) * 24}px)` }}>
        <div style={{ fontSize: 26, color: C.dim }}>Підготував</div>
        <div style={{ marginTop: 10, fontSize: 32, fontWeight: 600 }}>ас. каф. ПЗ</div>
        <div style={{ marginTop: 4, fontSize: 40, fontWeight: 800 }}>Микуляк Андрій</div>
        <div style={{ marginTop: 8, fontSize: 24, color: C.dim }}>2026</div>
      </div>
    </div>
  );
};
