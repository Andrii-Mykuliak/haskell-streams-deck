import React from "react";
import { C, F } from "../deck/theme";
import { POP, SlideDef, useSteps } from "../deck/steps";
import { Code } from "../deck/Code";
import { A, Arrow, At, Lead, M, Slide } from "../deck/ui";
import { Cell, clamp01 } from "./common";


/* 3 · Потік даних */
const TEMPS = [20, 22, 21, 24, 22, 24];

const S3: React.FC = () => {
  const { s } = useSteps();
  const X0 = 150;
  const P = 200;
  const Y = 470;
  const W = 130;
  const sums = TEMPS.reduce<number[]>((acc, v) => [...acc, (acc[acc.length - 1] ?? 0) + v], []);
  return (
    <Slide title="Потік даних">
      <Lead>
        <A>Потік даних</A> – упорядкована послідовність значень, яку система породжує, передає або обробляє відповідно до моделі обчислення.
      </Lead>
      <Code x={96} y={330} size={44} step={1} code={`X = ⟨x₀, x₁, x₂, …⟩`} />
      {TEMPS.map((v, i) => (
        <React.Fragment key={i}>
          <At x={X0 + i * P} w={W} y={Y - 46} step={1} delay={18 + i * 9} size={26} weight={700} color={C.dim} font={F.mono} align="center">
            {`x${"₀₁₂₃₄₅"[i]}`}
          </At>
          <Cell x={X0 + i * P} y={Y} w={W} h={80} label={v} appear={s(1, 20 + i * 9, POP)} color={C.lav} size={36} />
        </React.Fragment>
      ))}
      <At x={X0 + 6 * P + 10} y={Y + 10} step={1} delay={76} size={48} weight={800} color={C.faint}>
        …
      </At>
      <Arrow x1={X0} y1={Y + 116} x2={X0 + 6 * P + 70} y2={Y + 116} step={1} delay={70} dur={24} color={C.faint} width={3} />
      <At x={X0 + 6 * P + 90} y={Y + 96} step={1} delay={88} size={26} weight={600} color={C.dim}>
        час
      </At>
      {TEMPS.slice(1).map((v, i) => {
        const d = v - TEMPS[i];
        return (
          <At key={i} x={X0 + i * P + W} w={P - W} y={Y + 20} step={2} delay={i * 8} size={28} weight={800} color={d > 0 ? C.mint : C.red} font={F.mono} align="center">
            {d > 0 ? `+${d}` : `−${-d}`}
          </At>
        );
      })}
      <At x={X0 - 6} y={Y + 150} step={2} delay={44} size={24} weight={600} color={C.dim}>
        накопичення
      </At>
      {sums.map((v, i) => (
        <At key={i} x={X0 + i * P} w={W} y={Y + 186} step={2} delay={50 + i * 8} size={30} weight={700} color={C.amber} font={F.mono} align="center">
          {v}
        </At>
      ))}
      <At x={96} y={880} w={1720} step={3} size={34} weight={600}>
        <A>Порядок</A> елементів важливий для накопичення, зміни тенденції та формування проміжних результатів.
      </At>
    </Slide>
  );
};

/* 4 · Складники потокового обчислення */
const PARTS = [
  { title: "Джерело", q: "Звідки дані?", color: C.lav, ex: ["[1..]", "readFile \"data.txt\""] },
  { title: "Перетворення", q: "Що з ними робити?", color: C.amber, ex: ["map (* 10)", "filter (> 0)"] },
  { title: "Споживач", q: "Як використати результат?", color: C.mint, ex: ["sum", "putStrLn"] },
];

const S4: React.FC = () => {
  const { s, lin } = useSteps();
  const X = [110, 735, 1360];
  const CW = 450;
  const Y = 340;
  const CH = 300;
  const tok = lin(1, 40, 70);
  return (
    <Slide title="Складники потокового обчислення">
      <Lead>У найпростішій моделі результат формується за допомогою трьох компонентів.</Lead>
      {PARTS.map((p, i) => {
        const a = s(1, i * 10, POP);
        return (
          <div
            key={p.title}
            style={{
              position: "absolute",
              left: X[i],
              top: Y,
              width: CW,
              height: CH,
              borderRadius: 18,
              border: `3px solid ${p.color}`,
              background: C.panel,
              boxSizing: "border-box",
              padding: "28px 30px",
              opacity: clamp01(a),
              transform: `translateY(${(1 - a) * 24}px)`,
            }}
          >
            <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 40, color: p.color }}>{p.title}</div>
            <div style={{ marginTop: 8, fontFamily: F.body, fontSize: 28, color: C.dim }}>{p.q}</div>
            <div style={{ marginTop: 34, opacity: clamp01(s(2, i * 8)) }}>
              {p.ex.map((e) => (
                <div key={e} style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 28, color: C.mint, lineHeight: 1.5, whiteSpace: "pre", fontVariantLigatures: "none" }}>
                  {e}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <Arrow x1={X[0] + CW + 12} y1={Y + CH / 2} x2={X[1] - 12} y2={Y + CH / 2} step={1} delay={24} dur={12} color={C.dim} />
      <Arrow x1={X[1] + CW + 12} y1={Y + CH / 2} x2={X[2] - 12} y2={Y + CH / 2} step={1} delay={30} dur={12} color={C.dim} />
      {tok > 0 && tok < 1 && (
        <div
          style={{
            position: "absolute",
            left: X[0] + CW / 2 + (X[2] + CW / 2 - X[0] - CW / 2) * tok - 22,
            top: Y + CH + 30,
            width: 44,
            height: 44,
            borderRadius: 22,
            border: `3px solid ${tok < 0.5 ? C.lav : C.mint}`,
            background: C.bg,
            boxShadow: `0 0 14px ${tok < 0.5 ? C.lav : C.mint}`,
          }}
        />
      )}
      <At x={96} y={880} w={1720} step={3} size={32} weight={600}>
        Джерелом може бути список, файл або зовнішня система; споживачем – агрегат, звіт чи сховище.
      </At>
    </Slide>
  );
};

/* 5 · Різновиди потоків */
const KINDS = [
  {
    left: "Скінченні",
    lcode: "[3, 5, 2]",
    right: "потенційно нескінченні",
    rcode: "[1..]",
    note: (
      <>
        Не кожне агрегування має скінченний результат: <M>take 3 [1..]</M> завершиться, <M>sum [1..]</M> – ні.
      </>
    ),
  },
  {
    left: "Наявні наперед",
    lcode: "[20, 22, 21]",
    right: "дані, що надходять",
    rcode: "getLine",
    note: <>Лінивий список не є автоматично зовнішнім потоком.</>,
  },
  {
    left: "Чисті",
    lcode: "map (* 2) xs",
    right: "з ефектами",
    rcode: "putStrLn s",
    note: <>Перетворення значень відділяють від дій IO.</>,
  },
];

const S5: React.FC = () => (
  <Slide title="Різновиди потоків">
    {KINDS.map((k, i) => {
      const y = 190 + i * 250;
      const st = i + 1;
      return (
        <React.Fragment key={i}>
          <At x={110} y={y} step={st} size={36} weight={800} color={C.lav}>
            {k.left}
          </At>
          <Code x={110} y={y + 56} size={32} step={st} delay={8} code={k.lcode} />
          <At x={880} y={y + 18} step={st} delay={12} size={52} weight={800} color={C.faint}>
            ↔
          </At>
          <At x={1000} y={y} step={st} delay={16} size={36} weight={800} color={C.amber}>
            {k.right}
          </At>
          <Code x={1000} y={y + 56} size={32} step={st} delay={22} code={k.rcode} />
          <At x={110} y={y + 124} w={1700} step={st} delay={34} size={27} weight={400} color={C.dim}>
            {k.note}
          </At>
        </React.Fragment>
      );
    })}
  </Slide>
);

export const p1Slides: SlideDef[] = [
  { id: "stream", title: "Потік даних", steps: [55, 120, 110, 55], C: S3 },
  { id: "parts", title: "Складники", steps: [40, 120, 70, 55], C: S4 },
  { id: "kinds", title: "Різновиди потоків", steps: [20, 70, 70, 70], C: S5 },
];
