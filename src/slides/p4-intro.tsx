import React from "react";
import { C, F } from "../deck/theme";
import { mix, POP, SlideDef, useSteps } from "../deck/steps";
import { Code } from "../deck/Code";
import { A, At, Lead, M, Slide } from "../deck/ui";
import { Cell, clamp01, pulse } from "./common";

/* Згортка: потік → одне значення */
const XS = [3, 5, 2];
const ACC = [0, 3, 8, 10];
const FLY = 18;
const GAP = 46;
const T0 = 20;

const TASKS = [
  { task: "сума", z: "0", f: "acc + x", res: "10" },
  { task: "добуток", z: "1", f: "acc * x", res: "30" },
  { task: "кількість", z: "0", f: "acc + 1", res: "3" },
  { task: "є від’ємні?", z: "False", f: "acc || x < 0", res: "False" },
];

const FoldIdea: React.FC = () => {
  const { s, t } = useSteps();
  const LX = 130;
  const LP = 110;
  const W = 84;
  const H = 68;
  const Y = 470;
  const NX = 600;
  const NY = Y + H / 2;
  const R = 50;
  const AX = 760;
  const arriveAt = (i: number) => T0 + i * GAP;
  const arrived = XS.filter((_, i) => t(1, arriveAt(i)) >= FLY).length;
  const bump = arrived > 0 ? s(1, arriveAt(arrived - 1) + FLY, POP) : s(1, 0, POP);
  const nodeGlow = Math.max(...XS.map((_, i) => pulse(t(1, arriveAt(i)), FLY, 12)));
  const cols = [1000, 1240, 1400, 1700];
  const head = ["Задача", "Початкове", "Крок", "[3,5,2]"];
  return (
    <Slide title="Згортка: потік → одне значення">
      <Lead>Багато задач зводять увесь потік до одного значення: суму, добуток, кількість, перевірку умови.</Lead>

      <At x={LX} y={Y - 50} step={1} size={24} weight={700} color={C.lav}>
        потік
      </At>
      {XS.map((v, i) => {
        const fly = clamp01(t(1, arriveAt(i)) / FLY);
        const e = fly * fly * (3 - 2 * fly);
        const x0 = LX + i * LP;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: x0,
                top: Y,
                width: W,
                height: H,
                borderRadius: 12,
                border: `2px dashed ${C.faint}`,
                boxSizing: "border-box",
                opacity: clamp01(s(1, 0)) * 0.6,
              }}
            />
            {fly < 1 && (
              <Cell
                x={mix(x0, NX - W / 2, e)}
                y={mix(Y, NY - H / 2, e) - Math.sin(Math.PI * e) * 60}
                w={W}
                h={H}
                label={v}
                appear={s(1, 4 + i * 4, POP)}
                color={C.lav}
                size={32}
              />
            )}
          </React.Fragment>
        );
      })}

      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: clamp01(s(1, 6)) }}>
        <line x1={NX + R + 6} y1={NY} x2={AX - 14} y2={NY} stroke={C.dim} strokeWidth={3} />
        <polygon points={`${AX - 4},${NY} ${AX - 18},${NY - 8} ${AX - 18},${NY + 8}`} fill={C.dim} />
        <path d={`M ${AX + 60} ${Y + H + 8} C ${AX + 60} ${Y + H + 90}, ${NX} ${Y + H + 110}, ${NX} ${NY + R + 14}`} fill="none" stroke={C.amber} strokeWidth={3} strokeDasharray="7 7" />
        <polygon points={`${NX},${NY + R + 4} ${NX - 8},${NY + R + 18} ${NX + 8},${NY + R + 18}`} fill={C.amber} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: NX - R,
          top: NY - R,
          width: R * 2,
          height: R * 2,
          borderRadius: R,
          border: `3px solid ${C.amber}`,
          background: C.panel,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 26,
          color: C.amber,
          boxShadow: nodeGlow > 0.02 ? `0 0 ${34 * nodeGlow}px ${C.amber}` : undefined,
          opacity: clamp01(s(1, 2, POP)),
          transform: `scale(${(0.6 + 0.4 * clamp01(s(1, 2, POP))) * (1 + 0.08 * nodeGlow)})`,
        }}
      >
        крок
      </div>
      <At x={AX} y={Y - 50} step={1} size={24} weight={700} color={C.mint}>
        накопичене
      </At>
      <div
        style={{
          position: "absolute",
          left: AX,
          top: Y,
          width: 120,
          height: H,
          borderRadius: 12,
          border: `3px solid ${arrived === 0 ? C.amber : C.mint}`,
          background: `${arrived === 0 ? C.amber : C.mint}22`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: F.mono,
          fontWeight: 700,
          fontSize: 34,
          color: arrived === 0 ? C.amber : C.mint,
          opacity: clamp01(s(1, 8, POP)),
          transform: `scale(${mix(0.8, 1, bump)})`,
        }}
      >
        {ACC[arrived]}
      </div>
      <At x={LX} y={Y + 246} step={1} delay={12} size={22} weight={600} color={C.dim}>
        <span style={{ color: C.amber }}>початкове значення</span>, далі – результат кожного кроку
      </At>
      <div style={{ position: "absolute", left: LX, top: Y + 190, fontFamily: F.mono, fontWeight: 700, fontSize: 34, whiteSpace: "pre", fontVariantLigatures: "none" }}>
        {ACC.map((v, i) => {
          const p = i === 0 ? s(1, 10) : s(1, arriveAt(i - 1) + FLY);
          return (
            <span key={i} style={{ opacity: clamp01(p), color: i === 0 ? C.amber : C.mint }}>
              {i > 0 && <span style={{ color: C.faint }}>{"  →  "}</span>}
              {v}
            </span>
          );
        })}
      </div>

      {head.map((h, i) => (
        <At key={h} x={cols[i]} y={340} step={2} size={22} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
          {h}
        </At>
      ))}
      {TASKS.map((r, i) => {
        const p = s(2, 8 + i * 12, POP);
        const y = 390 + i * 84;
        return (
          <div
            key={r.task}
            style={{
              position: "absolute",
              left: 980,
              top: y,
              width: 844,
              height: 66,
              borderRadius: 12,
              background: C.panel,
              borderLeft: `5px solid ${C.accent}`,
              opacity: clamp01(p),
              transform: `translateY(${(1 - p) * 18}px)`,
            }}
          >
            <div style={{ position: "absolute", left: cols[0] - 980, top: 0, height: 66, display: "flex", alignItems: "center", fontFamily: F.body, fontWeight: 700, fontSize: 28, color: C.text }}>
              {r.task}
            </div>
            {[r.z, r.f, r.res].map((v, j) => (
              <div
                key={j}
                style={{
                  position: "absolute",
                  left: cols[j + 1] - 980,
                  top: 0,
                  height: 66,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: F.mono,
                  fontWeight: 700,
                  fontSize: 26,
                  color: j === 2 ? C.mint : C.amber,
                  whiteSpace: "pre",
                  fontVariantLigatures: "none",
                }}
              >
                {v}
              </div>
            ))}
          </div>
        );
      })}

      <At x={96} y={840} w={1720} step={3} size={32} weight={600}>
        <A>Згортка</A> (fold) зводить послідовність до одного значення: починає з <A c={C.amber}>початкового значення</A> і на кожному{" "}
        <A c={C.amber}>кроці</A> поєднує черговий елемент із накопиченим результатом.
      </At>
    </Slide>
  );
};

/* Одна схема в різних функціях */
const SameShape: React.FC = () => (
  <Slide title="Одна схема в різних функціях">
    <Lead>
      Рекурсивні функції над списками часто мають однакову форму: результат для <M>[]</M> і крок для <M>(x:xs)</M>.
    </Lead>
    <Code
      x={96}
      y={340}
      size={32}
      step={1}
      stagger={6}
      code={`
        sumRec     []     = [[2|0]]
        sumRec     (x:xs) = [[3|x +]] sumRec xs

        productRec []     = [[2@8|1]]
        productRec (x:xs) = [[3@8|x *]] productRec xs

        lengthRec  []     = [[2@16|0]]
        lengthRec  (_:xs) = [[3@16|1 +]] lengthRec xs
      `}
    />
    <At x={1000} y={360} w={820} step={2} delay={10} size={34} weight={800} color={C.amber} font={F.mono}>
      z
    </At>
    <At x={1050} y={364} w={770} step={2} delay={14} size={30} weight={600}>
      початкове значення: що повернути для порожнього списку
    </At>
    <At x={1000} y={540} w={820} step={3} delay={10} size={34} weight={800} color={C.amber} font={F.mono}>
      f
    </At>
    <At x={1050} y={544} w={770} step={3} delay={14} size={30} weight={600}>
      крок: як поєднати голову <M>x</M> із результатом для хвоста
    </At>
    <At x={96} y={860} w={1720} step={4} size={32} weight={600}>
      Відрізняються лише <M c={C.amber}>z</M> і <M c={C.amber}>f</M>. Зробимо їх параметрами – отримаємо згортку <M>foldr</M>.
    </At>
  </Slide>
);

export const p4IntroSlides: SlideDef[] = [
  { id: "fold-idea", title: "Що таке згортка", steps: [45, T0 + XS.length * GAP + 50, 90, 70], C: FoldIdea },
  { id: "same-shape", title: "Одна схема", steps: [45, 70, 70, 70, 60], C: SameShape },
];
