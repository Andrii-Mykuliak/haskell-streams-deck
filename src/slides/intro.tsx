import React from "react";
import { C, F } from "../deck/theme";
import { mix, POP, SlideDef, useSteps } from "../deck/steps";
import { At, HaskellLogo, Slide } from "../deck/ui";
import { AuthorBlock } from "../deck/Author";
import { clamp01 } from "./common";

const TitleSlide: React.FC = () => {
  const { s } = useSteps();
  const lines = ["Потоки даних", "і композиція", "функційних програм"];
  const letters = (str: string, base: number) =>
    str.split("").map((ch, i) => {
      const p = s(0, base + i * 1.2);
      return (
        <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 60}px)`, whiteSpace: "pre" }}>
          {ch}
        </span>
      );
    });
  return (
    <Slide>
      <div style={{ position: "absolute", right: 60, top: 70 }}>
        <HaskellLogo size={680} p1={s(0, 4, POP)} p2={s(0, 12, POP)} p3={s(0, 22, POP)} />
      </div>
      <At x={116} y={190} step={0} delay={8} size={60} weight={800} color={C.pink}>
        Лекція 8
      </At>
      <div style={{ position: "absolute", left: 110, top: 300, fontFamily: F.head, fontWeight: 800, fontSize: 96, lineHeight: 1.12, color: C.text }}>
        {lines.map((l, i) => (
          <div key={i}>{letters(l, 14 + i * 13)}</div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 116,
          top: 666,
          height: 6,
          width: mix(0, 520, s(0, 58)),
          background: `linear-gradient(90deg, ${C.accent}, ${C.pink})`,
          borderRadius: 3,
        }}
      />
      <At x={116} y={706} step={0} delay={64} size={34} weight={400} color={C.dim} font={F.mono} style={{ fontVariantLigatures: "none" }}>
        {"readings & filter (> 0) & map (* 10) & sum"}
      </At>
      <AuthorBlock />
    </Slide>
  );
};

/* Epigraph: McIlroy's garden hose. Segments screw together into a pipeline, then readings flow through it:
   filter drops what does not pass, map transforms, sum collects. */
const HOSE_Y = 532;
const SEGS = [
  { x0: 330, x1: 720, label: "filter (> 0)", color: C.amber, at: 40 },
  { x0: 752, x1: 1142, label: "map (* 10)", color: C.lav, at: 58 },
  { x0: 1174, x1: 1564, label: "sum", color: C.mint, at: 76 },
];
const TAP = { x0: 130, x1: 298, at: 22 };
const BUCKET = { x: 1690, at: 94 };
const READINGS = [3, -2, 5, 0, 4];
const FLOW_AT = 118;
const GAP = 26;
const TRAVEL = 96;
const X_START = 220;
const X_END = 1600;
const FILTER_X = (SEGS[0].x0 + SEGS[0].x1) / 2;
const MAP_X = (SEGS[1].x0 + SEGS[1].x1) / 2;
const STOP_AT = FLOW_AT + (READINGS.length - 1) * GAP + TRAVEL + 30;

const Thread: React.FC<{ x: number; p: number; turn: number; color: string }> = ({ x, p, turn, color }) => (
  <g opacity={clamp01(p)}>
    <rect x={x - 11} y={HOSE_Y - 36} width={22} height={72} rx={6} fill={C.panel2} stroke={color} strokeWidth={2.5} />
    {[0, 1, 2].map((i) => {
      const y = HOSE_Y - 26 + ((i * 20 + turn * 20) % 60);
      return <line key={i} x1={x - 9} y1={y} x2={x + 9} y2={y + 8} stroke={color} strokeWidth={2} opacity={0.75} />;
    })}
  </g>
);

const Hose: React.FC = () => {
  const { s, lin, t } = useSteps();
  const f = t(0);
  const tap = s(0, TAP.at, POP);
  const bucket = s(0, BUCKET.at, POP);
  const arrivals = READINGS.map((v, k) => ({ v, k, at: FLOW_AT + k * GAP + TRAVEL })).filter((a) => a.v > 0 && f >= a.at);
  const total = arrivals.reduce((acc, a) => acc + a.v * 10, 0);
  const lastArrival = arrivals.length ? arrivals[arrivals.length - 1].at : -1;
  const bump = lastArrival < 0 ? 0 : 1 - lin(0, lastArrival, 14);
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <g opacity={clamp01(tap)} transform={`translate(0 ${(1 - tap) * 40})`}>
          <rect x={TAP.x0} y={HOSE_Y - 70} width={70} height={110} rx={12} fill={C.panel} stroke={C.dim} strokeWidth={2.5} />
          <rect x={TAP.x0 + 70} y={HOSE_Y - 22} width={TAP.x1 - TAP.x0 - 70} height={44} rx={8} fill={C.panel} stroke={C.dim} strokeWidth={2.5} />
          <circle cx={TAP.x0 + 35} cy={HOSE_Y - 92} r={14} fill="none" stroke={C.dim} strokeWidth={3} />
          <line x1={TAP.x0 + 35} y1={HOSE_Y - 78} x2={TAP.x0 + 35} y2={HOSE_Y - 70} stroke={C.dim} strokeWidth={3} />
        </g>
        {SEGS.map((sg, i) => {
          const p = s(0, sg.at, POP);
          const turn = lin(0, sg.at + 4, 16);
          return (
            <g key={i}>
              <g opacity={clamp01(p)} transform={`translate(0 ${(1 - p) * 60})`}>
                <rect x={sg.x0} y={HOSE_Y - 26} width={sg.x1 - sg.x0} height={52} rx={26} fill={C.panel} stroke={sg.color} strokeWidth={3} />
                <rect x={sg.x0 + 20} y={HOSE_Y - 18} width={sg.x1 - sg.x0 - 40} height={8} rx={4} fill={sg.color} opacity={0.12} />
                {i === 0 && <path d={`M ${FILTER_X - 30} ${HOSE_Y + 26} L ${FILTER_X - 18} ${HOSE_Y + 40} L ${FILTER_X + 18} ${HOSE_Y + 40} L ${FILTER_X + 30} ${HOSE_Y + 26}`} fill={C.panel} stroke={sg.color} strokeWidth={2.5} />}
              </g>
              <Thread x={sg.x0 - 16} p={p} turn={turn} color={sg.color} />
            </g>
          );
        })}
        <Thread x={SEGS[2].x1 + 16} p={bucket} turn={lin(0, BUCKET.at + 4, 16)} color={C.mint} />
        <g opacity={clamp01(bucket)} transform={`translate(0 ${(1 - bucket) * 40})`}>
          <path d={`M ${BUCKET.x - 92} ${HOSE_Y - 20} L ${BUCKET.x + 92} ${HOSE_Y - 20} L ${BUCKET.x + 72} ${HOSE_Y + 120} L ${BUCKET.x - 72} ${HOSE_Y + 120} Z`} fill={C.panel} stroke={C.mint} strokeWidth={3} strokeLinejoin="round" />
          <rect x={BUCKET.x - 72} y={HOSE_Y + 120 - Math.min(110, total * 0.8)} width={144} height={Math.min(110, total * 0.8)} fill={C.mint} opacity={0.14} />
        </g>
        {READINGS.map((v, k) => {
          const start = FLOW_AT + k * GAP;
          const p = lin(0, start, TRAVEL);
          if (p <= 0) {
            return null;
          }
          const x = X_START + (X_END - X_START) * p;
          const blocked = v <= 0;
          if (!blocked && p >= 1) {
            return null;
          }
          const atFilter = (FILTER_X - X_START) / (X_END - X_START);
          const fall = blocked ? clamp01((p - atFilter) / 0.18) : 0;
          if (blocked && fall >= 1) {
            return null;
          }
          const mapped = !blocked && x >= MAP_X;
          const label = mapped ? v * 10 : v;
          const cx = blocked && p > atFilter ? FILTER_X : x;
          const cy = HOSE_Y + fall * 120;
          const color = blocked && fall > 0 ? C.red : mapped ? C.mint : C.lav;
          const pop = mapped ? 1 + 0.25 * (1 - clamp01((x - MAP_X) / 60)) : 1;
          return (
            <g key={k} opacity={1 - fall} transform={`translate(${cx} ${cy}) scale(${pop})`}>
              <circle r={21} fill={C.bg} stroke={color} strokeWidth={3} />
              <circle r={21} fill={color} opacity={0.18} />
              <text y={9} textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize={label >= 10 || label < 0 ? 19 : 24} fill={color}>
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      <At x={TAP.x0 - 4} y={HOSE_Y - 160} step={0} delay={TAP.at + 4} size={26} weight={700} color={C.dim} font={F.mono}>
        readings
      </At>
      {SEGS.map((sg, i) => (
        <At key={i} x={sg.x0} w={sg.x1 - sg.x0} y={HOSE_Y - 84} step={0} delay={sg.at + 6} size={28} weight={700} color={sg.color} font={F.mono} align="center" style={{ fontVariantLigatures: "none" }}>
          {sg.label}
        </At>
      ))}
      <div
        style={{
          position: "absolute",
          left: BUCKET.x - 90,
          width: 180,
          top: HOSE_Y + 30,
          textAlign: "center",
          fontFamily: F.mono,
          fontWeight: 700,
          fontSize: 44,
          color: C.mint,
          opacity: clamp01(s(0, BUCKET.at + 8)),
          transform: `scale(${1 + 0.18 * bump})`,
        }}
      >
        {total}
      </div>
    </>
  );
};

const QuoteSlide: React.FC = () => {
  const { s } = useSteps();
  const words = (str: string, base: number, color?: string) =>
    str.split(" ").map((w, i) => {
      const p = s(0, base + i * 3.5, POP);
      return (
        <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 40}px)`, color }}>
          {w + " "}
        </span>
      );
    });
  return (
    <Slide>
      <Hose />
      <div style={{ position: "absolute", left: 110, top: 96, width: 1720, fontFamily: F.head, fontWeight: 800, fontSize: 56, lineHeight: 1.22, color: C.text }}>
        <div>{words("We should have some ways of connecting programs", 6)}</div>
        <div>
          {words("like", 40)}
          {words("garden hose", 44, C.accentHi)}
          {words("– screw in another segment when it", 52)}
        </div>
        <div>{words("becomes necessary to massage data in another way.", 78)}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 116,
          top: 724,
          height: 6,
          width: mix(0, 420, s(1, 0)),
          background: `linear-gradient(90deg, ${C.accent}, ${C.pink})`,
          borderRadius: 3,
        }}
      />
      <At x={110} y={752} w={1700} step={1} delay={6} size={42} weight={600} color={C.text}>
        Нам потрібні способи з’єднувати програми, як садовий шланг: прикручувати ще один відрізок, коли дані треба обробити по-іншому.
      </At>
      <At x={110} y={892} step={1} delay={24} size={34} weight={400} color={C.dim} font={F.mono}>
        Doug McIlroy
      </At>
      <At x={110} y={942} w={1600} step={1} delay={36} size={30} weight={400} color={C.dim}>
        внутрішня записка Bell Labs, 11 жовтня 1964
      </At>
    </Slide>
  );
};

const AGENDA = [
  "Потоки даних як спосіб організації обчислень",
  "Моделі представлення потоків і графи потоків даних",
  "Засоби формування та перетворення потоків у Haskell",
  "Згортки та накопичувальні обчислення",
  "Функційні конвеєри, ефекти й цілісна програма",
];

const Agenda: React.FC<{ active?: number }> = ({ active }) => {
  const { s } = useSteps();
  const full = active === undefined;
  const Y0 = 230;
  const GAP = 126;
  const hl = full ? 0 : s(0, 6);
  return (
    <Slide title="План">
      {AGENDA.map((item, i) => {
        const p = full ? s(0, 8 + i * 5, POP) : 1;
        const on = full ? 1 : i === active ? s(0, 10) : 0;
        const dim = full ? 1 : i === active ? 1 : 0.35;
        const isActive = !full && i === active;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 84,
              top: Y0 + i * GAP,
              display: "flex",
              alignItems: "center",
              gap: 34,
              padding: "12px 34px 12px 20px",
              opacity: p * dim,
              transform: `translateX(${(1 - p) * -40}px)`,
            }}
          >
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 14,
                  background: "rgba(141,118,220,0.13)",
                  border: `2px solid rgba(141,118,220,${0.5 * hl})`,
                  clipPath: `inset(0 ${(1 - hl) * 100}% 0 0 round 14px)`,
                }}
              />
            )}
            <div
              style={{
                position: "relative",
                width: 76,
                height: 64,
                borderRadius: 8,
                background: i % 2 ? "#5e5086" : C.pink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: F.body,
                fontWeight: 800,
                fontSize: 40,
                color: C.text,
                flexShrink: 0,
                boxShadow: on ? `0 0 ${30 * on}px rgba(178,95,168,${0.6 * on})` : undefined,
                transform: `scale(${1 + 0.12 * on})`,
              }}
            >
              {i + 1}
            </div>
            <div style={{ position: "relative", fontFamily: F.body, fontSize: 48, fontWeight: on ? 700 : 400, color: C.text, whiteSpace: "nowrap" }}>
              {item}
            </div>
          </div>
        );
      })}
    </Slide>
  );
};

export const introSlides: SlideDef[] = [
  { id: "title", title: "Титул", steps: [110], C: TitleSlide },
  { id: "quote", title: "Епіграф", steps: [STOP_AT + 30, 120], C: QuoteSlide },
  { id: "agenda", title: "План", steps: [60], C: () => <Agenda /> },
];

export const agendaSlide = (active: number): SlideDef => ({
  id: `agenda-${active + 1}`,
  title: `План ${active + 1}`,
  steps: [40],
  C: () => <Agenda active={active} />,
});
