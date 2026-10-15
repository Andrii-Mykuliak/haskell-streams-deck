import React from "react";
import { C, F } from "../deck/theme";
import { POP, SlideDef, useSteps } from "../deck/steps";
import { Code } from "../deck/Code";
import { A, At, Lead, M, Mark, Slide } from "../deck/ui";
import { clamp01 } from "./common";

type Box = { x: number; y: number; w: number; h: number };

const appear = (p: number): React.CSSProperties => ({ opacity: clamp01(p), transform: `translateY(${(1 - p) * 20}px)` });

const Entity: React.FC<{ b: Box; p: number; children: React.ReactNode }> = ({ b, p, children }) => (
  <div style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, ...appear(p) }}>
    <div style={{ position: "absolute", left: 8, top: 8, right: -8, bottom: -8, border: `2px solid ${C.lav}`, borderRadius: 4, opacity: 0.5 }} />
    <div
      style={{
        position: "absolute",
        inset: 0,
        border: `3px solid ${C.lav}`,
        borderRadius: 4,
        background: C.panel,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: F.body,
        fontWeight: 700,
        fontSize: 28,
        color: C.text,
        lineHeight: 1.2,
        padding: "0 12px",
      }}
    >
      {children}
    </div>
  </div>
);

const Process: React.FC<{ b: Box; p: number; n: number; children: React.ReactNode }> = ({ b, p, n, children }) => (
  <div
    style={{
      position: "absolute",
      left: b.x,
      top: b.y,
      width: b.w,
      height: b.h,
      border: `3px solid ${C.amber}`,
      borderRadius: 24,
      background: C.panel,
      overflow: "hidden",
      boxSizing: "border-box",
      ...appear(p),
    }}
  >
    <div style={{ height: 38, borderBottom: `2px solid ${C.amber}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontWeight: 700, fontSize: 24, color: C.amber }}>
      {n}
    </div>
    <div style={{ height: b.h - 44, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: F.body, fontWeight: 700, fontSize: 27, color: C.text, lineHeight: 1.2, padding: "0 10px" }}>
      {children}
    </div>
  </div>
);

const Store: React.FC<{ b: Box; p: number; id: string; children: React.ReactNode }> = ({ b, p, id, children }) => (
  <div style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, ...appear(p) }}>
    <svg width={b.w} height={b.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <path d={`M ${b.w} 1.5 L 1.5 1.5 L 1.5 ${b.h - 1.5} L ${b.w} ${b.h - 1.5} M 70 1.5 L 70 ${b.h - 1.5}`} fill="none" stroke={C.mint} strokeWidth={3} />
    </svg>
    <div style={{ position: "absolute", left: 0, width: 70, top: 0, height: b.h, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontWeight: 700, fontSize: 24, color: C.mint }}>
      {id}
    </div>
    <div style={{ position: "absolute", left: 86, top: 0, height: b.h, display: "flex", alignItems: "center", fontFamily: F.body, fontWeight: 700, fontSize: 27, color: C.text, whiteSpace: "nowrap" }}>
      {children}
    </div>
  </div>
);

/** A named DFD flow: the line draws itself, then small packets run along it. */
const FlowLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; step: number; delay?: number; label?: string; lx?: number; ly?: number }> = ({
  x1,
  y1,
  x2,
  y2,
  step,
  delay = 0,
  label,
  lx,
  ly,
}) => {
  const { lin, t } = useSteps();
  const k = lin(step, delay, 14);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const head = 16;
  const run = Math.max(0, t(step, delay + 14));
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * k} y2={y1 + (y2 - y1) * k} stroke={C.dim} strokeWidth={3} />
        <polygon
          points={`${x2},${y2} ${x2 - head * Math.cos(ang - 0.45)},${y2 - head * Math.sin(ang - 0.45)} ${x2 - head * Math.cos(ang + 0.45)},${y2 - head * Math.sin(ang + 0.45)}`}
          fill={C.dim}
          opacity={k >= 1 ? 1 : 0}
        />
        {k >= 1 &&
          [0, 0.5].map((o) => {
            const q = ((run / 40 + o) % 1 + 1) % 1;
            return <circle key={o} cx={x1 + (x2 - x1) * q} cy={y1 + (y2 - y1) * q} r={5} fill={C.amber} opacity={0.9} />;
          })}
      </svg>
      {label && (
        <div
          style={{
            position: "absolute",
            left: lx ?? (x1 + x2) / 2 - 100,
            top: ly ?? Math.min(y1, y2) - 46,
            width: 200,
            textAlign: "center",
            fontFamily: F.body,
            fontStyle: "italic",
            fontSize: 24,
            fontWeight: 600,
            color: C.dim,
            opacity: k,
          }}
        >
          {label}
        </div>
      )}
    </>
  );
};

/* 6 · Data Flow Diagram (DFD) */
const S6: React.FC = () => {
  const { s } = useSteps();
  const cols = [330, 780, 1230, 1680];
  const Y = 420;
  const cap = (i: number, title: string, desc: string) => (
    <>
      <At x={cols[i] - 200} w={400} y={Y + 170} step={1} delay={10 + i * 12} size={32} weight={800} align="center">
        {title}
      </At>
      <At x={cols[i] - 200} w={400} y={Y + 216} step={1} delay={14 + i * 12} size={26} weight={400} color={C.dim} align="center">
        {desc}
      </At>
    </>
  );
  return (
    <Slide title="Data Flow Diagram (DFD)">
      <Lead>
        <A>DFD</A> – структурна модель руху інформації між зовнішніми сутностями, процесами та сховищами даних.
      </Lead>
      <Entity b={{ x: cols[0] - 120, y: Y, w: 240, h: 110 }} p={s(1, 4, POP)}>
        Пристрій
      </Entity>
      {cap(0, "Зовнішня сутність", "джерело або одержувач")}
      <Process b={{ x: cols[1] - 120, y: Y - 10, w: 240, h: 130 }} p={s(1, 16, POP)} n={1}>
        Перевірка
      </Process>
      {cap(1, "Процес", "перетворення інформації")}
      <Store b={{ x: cols[2] - 140, y: Y + 25, w: 280, h: 62 }} p={s(1, 28, POP)} id="D1">
        Журнал
      </Store>
      {cap(2, "Сховище", "збереження даних")}
      <FlowLine x1={cols[3] - 120} y1={Y + 56} x2={cols[3] + 120} y2={Y + 56} step={1} delay={40} label="дані" />
      {cap(3, "Потік", "передавання інформації")}
      <At x={96} y={880} w={1720} step={2} size={32} weight={600}>
        Кожний потік має назву: вона каже, <A>що саме</A> передається, а не як і коли.
      </At>
    </Slide>
  );
};

/* 7 · DFD: система опрацювання показників */
const S7: React.FC = () => {
  const { s } = useSteps();
  const Y = 410;
  const H = 130;
  const MID = Y + H / 2;
  const E1 = { x: 100, y: Y + 10, w: 250, h: 110 };
  const P1 = { x: 560, y: Y, w: 300, h: H };
  const P2 = { x: 1080, y: Y, w: 300, h: H };
  const E2 = { x: 1600, y: Y + 10, w: 220, h: 110 };
  const D1 = { x: 560, y: 700, w: 400, h: 64 };
  return (
    <Slide title="DFD: система опрацювання показників">
      <Entity b={E1} p={s(1, 0, POP)}>
        Пристрій збору
      </Entity>
      <Process b={P1} p={s(1, 8, POP)} n={1}>
        Перевірка показників
      </Process>
      <Process b={P2} p={s(1, 16, POP)} n={2}>
        Формування підсумку
      </Process>
      <Entity b={E2} p={s(1, 24, POP)}>
        Аналітик
      </Entity>
      <Store b={D1} p={s(1, 32, POP)} id="D1">
        Журнал показників
      </Store>
      <FlowLine x1={E1.x + E1.w + 14} y1={MID} x2={P1.x - 8} y2={MID} step={2} label="Сирі дані" />
      <FlowLine x1={P1.x + P1.w + 8} y1={MID} x2={P2.x - 8} y2={MID} step={2} delay={14} label="Перевірені дані" />
      <FlowLine x1={P2.x + P2.w + 8} y1={MID} x2={E2.x - 8} y2={MID} step={2} delay={28} label="Підсумок" />
      <FlowLine x1={P1.x + 150} y1={Y + H + 8} x2={P1.x + 150} y2={D1.y - 8} step={2} delay={42} label="Записи" lx={P1.x + 170} ly={Y + H + 50} />
      <At x={96} y={880} w={1720} step={3} size={32} weight={600}>
        Стрілки DFD описують <A>передавання інформації</A>, а не команди чи керування виконанням.
      </At>
    </Slide>
  );
};

/* 8 · DFD і граф обчислень */
const MiniDfd: React.FC = () => (
  <svg width={300} height={90} viewBox="0 0 300 90">
    <rect x={4} y={28} width={70} height={36} fill="none" stroke={C.lav} strokeWidth={3} />
    <line x1={78} y1={46} x2={110} y2={46} stroke={C.dim} strokeWidth={3} />
    <rect x={114} y={22} width={74} height={48} rx={14} fill="none" stroke={C.amber} strokeWidth={3} />
    <line x1={192} y1={46} x2={222} y2={46} stroke={C.dim} strokeWidth={3} />
    <path d="M 296 30 L 226 30 L 226 62 L 296 62" fill="none" stroke={C.mint} strokeWidth={3} />
  </svg>
);

const MiniGraph: React.FC = () => (
  <svg width={300} height={90} viewBox="0 0 300 90">
    {[
      [20, 20, 120, 45],
      [20, 70, 120, 45],
      [120, 45, 220, 45],
      [220, 45, 285, 20],
      [220, 45, 285, 70],
    ].map(([a, b, c, d], i) => (
      <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={C.dim} strokeWidth={2.5} />
    ))}
    {[
      [20, 20],
      [20, 70],
      [120, 45],
      [220, 45],
      [285, 20],
      [285, 70],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={10} fill={C.panel} stroke={C.accentHi} strokeWidth={3} />
    ))}
  </svg>
);

const S8: React.FC = () => {
  const { s } = useSteps();
  const card = (x: number, step: number, title: string, color: string, icon: React.ReactNode, qs: string[]) => {
    const p = s(step, 0, POP);
    return (
      <div
        style={{
          position: "absolute",
          left: x,
          top: 330,
          width: 820,
          height: 360,
          borderRadius: 18,
          border: `3px solid ${color}`,
          background: C.panel,
          boxSizing: "border-box",
          padding: "30px 36px",
          ...appear(p),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 40, color }}>{title}</div>
          {icon}
        </div>
        {qs.map((q, i) => (
          <div key={q} style={{ marginTop: i ? 22 : 48, fontFamily: F.body, fontSize: 36, fontWeight: 600, color: C.text, opacity: clamp01(s(step, 14 + i * 10)) }}>
            {q}
          </div>
        ))}
      </div>
    );
  };
  return (
    <Slide title="DFD і граф обчислень">
      <Lead>Різні моделі відповідають на різні запитання.</Lead>
      {card(96, 1, "DFD", C.lav, <MiniDfd />, ["Звідки надходить інформація?", "Де її обробляють і зберігають?"])}
      {card(1004, 2, "Граф обчислень", C.accentHi, <MiniGraph />, ["Які функції формують результат?", "Які дані потрібні кожній операції?"])}
      <At x={96} y={860} w={1720} step={3} size={32} weight={600}>
        Ні DFD, ні граф залежностей самі по собі <A>не задають графіка виконання</A> операцій.
      </At>
    </Slide>
  );
};

/* 9 · Граф потокових обчислень */
const NODES = [
  { name: "Джерело", type: "[Int]", color: C.lav },
  { name: "filter (> 0)", type: "[Int] -> [Int]", color: C.amber },
  { name: "map (* 10)", type: "[Int] -> [Int]", color: C.amber },
  { name: "foldr (+) 0", type: "[Int] -> Int", color: C.amber },
  { name: "Результат", type: "Int", color: C.mint },
];
const EDGE_TYPES = ["[Int]", "[Int]", "[Int]", "Int"];

const S9: React.FC = () => {
  const { s, t } = useSteps();
  const X0 = 96;
  const NW = 280;
  const GAP = 80;
  const Y = 380;
  const NH = 100;
  const x = (i: number) => X0 + i * (NW + GAP);
  const run = Math.max(0, t(2, 0));
  return (
    <Slide title="Граф потокових обчислень">
      <Lead>
        <A>Вершини</A> – операції над даними; <A>ребра</A> – залежності між результатами та входами.
      </Lead>
      {NODES.map((n, i) => {
        const p = s(1, i * 8, POP);
        return (
          <div
            key={n.name}
            style={{
              position: "absolute",
              left: x(i),
              top: Y,
              width: NW,
              height: NH,
              borderRadius: 50,
              border: `3px solid ${n.color}`,
              background: C.panel,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
              ...appear(p),
            }}
          >
            <div style={{ fontFamily: i === 0 || i === 4 ? F.body : F.mono, fontWeight: 700, fontSize: i === 0 || i === 4 ? 30 : 28, color: C.text, fontVariantLigatures: "none" }}>{n.name}</div>
            <div style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 20, color: C.dim, marginTop: 4, fontVariantLigatures: "none" }}>{n.type}</div>
          </div>
        );
      })}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {EDGE_TYPES.map((_, i) => {
          const x1 = x(i) + NW + 8;
          const x2 = x(i + 1) - 8;
          const y = Y + NH / 2;
          const k = clamp01(s(1, 34 + i * 6));
          return (
            <g key={i}>
              <line x1={x1} y1={y} x2={x1 + (x2 - x1 - 10) * k} y2={y} stroke={C.dim} strokeWidth={3} />
              <polygon points={`${x2},${y} ${x2 - 14},${y - 8} ${x2 - 14},${y + 8}`} fill={C.dim} opacity={k > 0.95 ? 1 : 0} />
              {run > 0 && <circle cx={x1 + (x2 - x1) * ((run / 30 + i * 0.25) % 1)} cy={y} r={6} fill={C.amber} />}
            </g>
          );
        })}
      </svg>
      {EDGE_TYPES.map((ty, i) => (
        <At key={i} x={x(i) + NW - 20} w={GAP + 40} y={Y + NH + 14} step={2} delay={i * 6} size={22} weight={700} color={C.amber} font={F.mono} align="center" style={{ fontVariantLigatures: "none" }}>
          {ty}
        </At>
      ))}
      <Code x={96} y={640} size={34} step={3} code={`map (* 10) (sum xs)    [[!3@20|-- помилка: sum xs :: Int, а не список]]`} />
      <Mark ok={false} x={1500} y={636} step={3} delay={24} size={48} />
      <At x={96} y={820} w={1720} step={4} size={32} weight={600}>
        <A>Сумісність типів</A> з’єднаних функцій забезпечує узгодженість логічного конвеєра: вихід одного кроку – вхід наступного.
      </At>
      <At x={96} y={930} w={1720} step={4} delay={14} size={26} weight={400} color={C.dim}>
        Тут <M c={C.dim}>sum xs</M> уже згорнуто до числа, тож <M c={C.dim}>map</M> немає до чого застосовувати.
      </At>
    </Slide>
  );
};

export const p2Slides: SlideDef[] = [
  { id: "dfd", title: "Data Flow Diagram", steps: [45, 90, 55], C: S6 },
  { id: "dfd-example", title: "DFD: приклад", steps: [20, 60, 110, 55], C: S7 },
  { id: "dfd-vs-graph", title: "DFD і граф обчислень", steps: [30, 60, 60, 55], C: S8 },
  { id: "flow-graph", title: "Граф потокових обчислень", steps: [45, 70, 70, 80, 70], C: S9 },
];
