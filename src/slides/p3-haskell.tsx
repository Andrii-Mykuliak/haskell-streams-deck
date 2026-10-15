import React from "react";
import { C, F } from "../deck/theme";
import { mix, POP, SlideDef, useSteps } from "../deck/steps";
import { Code } from "../deck/Code";
import { A, At, Lead, M, Slide } from "../deck/ui";
import { Cell, clamp01, pulse, RowLabel } from "./common";
import { SyntaxBox, TemplateLine, Val } from "./kit";

/* 10 · Засоби формування потоків */
const GEN = [
  { tpl: "[{a} ..]", ex: "take 5 [1..]", res: [1, 2, 3, 4, 5], at: [1, 0] },
  { tpl: "[{a}, {b} .. {c}]", ex: "[0, 5 .. 20]", res: [0, 5, 10, 15, 20], at: [1, 26] },
  { tpl: "iterate {f} {x}", ex: "take 4 (iterate (* 2) 1)", res: [1, 2, 4, 8], at: [2, 0] },
  { tpl: "repeat {x}", ex: "take 3 (repeat 7)", res: [7, 7, 7], at: [3, 0] },
  { tpl: "cycle {xs}", ex: "take 5 (cycle [1, 2])", res: [1, 2, 1, 2, 1], at: [3, 26] },
] as const;

const S10: React.FC = () => {
  const { s } = useSteps();
  const Y0 = 372;
  const RH = 92;
  const panel = s(1, 0, POP);
  return (
    <Slide title="Засоби формування потоків">
      <Lead>Готові функції породжують послідовність за правилом, не перелічуючи її елементів.</Lead>
      <div
        style={{
          position: "absolute",
          left: 76,
          top: 290,
          width: 560,
          height: 560,
          borderRadius: 16,
          border: `2px dashed ${C.amber}`,
          background: "rgba(242,193,125,0.06)",
          opacity: clamp01(panel),
        }}
      />
      <At x={102} y={306} step={1} size={20} weight={800} color={C.amber} style={{ letterSpacing: 1 }}>
        Загальний синтаксис
      </At>
      <At x={700} y={306} step={1} size={20} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
        Приклад
      </At>
      <At x={1330} y={306} step={1} size={20} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
        Результат
      </At>
      {GEN.map((g, i) => {
        const [st, d] = g.at;
        const y = Y0 + i * RH;
        return (
          <React.Fragment key={g.tpl}>
            <At x={102} y={y} step={st} delay={d} size={32} weight={600} font={F.mono} style={{ fontVariantLigatures: "none" }}>
              <TemplateLine line={g.tpl} />
            </At>
            <Code x={700} y={y - 2} size={30} step={st} delay={d + 8} code={g.ex} />
            {g.res.map((v, j) => {
              const p = s(st, d + 20 + j * 5, POP);
              return (
                <div key={j} style={{ position: "absolute", left: 1330 + j * 80, top: y - 4, opacity: clamp01(p), transform: `scale(${mix(0.5, 1, p)})` }}>
                  <Val size={28} color={i === 2 ? C.amber : C.mint}>
                    {v}
                  </Val>
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
      <At x={700} y={Y0 + 2 * RH + 44} step={2} delay={44} size={22} weight={600} color={C.dim} font={F.mono}>
        {"x, f x, f (f x), …"}
      </At>
      <At x={96} y={900} w={1720} step={4} size={32} weight={600}>
        Ці послідовності потенційно <A>нескінченні</A>: скільки елементів обчислити, вирішує споживач – тут <M>take</M>.
      </At>
    </Slide>
  );
};

/* 11 · Лінива послідовність як джерело даних */
const TEMPS = [20, 22, 21, 24, 22, 24, 23, 26];
const CHANGES = [2, -1, 3, -2, 2, -1, 3, -2];
const GEN_D = 26;

const S11: React.FC = () => {
  const { s, t } = useSteps();
  const X0 = 330;
  const P = 170;
  const W = 120;
  const H = 70;
  const YA = 520;
  const YB = 628;
  const YC = 748;
  const X = (i: number) => X0 + i * P;
  const born = (k: number) => (k === 0 ? 0 : (k - 1) * GEN_D + 24);
  const fmt = (v: number) => (v < 0 ? `−${-v}` : `${v}`);
  return (
    <Slide title="Лінива послідовність як джерело даних">
      <Lead>Правило може задавати необмежену послідовність значень; споживач визначає, яка її частина потрібна.</Lead>
      <SyntaxBox x={1110} y={336} w={710} step={1} size={24} lines={["zipWith {f} {xs} {ys}", "-- [{f} {x₀} {y₀}, {f} {x₁} {y₁}, …]"]} />
      <Code
        x={96}
        y={350}
        size={30}
        step={1}
        delay={24}
        stagger={10}
        code={`
          changes      = cycle [2, -1, 3, -2]
          temperatures = 20 : zipWith (+) temperatures changes
          @3+200 take 8 temperatures   -- [20,22,21,24,22,24,23,26]
        `}
      />
      <RowLabel x={96} y={YA} h={H} p={s(1, 40)} color={C.lav}>
        temperatures
      </RowLabel>
      <RowLabel x={96} y={YB} h={H} p={s(2, 0)} color={C.amber}>
        changes
      </RowLabel>
      <RowLabel x={96} y={YC} h={H} p={s(3, 0)} color={C.mint}>
        {"zipWith (+)"}
      </RowLabel>
      {TEMPS.map((v, k) => {
        const forced = k === 0 ? s(1, 46, POP) : s(3, born(k), POP);
        const hot = k < 7 ? pulse(t(3, k * GEN_D), 8, 14) : 0;
        return <Cell key={k} x={X(k)} y={YA} w={W} h={H} label={v} appear={s(1, 44 + k * 4, POP)} force={forced} glow={hot} color={C.lav} size={32} />;
      })}
      {CHANGES.map((v, k) => {
        const hot = k < 7 ? pulse(t(3, k * GEN_D), 8, 14) : 0;
        return <Cell key={k} x={X(k)} y={YB} w={W} h={H} label={fmt(v)} appear={s(2, 6 + k * 5, POP)} glow={hot} color={C.amber} size={30} />;
      })}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        <line x1={X(4) - 25} y1={YB - 10} x2={X(4) - 25} y2={YB + H + 10} stroke={C.faint} strokeWidth={2} strokeDasharray="6 6" opacity={clamp01(s(2, 50))} />
        <line x1={X0 - 10} y1={YC - 24} x2={X0 - 10 + (X(7) + W + 20 - X0) * clamp01(s(3, 0))} y2={YC - 24} stroke={C.faint} strokeWidth={2} />
      </svg>
      <At x={X(4) - 14} y={YB - 32} step={2} delay={54} size={20} weight={600} color={C.faint}>
        ↻ cycle
      </At>
      {TEMPS.slice(1).map((v, i) => {
        const p = s(3, i * GEN_D + 6, POP);
        const fly = clamp01((t(3, i * GEN_D + 12) / 12));
        const e = fly * fly * (3 - 2 * fly);
        const gx = mix(X(i), X(i + 1), e);
        const gy = mix(YC, YA, e);
        return (
          <React.Fragment key={i}>
            <Cell x={X(i)} y={YC} w={W} h={H} label={v} appear={p} color={C.mint} size={32} />
            {fly > 0 && fly < 1 && (
              <div
                style={{
                  position: "absolute",
                  left: gx,
                  top: gy,
                  width: W,
                  height: H,
                  borderRadius: 12,
                  border: `3px solid ${C.mint}`,
                  background: C.bg,
                  boxShadow: `0 0 22px ${C.mint}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: F.mono,
                  fontWeight: 700,
                  fontSize: 32,
                  color: C.mint,
                }}
              >
                {v}
              </div>
            )}
          </React.Fragment>
        );
      })}
      <At x={X(7) + W + 24} y={YA + 8} step={1} delay={80} size={40} weight={800} color={C.faint}>
        …
      </At>
      <At x={96} y={900} w={1720} step={4} size={32} weight={600}>
        Послідовність формують <A>один раз</A>; різні споживачі отримують із неї потрібні результати.
      </At>
    </Slide>
  );
};

export const p3Slides: SlideDef[] = [
  { id: "generators", title: "Засоби формування потоків", steps: [40, 70, 80, 80, 60], C: S10 },
  { id: "lazy-source", title: "Лінива послідовність", steps: [45, 110, 80, 7 * GEN_D + 60, 60], C: S11 },
];
