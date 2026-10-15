import React from "react";
import { C, F } from "../deck/theme";
import { mix, POP, SlideDef, useSteps } from "../deck/steps";
import { Code, colX } from "../deck/Code";
import { A, At, Lead, M, Slide } from "../deck/ui";
import { Card, Cell, clamp01, pulse, RowLabel } from "./common";
import { Flow, SyntaxBox, Val } from "./kit";

/** A round tree node whose label can cross-fade into a second one. */
const TNode: React.FC<{ x: number; y: number; p: number; label: string; color: string; to?: string; toColor?: string; swap?: number; r?: number; glow?: number }> = ({
  x,
  y,
  p,
  label,
  color,
  to,
  toColor,
  swap = 0,
  r = 38,
  glow = 0,
}) => {
  const sw = clamp01(swap);
  const c = sw > 0.5 && toColor ? toColor : color;
  const txt: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: F.mono,
    fontWeight: 700,
    fontSize: r * 0.8,
    fontVariantLigatures: "none",
  };
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: r,
        border: `3px solid ${c}`,
        background: C.panel,
        boxSizing: "border-box",
        boxShadow: glow > 0.02 ? `0 0 ${26 * glow}px ${c}` : undefined,
        opacity: clamp01(p),
        transform: `scale(${mix(0.5, 1, p)})`,
      }}
    >
      <div style={{ ...txt, color, opacity: 1 - sw, transform: `scale(${1 - 0.4 * sw})` }}>{label}</div>
      {to !== undefined && <div style={{ ...txt, color: toColor ?? color, opacity: sw, transform: `scale(${0.6 + 0.4 * sw})` }}>{to}</div>}
    </div>
  );
};

const Edges: React.FC<{ edges: [number, number, number, number, number][] }> = ({ edges }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
    {edges.map(([x1, y1, x2, y2, p], i) => (
      <line key={i} x1={x1} y1={y1} x2={mix(x1, x2, clamp01(p))} y2={mix(y1, y2, clamp01(p))} stroke={C.line} strokeWidth={4} strokeLinecap="round" />
    ))}
  </svg>
);

/* 12 · Згортка випливає зі структури списку */
const S12: React.FC = () => {
  const { s } = useSteps();
  const spine = [0, 1, 2].map((i) => ({ x: 1290 + i * 140, y: 330 + i * 125 }));
  const leaves = [1, 2, 3].map((v, i) => ({ x: spine[i].x - 105, y: spine[i].y + 125, v }));
  const nil = { x: spine[2].x + 140, y: spine[2].y + 125 };
  const ap = (i: number) => s(2, 20 + i * 10, POP);
  const sw = (i: number) => s(3, 40 + (3 - i) * 12);
  const edges: [number, number, number, number, number][] = [];
  spine.forEach((n, i) => {
    edges.push([n.x, n.y, leaves[i].x, leaves[i].y, s(2, 24 + i * 10)]);
    const nx = i < 2 ? spine[i + 1] : nil;
    edges.push([n.x, n.y, nx.x, nx.y, s(2, 26 + i * 10)]);
  });
  return (
    <Slide title="Згортка випливає зі структури списку">
      <Lead size={35}>
        Список побудовано з двох конструкторів: порожнього списку <M>[]</M> та додавання елемента <M>(:)</M>.
      </Lead>
      <SyntaxBox x={96} y={310} w={860} step={1} size={28} title="Конструктори списку" lines={["[]           -- порожній список", "{x} : {xs}   -- елемент {x} перед списком {xs}"]} />
      <Code x={96} y={486} size={34} step={2} code={`[1,2,3] = 1 : (2 : (3 : []))`} />
      <SyntaxBox x={96} y={576} w={860} step={3} size={28} title="Згортка справа" lines={["foldr {f} {z} {xs}"]} />
      <Code
        x={96}
        y={706}
        size={34}
        step={3}
        delay={30}
        stagger={14}
        code={`
          foldr f z [1,2,3]
                = f 1 (f 2 (f 3 z))
        `}
      />
      <Edges edges={edges} />
      {spine.map((n, i) => (
        <TNode key={`s${i}`} x={n.x} y={n.y} p={ap(i)} label=":" color={C.lav} to="f" toColor={C.amber} swap={sw(i)} />
      ))}
      {leaves.map((n, i) => (
        <TNode key={`l${i}`} x={n.x} y={n.y} p={s(2, 26 + i * 10, POP)} label={`${n.v}`} color={C.mint} />
      ))}
      <TNode x={nil.x} y={nil.y} p={s(2, 52, POP)} label="[]" color={C.lav} to="z" toColor={C.amber} swap={sw(3)} />
      <At x={96} y={900} w={1720} step={4} size={32} weight={600}>
        <M>foldr</M> замінює <M>[]</M> початковим значенням <M c={C.amber}>z</M>, а кожне <M>(:)</M> – функцією <M c={C.amber}>f</M>.
      </At>
    </Slide>
  );
};

/* 13 · Від рекурсії до згортки */
const S13: React.FC = () => {
  const { s } = useSteps();
  return (
    <Slide title="Від рекурсії до згортки">
      <Lead>Однакова схема обробки списку повторюється в багатьох функціях. Згортка відокремлює схему від операції.</Lead>
      <Card x={96} y={330} w={820} h={420} p={s(1, 0, POP)}>
        <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 34, color: C.lav }}>Явна рекурсія</div>
      </Card>
      <Card x={1004} y={330} w={820} h={420} p={s(2, 0, POP)}>
        <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 34, color: C.mint }}>Те саме через foldr</div>
      </Card>
      <Code
        x={136}
        y={430}
        size={32}
        step={1}
        delay={10}
        code={`
          sumRec :: [Int] -> Int
          sumRec []     = [[3|0]]
          sumRec (x:xs) = x [[3@16|+]] sumRec xs
          @4
          @4 sumRec [3,5,2]   -- 10
        `}
      />
      <Code
        x={1044}
        y={430}
        size={32}
        step={2}
        delay={10}
        code={`
          sumFold :: [Int] -> Int
          sumFold = foldr [[3@16|(+)]] [[3|0]]
          @4
          @4
          @4+10 sumFold [3,5,2]  -- 10
        `}
      />
      <At x={136} y={680} step={3} delay={30} size={24} weight={600} color={C.dim}>
        база і крок записані вручну
      </At>
      <At x={1044} y={680} step={3} delay={30} size={24} weight={600} color={C.dim}>
        база і крок – аргументи foldr
      </At>
      <At x={96} y={880} w={1720} step={4} delay={30} size={32} weight={600}>
        Змінюється спосіб опису рекурсивної обробки, а <A>не математичний результат</A>.
      </At>
    </Slide>
  );
};

/** Coloured bars and labels under parts of a type signature. */
const TypeParts: React.FC<{ x: number; y: number; size: number; step: number; parts: { from: number; to: number; label: string; color: string }[] }> = ({ x, y, size, step, parts }) => {
  const { s } = useSteps();
  return (
    <>
      {parts.map((pt, i) => {
        const p = s(step, i * 10);
        const x1 = colX(x, pt.from, size);
        const x2 = colX(x, pt.to + 1, size);
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x1, top: y, width: (x2 - x1) * clamp01(p), height: 5, borderRadius: 3, background: pt.color }} />
            <div
              style={{
                position: "absolute",
                left: (x1 + x2) / 2 - 100,
                width: 200,
                top: y + 12,
                textAlign: "center",
                fontFamily: F.body,
                fontWeight: 700,
                fontSize: 22,
                color: pt.color,
                opacity: clamp01(p),
              }}
            >
              {pt.label}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

/* 14 · foldr: правило рекурсивної обробки */
const S14: React.FC = () => (
  <Slide title="foldr: правило рекурсивної обробки">
    <Lead>
      <M>foldr</M> поєднує перший елемент списку з результатом обробки решти.
    </Lead>
    <Code x={96} y={290} size={34} step={1} code={`foldr :: (a -> b -> b) -> b -> [a] -> b`} />
    <TypeParts
      x={96}
      y={346}
      size={34}
      step={2}
      parts={[
        { from: 9, to: 21, label: "крок", color: C.amber },
        { from: 26, to: 26, label: "початкове", color: C.lav },
        { from: 31, to: 33, label: "вхід", color: C.mint },
        { from: 38, to: 38, label: "результат", color: C.accentHi },
      ]}
    />
    <Code
      x={96}
      y={410}
      size={34}
      step={1}
      delay={14}
      code={`
        foldr f z []     = z
        foldr f z (x:xs) = f x (foldr f z xs)
      `}
    />
    <Code
      x={96}
      y={540}
      size={30}
      step={3}
      stagger={18}
      lh={44}
      code={`
        foldr (+) 0 [3,5,2]
        = 3 + foldr (+) 0 [5,2]
        = 3 + (5 + foldr (+) 0 [2])
        = 3 + (5 + (2 + foldr (+) 0 []))
        = 3 + (5 + (2 + [[3@80|0]]))
        = [[3@100|10]]
      `}
    />
    <At x={96} y={900} w={1720} step={4} size={32} weight={600}>
      Тип <M c={C.lav}>b</M> не обов’язково збігається з типом <M>a</M>: згортка може створювати <A>інший тип</A> результату.
    </At>
  </Slide>
);

/* 15 · foldl: рекурсія з акумулятором */
const S15: React.FC = () => (
  <Slide title="foldl: рекурсія з акумулятором">
    <Lead>
      <M>foldl</M> передає проміжний результат до наступного кроку, не змінюючи попередніх значень.
    </Lead>
    <Code x={96} y={330} size={34} step={1} code={`foldl :: (b -> a -> b) -> b -> [a] -> b`} />
    <TypeParts
      x={96}
      y={386}
      size={34}
      step={2}
      parts={[
        { from: 9, to: 21, label: "крок", color: C.amber },
        { from: 26, to: 26, label: "акумулятор", color: C.lav },
        { from: 31, to: 33, label: "вхід", color: C.mint },
        { from: 38, to: 38, label: "результат", color: C.accentHi },
      ]}
    />
    <Code
      x={96}
      y={450}
      size={34}
      step={1}
      delay={14}
      code={`
        foldl f acc []     = acc
        foldl f acc (x:xs) = foldl f (f acc x) xs
      `}
    />
    <Code x={96} y={590} size={32} step={3} code={`foldl (+) 0 [3,5,2]   -- 10`} />
    <Flow
      x={96}
      y={660}
      step={3}
      delay={20}
      gap={22}
      arrowW={170}
      items={[
        { el: <Val color={C.lav}>0</Val> },
        { el: <Val color={C.lav}>3</Val>, via: "+ 3" },
        { el: <Val color={C.lav}>8</Val>, via: "+ 5" },
        { el: <Val>10</Val>, via: "+ 2" },
      ]}
    />
    <At x={96} y={770} step={3} delay={100} size={26} weight={600} color={C.dim}>
      кожен крок – нове значення
    </At>
    <At x={96} y={900} w={1720} step={4} size={32} weight={600}>
      Акумулятор – <A>звичайний аргумент</A> функції, а не змінювана комірка пам’яті.
    </At>
  </Slide>
);

/* 16 · foldl і foldr: два способи згортання */
type TN = { x: number; y: number; leaf?: string; val?: string; at?: number; kids?: [number, number] };

const LEFT_TREE: TN[] = [
  { x: 600, y: 410, val: "−6", at: 40, kids: [1, 2] },
  { x: 490, y: 520, val: "−3", at: 20, kids: [3, 4] },
  { x: 710, y: 520, leaf: "3" },
  { x: 380, y: 630, val: "−1", at: 0, kids: [5, 6] },
  { x: 600, y: 630, leaf: "2" },
  { x: 270, y: 740, leaf: "0" },
  { x: 490, y: 740, leaf: "1" },
];

const RIGHT_TREE: TN[] = [
  { x: 1320, y: 410, val: "2", at: 40, kids: [1, 2] },
  { x: 1210, y: 520, leaf: "1" },
  { x: 1430, y: 520, val: "−1", at: 20, kids: [3, 4] },
  { x: 1320, y: 630, leaf: "2" },
  { x: 1540, y: 630, val: "3", at: 0, kids: [5, 6] },
  { x: 1430, y: 740, leaf: "3" },
  { x: 1650, y: 740, leaf: "0" },
];

const Tree: React.FC<{ nodes: TN[]; step: number }> = ({ nodes, step }) => {
  const { s } = useSteps();
  const edges: [number, number, number, number, number][] = [];
  nodes.forEach((n, i) => {
    n.kids?.forEach((k) => edges.push([n.x, n.y, nodes[k].x, nodes[k].y, s(step, 6 + i * 4)]));
  });
  return (
    <>
      <Edges edges={edges} />
      {nodes.map((n, i) => {
        const p = s(step, i * 4, POP);
        if (n.leaf !== undefined) {
          return <TNode key={i} x={n.x} y={n.y} p={p} label={n.leaf} color={C.lav} r={34} />;
        }
        const sw = s(step + 1, n.at ?? 0);
        const glow = Math.max(0, 1 - Math.abs(sw - 0.5) * 2);
        return <TNode key={i} x={n.x} y={n.y} p={p} label="−" color={C.amber} to={n.val} toColor={C.mint} swap={sw} r={34} glow={glow} />;
      })}
    </>
  );
};

const S16: React.FC = () => (
  <Slide title="foldl і foldr: два способи згортання">
    <Lead>Одна й та сама операція може давати різні результати через різне групування.</Lead>
    <Code x={290} y={290} size={32} step={1} code={`foldl (-) 0 [1,2,3]`} />
    <Code x={1110} y={290} size={32} step={1} delay={10} code={`foldr (-) 0 [1,2,3]`} />
    <Tree nodes={LEFT_TREE} step={1} />
    <Tree nodes={RIGHT_TREE} step={1} />
    <At x={160} y={800} w={700} step={2} delay={50} size={34} weight={700} font={F.mono} align="center" style={{ fontVariantLigatures: "none" }}>
      ((0 − 1) − 2) − 3 = <span style={{ color: C.mint }}>−6</span>
    </At>
    <At x={1060} y={800} w={700} step={2} delay={50} size={34} weight={700} font={F.mono} align="center" style={{ fontVariantLigatures: "none" }}>
      1 − (2 − (3 − 0)) = <span style={{ color: C.mint }}>2</span>
    </At>
    <At x={96} y={900} w={1720} step={3} size={32} weight={600}>
      <A>Групування</A> операцій і фактична <A>стратегія обчислення</A> – різні питання.
    </At>
  </Slide>
);

/* 17 · map – окремий випадок foldr */
const S17: React.FC = () => {
  const { s, t } = useSteps();
  const XS = [1, 2, 3];
  const X0 = 600;
  const P = 200;
  const W = 100;
  const H = 66;
  const YI = 660;
  const YO = 800;
  const at = (i: number) => (2 - i) * 24 + 26;
  const colon = (x: number, y: number, p: number, color: string) => (
    <div style={{ position: "absolute", left: x + W, width: P - W, top: y, height: H, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontWeight: 700, fontSize: 34, color, opacity: clamp01(p) }}>
      :
    </div>
  );
  return (
    <Slide title="map – окремий випадок foldr">
      <Lead>
        Функція <M>map</M> зберігає структуру списку, перетворюючи кожний його елемент.
      </Lead>
      <SyntaxBox x={96} y={290} w={860} step={1} size={28} title="Лямбда-вираз" lines={["\\{x} {acc} -> {expr}   -- функція без імені"]} />
      <Code
        x={96}
        y={430}
        size={32}
        step={1}
        delay={20}
        code={`
          map f []     = []
          map f (x:xs) = f x : map f xs
          @2 mapFold f = foldr (\\x acc -> f x : acc) []
        `}
      />
      <RowLabel x={96} y={YI} h={H} p={s(3, 0)} color={C.lav}>
        xs
      </RowLabel>
      <RowLabel x={96} y={YO} h={H} p={s(3, 10)} color={C.mint}>
        {"mapFold (* 10) xs"}
      </RowLabel>
      {XS.map((v, i) => (
        <React.Fragment key={i}>
          <Cell x={X0 + i * P} y={YI} w={W} h={H} label={v} appear={s(3, i * 5, POP)} color={C.lav} size={30} glow={pulse(t(3, at(i)), 6, 12)} />
          {colon(X0 + i * P, YI, s(3, 4 + i * 5), C.dim)}
        </React.Fragment>
      ))}
      <Cell x={X0 + 3 * P} y={YI} w={W} h={H} label="[]" appear={s(3, 16, POP)} color={C.lav} size={30} />
      <Cell x={X0 + 3 * P} y={YO} w={W} h={H} label="[]" appear={s(3, 22, POP)} color={C.amber} size={30} />
      {XS.map((v, i) => {
        const p = s(3, at(i) + 8, POP);
        return (
          <React.Fragment key={i}>
            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
              <line x1={X0 + i * P + W / 2} y1={YI + H + 6} x2={X0 + i * P + W / 2} y2={mix(YI + H + 6, YO - 8, clamp01(s(3, at(i))))} stroke={C.amber} strokeWidth={3} strokeDasharray="5 5" />
            </svg>
            <Cell x={X0 + i * P} y={YO} w={W} h={H} label={v * 10} appear={p} color={C.mint} size={30} />
            {colon(X0 + i * P, YO, p, C.dim)}
          </React.Fragment>
        );
      })}
      <At x={X0 + 3 * P + W + 20} y={YO + 14} step={3} delay={30} size={24} weight={600} color={C.amber}>
        z
      </At>
      <At x={96} y={920} w={1720} step={4} size={30} weight={600}>
        У згортці базовий результат – <M c={C.amber}>[]</M>, а крок будує список із перетворених елементів.
      </At>
    </Slide>
  );
};

export const p4Slides: SlideDef[] = [
  { id: "fold-structure", title: "Структура списку", steps: [45, 70, 90, 110, 60], C: S12 },
  { id: "rec-to-fold", title: "Від рекурсії до згортки", steps: [45, 60, 60, 80, 90], C: S13 },
  { id: "foldr", title: "foldr", steps: [40, 50, 60, 140, 60], C: S14 },
  { id: "foldl", title: "foldl", steps: [40, 50, 60, 130, 60], C: S15 },
  { id: "foldl-foldr", title: "foldl і foldr", steps: [40, 80, 90, 60], C: S16 },
  { id: "map-fold", title: "map через foldr", steps: [40, 60, 60, 120, 60], C: S17 },
];
