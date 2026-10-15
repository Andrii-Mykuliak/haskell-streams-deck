import React from "react";
import { C, F } from "../deck/theme";
import { mix, POP, SlideDef, useSteps } from "../deck/steps";
import { Code } from "../deck/Code";
import { A, Arrow, At, Lead, M, Mark, Slide } from "../deck/ui";
import { Cell, clamp01, pulse, RowLabel } from "./common";
import { SyntaxBox, Val } from "./kit";

const ease = (v: number) => {
  const k = clamp01(v);
  return k * k * (3 - 2 * k);
};

/* 18 · filter – окремий випадок foldr */
const FX = [3, -2, 5, 0, 4];

const S18: React.FC = () => {
  const { s, t } = useSteps();
  const X0 = 470;
  const P = 190;
  const W = 100;
  const H = 66;
  const YI = 630;
  const YO = 770;
  const at = (i: number) => (FX.length - 1 - i) * 24 + 24;
  const kept = FX.map((v) => v > 0);
  const slot = (i: number) => FX.slice(0, i).filter((v) => v > 0).length;
  const pack = ease(t(3, at(0) + 34) / 20);
  const fmt = (v: number) => (v < 0 ? `−${-v}` : `${v}`);
  return (
    <Slide title="filter – окремий випадок foldr">
      <Lead>Фільтрація вирішує для кожного елемента: додати його до результату чи пропустити.</Lead>
      <Code
        x={96}
        y={300}
        size={32}
        step={2}
        code={`
          filterFold p = foldr step []
            where
              step x acc
                | p x       = x : acc
                | otherwise = acc
        `}
      />
      <SyntaxBox
        x={1060}
        y={290}
        w={760}
        step={1}
        size={24}
        title="where і охоронні вирази"
        lines={["{name} = {expr}", "  where", "    {helper} {params}", "      | {cond}    = {value}", "      | otherwise = {other}"]}
      />
      <RowLabel x={96} y={YI} h={H} p={s(3, 0)} color={C.lav}>
        xs
      </RowLabel>
      <RowLabel x={96} y={YO} h={H} p={s(3, 8)} color={C.mint}>
        {"filterFold (> 0)"}
      </RowLabel>
      {FX.map((v, i) => {
        const tick = t(3, at(i));
        const hot = pulse(tick, 6, 12);
        const drop = kept[i] ? 0 : clamp01(tick / 14);
        return (
          <React.Fragment key={i}>
            <Cell x={X0 + i * P} y={YI} w={W} h={H} label={fmt(v)} appear={s(3, i * 4, POP)} color={drop > 0 ? C.red : C.lav} size={30} glow={hot} dim={drop * 0.7} />
            {!kept[i] && <Mark ok={false} x={X0 + i * P + W - 18} y={YI - 22} step={3} delay={at(i) + 4} size={36} />}
          </React.Fragment>
        );
      })}
      <Cell x={mix(X0 + FX.length * P, X0 + 3 * P, pack)} y={YO} w={W} h={H} label="[]" appear={s(3, 18, POP)} color={C.amber} size={30} />
      {FX.map((v, i) => {
        if (!kept[i]) {
          return null;
        }
        const p = s(3, at(i) + 10, POP);
        const x = mix(X0 + i * P, X0 + slot(i) * P, pack);
        return (
          <React.Fragment key={i}>
            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: 1 - pack }}>
              <line x1={X0 + i * P + W / 2} y1={YI + H + 6} x2={X0 + i * P + W / 2} y2={mix(YI + H + 6, YO - 8, clamp01(s(3, at(i))))} stroke={C.amber} strokeWidth={3} strokeDasharray="5 5" />
            </svg>
            <Cell x={x} y={YO} w={W} h={H} label={v} appear={p} color={C.mint} size={30} />
            <div
              style={{
                position: "absolute",
                left: x + W,
                width: P - W,
                top: YO,
                height: H,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 34,
                color: C.dim,
                opacity: clamp01(p),
              }}
            >
              :
            </div>
          </React.Fragment>
        );
      })}
      <At x={96} y={910} w={1720} step={4} size={30} weight={600}>
        Те саме правило рекурсії; відрізняється лише <A>спосіб побудови результату</A>.
      </At>
    </Slide>
  );
};

/* 19 · Інші операції над списками як згортки */
const OTHER = [
  { def: "lengthFold = foldr (\\_ n -> n + 1) 0", ex: `lengthFold "abc"`, res: "3", ty: "Int" },
  { def: "concatFold = foldr (++) []", ex: "concatFold [[1,2],[3]]", res: "[1,2,3]", ty: "[Int]" },
  { def: "andFold    = foldr (&&) True", ex: "andFold [True, False]", res: "False", ty: "Bool" },
];

const S19: React.FC = () => {
  const { s } = useSteps();
  return (
    <Slide title="Інші операції над списками як згортки">
      <Lead>Одна схема згортання виражає підрахунок, об’єднання та логічне узагальнення.</Lead>
      {OTHER.map((o, i) => {
        const y = 340 + i * 150;
        const st = i + 1;
        const hi = s(4, i * 8);
        return (
          <React.Fragment key={i}>
            <Code x={96} y={y} size={30} step={st} code={o.def} />
            <Code x={980} y={y + 2} size={28} step={st} delay={20} code={o.ex} />
            <At x={1384} y={y - 4} step={st} delay={34} size={34} weight={700} color={C.faint}>
              →
            </At>
            <div style={{ position: "absolute", left: 1436, top: y - 4, opacity: clamp01(s(st, 40, POP)), transform: `scale(${mix(0.6, 1, s(st, 40, POP))})` }}>
              <Val size={26}>{o.res}</Val>
            </div>
            <div
              style={{
                position: "absolute",
                left: 1660,
                top: y,
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 26,
                color: hi > 0.5 ? C.amber : C.dim,
                opacity: clamp01(s(st, 48)),
                textShadow: hi > 0.05 ? `0 0 ${16 * hi}px ${C.amber}` : undefined,
                fontVariantLigatures: "none",
              }}
            >
              {`:: ${o.ty}`}
            </div>
          </React.Fragment>
        );
      })}
      <At x={96} y={880} w={1720} step={4} delay={20} size={32} weight={600}>
        Згортка не зобов’язана повертати число: її результатом може бути <A>список</A> або <A>Bool</A>.
      </At>
    </Slide>
  );
};

/* 20 · Спільне правило для різних операцій */
const TABLE = [
  { op: "sum", z: "0", f: "(+)", fMono: true },
  { op: "map f", z: "[]", f: "\\x acc -> f x : acc", fMono: true },
  { op: "filter p", z: "[]", f: "залишити x або пропустити", fMono: false },
  { op: "concat", z: "[]", f: "(++)", fMono: true },
];

const S20: React.FC = () => {
  const { s } = useSteps();
  const COLS = [140, 560, 920];
  const Y0 = 390;
  const RH = 106;
  const zHi = s(2, 0);
  const fHi = s(3, 0);
  const head = (x: number, label: string, color: string, p: number) => (
    <div style={{ position: "absolute", left: x, top: Y0 - 60, fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 1, color, opacity: clamp01(p) }}>{label}</div>
  );
  return (
    <Slide title="Спільне правило для різних операцій">
      <Lead>
        Вибір початкового значення <M c={C.amber}>z</M> і кроку <M c={C.amber}>f</M> визначає зміст згортки.
      </Lead>
      <Code x={1480} y={560} size={44} step={1} delay={30} code={`foldr [[3|f]] [[2|z]] xs`} />
      {head(COLS[0], "Операція", C.dim, s(1, 0))}
      {head(COLS[1], "Початкове z", zHi > 0.5 ? C.amber : C.dim, s(1, 4))}
      {head(COLS[2], "Крок f", fHi > 0.5 ? C.amber : C.dim, s(1, 8))}
      {TABLE.map((r, i) => {
        const p = s(1, 10 + i * 8, POP);
        const y = Y0 + i * RH;
        return (
          <div
            key={r.op}
            style={{
              position: "absolute",
              left: 96,
              top: y,
              width: 1300,
              height: RH - 18,
              borderRadius: 14,
              background: C.panel,
              borderLeft: `6px solid ${C.accent}`,
              opacity: clamp01(p),
              transform: `translateY(${(1 - p) * 20}px)`,
            }}
          >
            <div style={{ position: "absolute", left: COLS[0] - 96, top: 0, height: RH - 18, display: "flex", alignItems: "center", fontFamily: F.mono, fontWeight: 700, fontSize: 32, color: C.mint }}>
              {r.op}
            </div>
            <div
              style={{
                position: "absolute",
                left: COLS[1] - 96,
                top: 0,
                height: RH - 18,
                display: "flex",
                alignItems: "center",
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 32,
                color: C.amber,
                textShadow: zHi > 0.05 ? `0 0 ${18 * zHi}px ${C.amber}` : undefined,
              }}
            >
              {r.z}
            </div>
            <div
              style={{
                position: "absolute",
                left: COLS[2] - 96,
                top: 0,
                height: RH - 18,
                display: "flex",
                alignItems: "center",
                fontFamily: r.fMono ? F.mono : F.body,
                fontStyle: r.fMono ? undefined : "italic",
                fontWeight: r.fMono ? 700 : 600,
                fontSize: r.fMono ? 32 : 30,
                color: r.fMono ? C.amber : C.text,
                whiteSpace: "pre",
                fontVariantLigatures: "none",
                textShadow: fHi > 0.05 ? `0 0 ${18 * fHi}px ${C.amber}` : undefined,
              }}
            >
              {r.f}
            </div>
          </div>
        );
      })}
      <At x={96} y={880} w={1720} step={4} size={32} weight={600}>
        Схема <M>foldr</M> однакова в усіх рядках; змінюються лише <M c={C.amber}>z</M> і <M c={C.amber}>f</M>.
      </At>
    </Slide>
  );
};

/* 21 · foldr і часткове споживання потоку */
const S21: React.FC = () => {
  const { s, t } = useSteps();
  const N = 10;
  const X0 = 300;
  const P = 140;
  const W = 100;
  const H = 64;
  const Y = 600;
  const scanAt = (i: number) => (i < 5 ? 10 + i * 16 : 0);
  const runAt = (i: number) => (i - 5) * 9 + 6;
  return (
    <Slide title="foldr і часткове споживання потоку">
      <Lead>Крок правої згортки може не вимагати весь результат обробки решти списку.</Lead>
      <SyntaxBox x={96} y={290} w={1000} step={1} size={26} title="Перевірка «хоча б один»" lines={["any {p} {xs}   -- True, якщо {p} істинний хоча б для одного"]} />
      <Code
        x={96}
        y={418}
        size={30}
        step={1}
        delay={20}
        code={`
          take 4 (foldr (:) [] [1..])   -- [1,2,3,4]
          @2 any (== 5) [1..]              -- True
          @3 foldr (+) 0 [1..]             -- не завершиться
        `}
      />
      <RowLabel x={96} y={Y} h={H} p={s(2, 0)} color={C.lav}>
        [1..]
      </RowLabel>
      {Array.from({ length: N }, (_, i) => {
        const forcedAny = i < 5 ? s(2, scanAt(i), POP) : 0;
        const forcedAll = i >= 5 ? s(3, runAt(i), POP) : 0;
        const hit = i === 4 ? s(2, scanAt(4) + 6) : 0;
        const tick = i < 5 ? t(2, scanAt(i)) : t(3, runAt(i));
        const hot = pulse(tick, 4, 10);
        return (
          <Cell
            key={i}
            x={X0 + i * P}
            y={Y}
            w={W}
            h={H}
            label={i + 1}
            appear={s(2, i * 2, POP)}
            force={Math.max(forcedAny, forcedAll)}
            color={i >= 5 ? C.red : hit > 0.5 ? C.mint : C.lav}
            glow={Math.max(hot, i === 4 ? hit : 0)}
            size={28}
          />
        );
      })}
      <At x={X0 + N * P - 20} y={Y + 6} step={2} delay={20} size={40} weight={800} color={C.faint}>
        …
      </At>
      <At x={X0 + 4 * P - 10} y={Y + H + 14} w={W + 20} step={2} delay={scanAt(4) + 10} size={26} weight={800} color={C.mint} font={F.mono} align="center">
        True
      </At>
      <At x={X0 + 5 * P} y={Y + H + 14} step={2} delay={scanAt(4) + 24} exit={3} size={24} weight={600} color={C.dim}>
        решту списку не обчислено
      </At>
      <Mark ok={false} x={X0 + N * P + 40} y={Y + 4} step={3} delay={runAt(N - 1) + 14} size={52} />
      <Code
        x={96}
        y={758}
        size={28}
        step={2}
        delay={scanAt(4) + 40}
        code={`
          any p = foldr (\\x acc -> p x [[2@130|||]] acc) False
          -- (||) не обчислює acc, якщо p x = True
        `}
      />
      <At x={96} y={910} w={1720} step={4} size={30} weight={600}>
        Це не гарантує завершення довільної <M>foldr</M>: результат залежить від <A>операції</A> та <A>споживача</A>.
      </At>
    </Slide>
  );
};

/* 22 · Строгість лівої згортки */
const LAZY = ["0", "(0 + 3)", "((0 + 3) + 5)", "(((0 + 3) + 5) + 2)"];
const STRICT = ["0", "3", "8", "10"];
const TICK = 34;

const S22: React.FC = () => {
  const { s, t } = useSteps();
  const Y1 = 610;
  const Y2 = 740;
  const tick = Math.max(0, Math.min(3, Math.floor(t(2, 0) / TICK)));
  const bump = (k: number) => s(2, k * TICK, POP);
  const collapse = s(2, 3 * TICK + 40, POP);
  const box = (y: number, text: string, dashed: boolean, color: string, p: number) => (
    <div
      style={{
        position: "absolute",
        left: 360,
        top: y,
        height: 72,
        display: "flex",
        alignItems: "center",
        padding: "0 22px",
        borderRadius: 12,
        border: `3px ${dashed ? "dashed" : "solid"} ${color}`,
        background: dashed ? "transparent" : `${color}22`,
        fontFamily: F.mono,
        fontWeight: 700,
        fontSize: 32,
        color,
        whiteSpace: "pre",
        fontVariantLigatures: "none",
        opacity: clamp01(s(2, 0)),
        transform: `scale(${mix(0.92, 1, p)})`,
        transformOrigin: "left center",
      }}
    >
      {text}
    </div>
  );
  return (
    <Slide title="Строгість лівої згортки">
      <Lead>
        <M>foldl'</M> із <M c={C.lav}>Data.List</M> суворіше оцінює проміжний акумулятор, ніж <M>foldl</M>.
      </Lead>
      <SyntaxBox x={96} y={290} w={820} step={1} size={28} title="Імпорт із модуля" lines={["import {Module} ({name})"]} />
      <Code
        x={96}
        y={420}
        size={32}
        step={1}
        delay={20}
        stagger={10}
        code={`
          import Data.List (foldl')
          total = foldl' (+) 0 [3,5,2]   -- 10
        `}
      />
      <RowLabel x={96} y={Y1} h={72} p={s(2, 0)} color={C.dim}>
        foldl
      </RowLabel>
      <RowLabel x={96} y={Y2} h={72} p={s(2, 4)} color={C.mint}>
        {"foldl'"}
      </RowLabel>
      <At x={96} y={Y1 - 50} step={2} size={22} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
        АКУМУЛЯТОР ПІСЛЯ КОЖНОГО КРОКУ
      </At>
      {collapse < 0.5
        ? box(Y1, LAZY[tick], true, C.faint, bump(tick))
        : box(Y1, "10", false, C.mint, collapse)}
      {box(Y2, STRICT[tick], false, C.mint, bump(tick))}
      <At x={900} y={Y1 + 18} step={2} delay={30} size={26} weight={600} color={C.dim}>
        відкладені додавання накопичуються
      </At>
      <At x={900} y={Y2 + 18} step={2} delay={30} size={26} weight={600} color={C.dim}>
        значення обчислюється на кожному кроці
      </At>
      <At x={96} y={900} w={1720} step={3} size={30} weight={600}>
        Зміст накопичення не змінюється; це уточнення <A>стратегії обчислення</A>, а не нова схема обробки.
      </At>
    </Slide>
  );
};

/* 23 · scanl: зберегти проміжні результати */
const SX = [3, 5, 2];
const SOUT = [0, 3, 8, 10];

const S23: React.FC = () => {
  const { s } = useSteps();
  const X0 = 430;
  const P = 220;
  const W = 110;
  const H = 70;
  const YI = 620;
  const YO = 770;
  const outAt = (j: number) => j * 28 + 10;
  return (
    <Slide title="scanl: зберегти проміжні результати">
      <Lead>
        На відміну від <M>foldl</M>, <M>scanl</M> повертає не лише кінцевий результат, а й усі значення накопичення.
      </Lead>
      <SyntaxBox x={96} y={330} w={1060} step={1} size={26} lines={["scanl {f} {z} {xs}   -- [{z}, {f} {z} {x₁}, {f} ({f} {z} {x₁}) {x₂}, …]"]} />
      <Code
        x={96}
        y={456}
        size={32}
        step={1}
        delay={24}
        stagger={12}
        code={`
          foldl (+) 0 [3,5,2]   -- 10
          scanl (+) 0 [3,5,2]   -- [0,3,8,10]
        `}
      />
      <RowLabel x={96} y={YI} h={H} p={s(2, 0)} color={C.lav}>
        xs
      </RowLabel>
      <RowLabel x={96} y={YO} h={H} p={s(2, 4)} color={C.mint}>
        scanl (+) 0
      </RowLabel>
      {SX.map((v, i) => (
        <Cell key={i} x={X0 + (i + 1) * P} y={YI} w={W} h={H} label={v} appear={s(2, 4 + i * 4, POP)} color={C.lav} size={32} />
      ))}
      {SOUT.map((v, j) => (
        <React.Fragment key={j}>
          <Cell x={X0 + j * P} y={YO} w={W} h={H} label={v} appear={s(2, outAt(j) + 14, POP)} color={j === 0 ? C.amber : C.mint} size={32} glow={j === 3 ? s(3, 0) : 0} />
          {j > 0 && (
            <>
              <Arrow x1={X0 + (j - 1) * P + W + 8} y1={YO + H / 2} x2={X0 + j * P - 10} y2={YO + H / 2} step={2} delay={outAt(j)} dur={12} color={C.dim} width={3} />
              <Arrow x1={X0 + j * P + W / 2} y1={YI + H + 8} x2={X0 + j * P + W / 2} y2={YO - 10} step={2} delay={outAt(j)} dur={12} color={C.dim} width={3} />
              <At x={X0 + (j - 1) * P + W + 30} y={YO - 4} step={2} delay={outAt(j) + 6} size={26} weight={800} color={C.amber} font={F.mono}>
                +
              </At>
            </>
          )}
        </React.Fragment>
      ))}
      <At x={X0 + 3 * P + W + 40} y={YO + 18} step={3} size={26} weight={600} color={C.dim}>
        останнє значення = результат <M>foldl</M>
      </At>
      <At x={96} y={900} w={1720} step={4} size={30} weight={600}>
        Це основа для <A>наростаючих сум</A>, лічильників і послідовних підсумків вимірювань.
      </At>
    </Slide>
  );
};

export const p4bSlides: SlideDef[] = [
  { id: "filter-fold", title: "filter через foldr", steps: [40, 50, 60, 190, 60], C: S18 },
  { id: "other-folds", title: "Інші згортки", steps: [40, 70, 70, 70, 70], C: S19 },
  { id: "z-and-f", title: "Спільне правило", steps: [40, 80, 50, 50, 60], C: S20 },
  { id: "partial", title: "Часткове споживання", steps: [40, 60, 200, 120, 60], C: S21 },
  { id: "foldl-strict", title: "foldl'", steps: [40, 70, 4 * TICK + 80, 60], C: S22 },
  { id: "scanl", title: "scanl", steps: [40, 70, 130, 60, 60], C: S23 },
];
