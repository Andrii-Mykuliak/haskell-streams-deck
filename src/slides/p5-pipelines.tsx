import React from "react";
import { C, F } from "../deck/theme";
import { mix, POP, SlideDef, useSteps } from "../deck/steps";
import { Code } from "../deck/Code";
import { A, Arrow, At, HaskellLogo, Lead, M, Slide } from "../deck/ui";
import { clamp01, Num } from "./common";
import { Ctx, Flow, SyntaxBox, Val } from "./kit";

/* 24 · Конвеєр і згортка описують те саме обчислення */
const S24: React.FC = () => (
  <Slide title="Конвеєр і згортка описують те саме обчислення">
    <Lead>Сума квадратів парних чисел: готові операції або одна згортка.</Lead>
    <Code
      x={96}
      y={290}
      size={30}
      step={1}
      stagger={10}
      code={`
        pipeline xs = sum (map (^2) (filter even xs))
        byFold xs = foldr step 0 xs
          where step x acc =
                  if even x then x*x + acc else acc
        @4 -- pipeline [1..6] == byFold [1..6] == 56
      `}
    />
    <At x={96} y={618} step={2} size={24} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
      КОНВЕЄР
    </At>
    <Flow
      x={290}
      y={590}
      step={2}
      delay={6}
      gap={26}
      arrowW={170}
      items={[
        { el: <Val color={C.lav} size={26}>[1..6]</Val> },
        { el: <Val color={C.lav} size={26}>[2,4,6]</Val>, via: "filter even" },
        { el: <Val color={C.lav} size={26}>[4,16,36]</Val>, via: "map (^2)" },
        { el: <Val size={26}>56</Val>, via: "sum" },
      ]}
    />
    <At x={96} y={758} step={3} size={24} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
      ЗГОРТКА
    </At>
    <Flow
      x={290}
      y={730}
      step={3}
      delay={6}
      gap={30}
      arrowW={300}
      items={[{ el: <Val color={C.lav} size={26}>[1..6]</Val> }, { el: <Val size={26}>56</Val>, via: "foldr step 0" }]}
    />
    <At x={96} y={900} w={1720} step={4} delay={14} size={30} weight={600}>
      Конвеєр складено з <A>готових кроків</A>; згортка поєднує ті самі кроки в <A>одній функції</A> кроку.
    </At>
  </Slide>
);

/* 25 · Лаконічний конвеєр із оператором (&) */
const AMP_VALS = ["[3, −2, 5, 0, 4]", "[3, 5, 4]", "[30, 50, 40]", "120"];

const S25: React.FC = () => {
  const { s, t } = useSteps();
  const Y = 300;
  const LH = 48;
  const lineY = (i: number) => Y + i * LH;
  const cur = Math.max(-1, Math.min(3, Math.floor(t(2, 0) / 30)));
  return (
    <Slide title="Лаконічний конвеєр із оператором (&)">
      <Lead>Послідовність обробки читається від джерела до агрегованого результату.</Lead>
      <SyntaxBox x={1100} y={290} w={720} step={1} size={26} title="Оператор (&)" lines={["{x} & {f}  =  {f} {x}", "-- значення ліворуч, функція праворуч"]} />
      {cur >= 0 && (
        <div
          style={{
            position: "absolute",
            left: 80,
            top: lineY(cur + 2) - 4,
            width: 1000,
            height: LH,
            borderRadius: 10,
            background: "rgba(141,118,220,0.16)",
            borderLeft: `4px solid ${C.accentHi}`,
            opacity: clamp01(s(2, 0)) * (1 - clamp01(s(3, 0))),
          }}
        />
      )}
      <Code
        x={96}
        y={Y}
        size={32}
        lh={LH}
        step={1}
        delay={20}
        stagger={8}
        code={`
          import Data.Function ((&))
          readings = [3, -2, 5, 0, 4]
          result = readings
            & filter (> 0)
            & map (* 10)
            & sum   -- 120
        `}
      />
      {AMP_VALS.map((v, i) => {
        const p = s(2, i * 30 + 6, POP);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 660,
              top: lineY(i + 2) - 2,
              opacity: clamp01(p) * (i === 3 ? 1 : mix(1, 0.45, clamp01(s(2, (i + 1) * 30 + 6)))),
              transform: `translateX(${(1 - p) * -30}px)`,
            }}
          >
            <Val size={24} color={i === 3 ? C.mint : C.lav}>
              {v}
            </Val>
          </div>
        );
      })}
      <At x={96} y={668} step={3} size={24} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
        ТЕ САМЕ БЕЗ (&) – ЧИТАЄТЬСЯ ЗСЕРЕДИНИ НАЗОВНІ
      </At>
      <Code x={96} y={712} size={32} step={3} delay={10} code={`result = sum (map (* 10) (filter (> 0) readings))`} />
      <At x={96} y={880} w={1720} step={4} size={30} weight={600}>
        <M>&</M> не додає нових можливостей – лише змінює <A>порядок читання</A>: від джерела до результату.
      </At>
    </Slide>
  );
};

/* 26 · Чисте перетворення та дії IO */
const Terminal: React.FC<{ x: number; y: number; w: number; h: number; p: number; lines: { text: string; p: number }[]; title?: string }> = ({ x, y, w, h, p, lines, title = "термінал" }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 14,
      border: `2px solid ${C.line}`,
      background: "#10131c",
      boxSizing: "border-box",
      overflow: "hidden",
      opacity: clamp01(p),
      transform: `translateY(${(1 - p) * 20}px)`,
    }}
  >
    <div style={{ height: 40, display: "flex", alignItems: "center", gap: 8, padding: "0 16px", background: C.panel, borderBottom: `1px solid ${C.line}` }}>
      {[C.red, C.amber, C.mint].map((c) => (
        <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.8 }} />
      ))}
      <span style={{ marginLeft: 10, fontFamily: F.mono, fontSize: 18, color: C.dim }}>{title}</span>
    </div>
    <div style={{ padding: "14px 22px", fontFamily: F.mono, fontWeight: 600, fontSize: 28, lineHeight: 1.45, color: C.text, whiteSpace: "pre" }}>
      {lines.map((l, i) => (
        <div key={i} style={{ opacity: clamp01(l.p), transform: `translateX(${(1 - clamp01(l.p)) * -14}px)` }}>
          {l.text}
        </div>
      ))}
    </div>
  </div>
);

const S26: React.FC = () => {
  const { s } = useSteps();
  return (
    <Slide title="Чисте перетворення та дії IO">
      <Lead>Чисті функції обчислюють значення; дії IO описують взаємодію із зовнішнім середовищем.</Lead>
      <SyntaxBox x={96} y={330} w={1060} step={1} size={26} lines={["mapM_ {action} {xs}   -- виконати {action} для кожного елемента"]} />
      <Code
        x={96}
        y={456}
        size={30}
        step={1}
        delay={20}
        stagger={8}
        code={`
          numbers = filter (> 0) [3, -2, 5, 0, 4]
          labels  = map show numbers
          main :: IO ()
          main = mapM_ putStrLn labels
        `}
      />
      <Flow
        x={96}
        y={690}
        step={2}
        gap={24}
        arrowW={190}
        items={[
          { el: <Val color={C.lav} size={24}>[3,−2,5,0,4]</Val> },
          { el: <Val color={C.lav} size={24}>[3,5,4]</Val>, via: "filter (> 0)" },
          { el: <Val color={C.lav} size={24}>["3","5","4"]</Val>, via: "map show" },
          { el: <Val color={C.amber} size={24}>IO ()</Val>, via: "mapM_ putStrLn" },
        ]}
      />
      <At x={96} y={790} step={2} delay={30} size={24} weight={600} color={C.lav}>
        чисті значення
      </At>
      <At x={1130} y={790} step={2} delay={80} size={24} weight={600} color={C.amber}>
        дія
      </At>
      <Terminal
        x={1300}
        y={456}
        w={520}
        h={200}
        p={s(3, 0, POP)}
        lines={["3", "5", "4"].map((v, i) => ({ text: `${v}`, p: s(3, 14 + i * 14) }))}
      />
      <At x={96} y={880} w={1720} step={4} size={28} weight={600}>
        <M>mapM_</M> упорядковує виконання дій і відкидає їхні результати. Це <A>не механізм надходження</A> потоку.
      </At>
    </Slide>
  );
};

/* 27 · Згортка з перевіркою: foldM */
const R: React.FC<{ v: string }> = ({ v }) => (
  <Ctx label="Right" color={C.mint} size={22}>
    <Val size={22}>{v}</Val>
  </Ctx>
);
const L: React.FC = () => (
  <Ctx label="Left" color={C.red} size={22}>
    <Val size={18} color={C.red}>
      "Некоректне…"
    </Val>
  </Ctx>
);

const S27: React.FC = () => (
  <Slide title="Згортка з перевіркою: foldM">
    <Lead>
      Кожний крок може повертати результат або повідомлення про помилку в контексті <M c={C.lav}>Either</M>.
    </Lead>
    <SyntaxBox x={1100} y={330} w={720} step={1} size={24} lines={["foldM {step} {z} {xs}", "-- {step} :: {b} -> {a} -> m {b}"]} />
    <Code
      x={96}
      y={330}
      size={30}
      step={1}
      delay={20}
      stagger={8}
      code={`
        import Control.Monad (foldM)
        addValid acc x
          | x >= 0    = Right (acc + x)
          | otherwise = Left "Некоректне значення"
        validTotal = foldM addValid 0
      `}
    />
    <Code x={96} y={590} size={28} step={2} code={`validTotal [3,5,2]`} />
    <Flow
      x={96}
      y={632}
      step={2}
      delay={10}
      gap={22}
      arrowW={110}
      items={[{ el: <R v="0" /> }, { el: <R v="3" />, via: "+ 3" }, { el: <R v="8" />, via: "+ 5" }, { el: <R v="10" />, via: "+ 2" }]}
    />
    <Code x={96} y={736} size={28} step={3} code={`validTotal [3,-1,2]`} />
    <Flow
      x={96}
      y={780}
      step={3}
      delay={10}
      gap={22}
      arrowW={110}
      items={[{ el: <R v="0" /> }, { el: <R v="3" />, via: "+ 3" }, { el: <L />, via: "−1" }, { el: <L />, via: "2", skip: true }]}
    />
    <At x={96} y={900} w={1720} step={4} size={30} weight={600}>
      Перший <M c={C.red}>Left</M> зупиняє накопичення: подальші кроки <A>не виконуються</A>.
    </At>
  </Slide>
);

/* 28 · Цілісна програма: опрацювання вимірювань */
const STAGES = [
  { t: "Читання рядків", io: true },
  { t: "Розпізнавання чисел", io: false },
  { t: "Відбір додатних", io: false },
  { t: "Наростаючі підсумки", io: false },
  { t: "Виведення звіту", io: true },
];

const S28: React.FC = () => {
  const { s, t } = useSteps();
  const BW = 300;
  const GAP = 57;
  const Y = 470;
  const BH = 150;
  const x = (i: number) => 96 + i * (BW + GAP);
  const runT = t(2, 0);
  const brace = (x1: number, x2: number, y: number, p: number, color: string, label: string) => (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: clamp01(p) }}>
        <path d={`M ${x1} ${y} L ${x1} ${y + 16} L ${x2} ${y + 16} L ${x2} ${y}`} fill="none" stroke={color} strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", left: x1, width: x2 - x1, top: y + 28, textAlign: "center", fontFamily: F.body, fontWeight: 700, fontSize: 26, color, opacity: clamp01(p) }}>{label}</div>
    </>
  );
  return (
    <Slide title="Цілісна програма: опрацювання вимірювань">
      <Lead>Файл містить цілі значення по одному на рядок. Програма формує звіт для перших п’яти допустимих показників.</Lead>
      {STAGES.map((st, i) => {
        const p = s(1, i * 8, POP);
        const hot = runT > 0 ? Math.max(0, 1 - Math.abs(((runT - i * 22) % 140) - 10) / 14) : 0;
        const color = st.io ? C.amber : C.lav;
        return (
          <React.Fragment key={st.t}>
            <div
              style={{
                position: "absolute",
                left: x(i),
                top: Y,
                width: BW,
                height: BH,
                borderRadius: 18,
                border: `3px solid ${color}`,
                background: C.panel,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: hot > 0.02 ? `0 0 ${30 * hot}px ${color}` : undefined,
                opacity: clamp01(p),
                transform: `translateY(${(1 - p) * 24}px)`,
              }}
            >
              <Num n={i + 1} size={40} />
              <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 28, color: C.text, textAlign: "center", padding: "0 16px", lineHeight: 1.2 }}>{st.t}</div>
            </div>
            {i < STAGES.length - 1 && <Arrow x1={x(i) + BW + 6} y1={Y + BH / 2} x2={x(i + 1) - 8} y2={Y + BH / 2} step={1} delay={10 + i * 8} dur={10} color={C.dim} width={3} />}
          </React.Fragment>
        );
      })}
      {brace(x(1), x(3) + BW, Y + BH + 24, s(3, 0), C.lav, "чиста функція report")}
      {brace(x(0), x(0) + BW, Y + BH + 24, s(3, 12), C.amber, "IO у main")}
      {brace(x(4), x(4) + BW, Y + BH + 24, s(3, 12), C.amber, "IO у main")}
      <At x={96} y={880} w={1720} step={4} size={30} weight={600}>
        Окрема чиста функція <M>report</M> формує текст звіту; <M>main</M> лише читає файл і виводить результат.
      </At>
    </Slide>
  );
};

/* 29 · Підготовка і форматування даних */
const S29: React.FC = () => {
  const { s } = useSteps();
  const pop = (st: number, d: number) => {
    const p = s(st, d, POP);
    return { opacity: clamp01(p), transform: `scale(${mix(0.7, 1, p)})`, transformOrigin: "left center" } as React.CSSProperties;
  };
  return (
    <Slide title="Підготовка і форматування даних">
      <Lead>
        <M>parseReading</M> застосовує <M>readMaybe</M> до <M c={C.lav}>Int</M>: коректне число дає <M c={C.lav}>Just</M>, некоректний рядок – <M c={C.lav}>Nothing</M>.
      </Lead>
      <SyntaxBox
        x={1080}
        y={340}
        w={740}
        step={1}
        size={24}
        title="Безпечне читання"
        lines={["readMaybe {s} :: Maybe {T}", "mapMaybe {f} {xs}   -- лише значення з Just"]}
      />
      <Code
        x={96}
        y={340}
        size={28}
        lh={42}
        step={1}
        delay={20}
        stagger={6}
        code={`
          import Data.Function ((&))
          import Data.Maybe (mapMaybe)
          import Text.Read (readMaybe)

          parseReading :: String -> Maybe Int
          parseReading = readMaybe

          @3 formatLine :: Int -> Int -> String
          @3 formatLine i total =
          @3   show i ++ ". Підсумок: " ++ show total
        `}
      />
      <Code x={1080} y={540} size={28} step={2} code={`parseReading "42"`} />
      <div style={{ position: "absolute", left: 1440, top: 532, ...pop(2, 14) }}>
        <Ctx label="Just" color={C.mint} size={22}>
          <Val size={22}>42</Val>
        </Ctx>
      </div>
      <Code x={1080} y={630} size={28} step={2} delay={30} code={`parseReading "4x"`} />
      <div style={{ position: "absolute", left: 1440, top: 622, ...pop(2, 44) }}>
        <Ctx label="Nothing" color={C.faint} empty size={22} />
      </div>
      <Code x={1080} y={740} size={28} step={3} delay={30} code={`formatLine 3 12`} />
      <div style={{ position: "absolute", left: 1080, top: 792, ...pop(3, 44) }}>
        <Val size={24} color={C.amber}>
          "3. Підсумок: 12"
        </Val>
      </div>
    </Slide>
  );
};

/* 30 · Чиста функція report */
const REPORT_VALS = [
  `"3\\n5\\n-2\\n4\\n2\\n9"`,
  `["3","5","-2","4","2","9"]`,
  "[3,5,-2,4,2,9]",
  "[3,5,4,2,9]",
  "[3,5,4,2,9]",
  "[0,3,8,12,14,23]",
  "[3,8,12,14,23]",
  `["1. Підсумок: 3", …]`,
];
const RV_GAP = 34;

const S30: React.FC = () => {
  const { s, t } = useSteps();
  const Y = 330;
  const LH = 48;
  const lineY = (i: number) => Y + i * LH;
  const cur = Math.max(-1, Math.min(REPORT_VALS.length - 1, Math.floor(t(2, 0) / RV_GAP)));
  return (
    <Slide title="Чиста функція report">
      <Lead>Послідовність перетворень без явних циклів, присвоювань і ручного керування обходом.</Lead>
      {cur >= 0 && (
        <div
          style={{
            position: "absolute",
            left: 80,
            top: lineY(cur + 2) - 4,
            width: 1740,
            height: LH,
            borderRadius: 10,
            background: "rgba(141,118,220,0.14)",
            borderLeft: `4px solid ${C.accentHi}`,
            opacity: clamp01(s(2, 0)) * (1 - clamp01(s(3, 0))),
          }}
        />
      )}
      <Code
        x={96}
        y={Y}
        size={30}
        lh={LH}
        step={1}
        stagger={6}
        code={`
          report :: String -> [String]
          report input =
            input
              & lines
              & mapMaybe parseReading
              & filter (> 0)
              & take 5
              & scanl (+) 0
              & tail
              & zipWith formatLine [1..]
        `}
      />
      {REPORT_VALS.map((v, i) => {
        const p = s(2, i * RV_GAP + 6, POP);
        const old = clamp01(s(2, (i + 1) * RV_GAP + 6));
        const last = i === REPORT_VALS.length - 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 920,
              top: lineY(i + 2) + 2,
              fontFamily: F.mono,
              fontWeight: 600,
              fontSize: 27,
              color: last ? C.mint : C.amber,
              whiteSpace: "pre",
              fontVariantLigatures: "none",
              opacity: clamp01(p) * (last ? 1 : mix(1, 0.5, old)),
              transform: `translateX(${(1 - p) * -24}px)`,
            }}
          >
            {v}
          </div>
        );
      })}
      <At x={920} y={lineY(1) + 4} step={2} size={22} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
        ЗНАЧЕННЯ ПІСЛЯ КРОКУ
      </At>
      <At x={96} y={880} w={1720} step={3} size={30} weight={600}>
        Кожний рядок – окремий крок конвеєра; <M>&</M> передає результат попереднього кроку наступному.
      </At>
    </Slide>
  );
};

/* 31 · Ввід-вивід і результат */
const FILE = ["3", "5", "-2", "4", "2", "9"];
const OUT = [3, 8, 12, 14, 23];

const S31: React.FC = () => {
  const { s, lin } = useSteps();
  const pulse = lin(2, 0, 50);
  return (
    <Slide title="Ввід-вивід і результат">
      <Lead>
        У програмі побічні ефекти локалізовано в <M>main</M>.
      </Lead>
      <SyntaxBox x={1100} y={280} w={720} step={1} size={24} lines={["{x} <- readFile {path}", "-- {x} :: String, увесь вміст файлу"]} />
      <Code
        x={96}
        y={290}
        size={32}
        step={1}
        delay={20}
        stagger={8}
        code={`
          main :: IO ()
          main = do
            input <- readFile "measurements.txt"
            mapM_ putStrLn (report input)
        `}
      />
      <Terminal x={96} y={520} w={340} h={360} p={s(2, 0, POP)} title="measurements.txt" lines={FILE.map((v) => ({ text: v, p: s(2, 4) }))} />
      <Arrow x1={452} y1={700} x2={640} y2={700} step={2} delay={20} dur={14} color={C.dim} width={3} />
      <div
        style={{
          position: "absolute",
          left: 656,
          top: 650,
          width: 260,
          height: 100,
          borderRadius: 18,
          border: `3px solid ${C.lav}`,
          background: C.panel,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: F.mono,
          fontWeight: 700,
          fontSize: 34,
          color: C.lav,
          boxShadow: pulse > 0 && pulse < 1 ? `0 0 ${30 * Math.sin(pulse * Math.PI)}px ${C.lav}` : undefined,
          opacity: clamp01(s(2, 26, POP)),
        }}
      >
        report
      </div>
      <Arrow x1={932} y1={700} x2={1110} y2={700} step={2} delay={50} dur={14} color={C.dim} width={3} />
      <Terminal
        x={1126}
        y={520}
        w={694}
        h={360}
        p={s(2, 56, POP)}
        lines={OUT.map((v, i) => ({ text: `${i + 1}. Підсумок: ${v}`, p: s(2, 70 + i * 14) }))}
      />
      <At x={96} y={910} w={1720} step={3} size={28} weight={600}>
        Значення <M>−2</M> відфільтровано; кожний рядок звіту – наростаюча сума допустимих показників.
      </At>
    </Slide>
  );
};

/* 32 · Haskell у сучасних ETL-конвеєрах */
const BEFORE = [
  ["A", "3"],
  ["B", "5"],
  ["A", "4"],
  ["B", "2"],
];

const S32: React.FC = () => {
  const { s } = useSteps();
  const etl = ["Extract", "Transform", "Load"];
  const rowY = (i: number) => 556 + i * 58;
  const group = s(3, 20);
  const agg = s(3, 60, POP);
  const target = (i: number) => (BEFORE[i][0] === "A" ? 0 : 1);
  return (
    <Slide title="Haskell у сучасних ETL-конвеєрах">
      <Lead>
        Haskell може реалізовувати етап перетворення даних у ширшому процесі <A>Extract → Transform → Load</A>.
      </Lead>
      {etl.map((e, i) => {
        const p = s(1, i * 10, POP);
        const hot = i === 1;
        return (
          <React.Fragment key={e}>
            <div
              style={{
                position: "absolute",
                left: 400 + i * 400,
                top: 330,
                width: 320,
                height: 90,
                borderRadius: 16,
                border: `3px solid ${hot ? C.accentHi : C.line}`,
                background: hot ? "rgba(141,118,220,0.16)" : C.panel,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                fontFamily: F.body,
                fontWeight: 800,
                fontSize: 32,
                color: hot ? C.text : C.dim,
                opacity: clamp01(p),
                transform: `scale(${mix(0.8, 1, p)})`,
              }}
            >
              {hot && <HaskellLogo size={40} />}
              {e}
            </div>
            {i < 2 && <Arrow x1={400 + i * 400 + 330} y1={375} x2={400 + (i + 1) * 400 - 12} y2={375} step={1} delay={8 + i * 10} dur={10} color={C.dim} width={3} />}
          </React.Fragment>
        );
      })}
      <SyntaxBox x={96} y={470} w={860} step={2} size={24} title="Оператор (|>)" lines={["{x} |> {f}  =  {f} {x}   -- як (&)"]} />
      <Code
        x={96}
        y={596}
        size={28}
        lh={42}
        step={2}
        delay={20}
        stagger={8}
        code={`
          df
            |> D.groupBy ["sensor"]
            |> D.aggregate
                 [F.sum (F.col @Int "value")
                   \`as\` "total"]
        `}
      />
      <At x={1120} y={496} step={3} size={22} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
        (sensor, value)
      </At>
      {BEFORE.map((r, i) => {
        const sortedIdx = [0, 2, 1, 3].indexOf(i);
        const y = mix(rowY(i), rowY(sortedIdx), group);
        const fade = 1 - clamp01(agg);
        return (
          <div key={i} style={{ position: "absolute", left: 1120, top: y, display: "flex", gap: 12, opacity: clamp01(s(3, i * 4)) * mix(1, 0.35, 1 - fade) }}>
            <Val size={24} color={target(i) === 0 ? C.lav : C.amber}>
              {r[0]}
            </Val>
            <Val size={24} color={C.mint}>
              {r[1]}
            </Val>
          </div>
        );
      })}
      <Arrow x1={1330} y1={666} x2={1460} y2={666} step={3} delay={50} dur={12} color={C.dim} width={3} />
      {[
        ["A", "7"],
        ["B", "7"],
      ].map((r, i) => (
        <div key={i} style={{ position: "absolute", left: 1490, top: 608 + i * 80, display: "flex", gap: 12, opacity: clamp01(agg), transform: `scale(${mix(0.7, 1, agg)})` }}>
          <Val size={26} color={i === 0 ? C.lav : C.amber}>
            {r[0]}
          </Val>
          <Val size={26} color={C.mint}>
            {r[1]}
          </Val>
        </div>
      ))}
      <At x={1490} y={566} step={3} delay={60} size={22} weight={800} color={C.dim} style={{ letterSpacing: 1 }}>
        (sensor, total)
      </At>
      <At x={96} y={880} w={1720} step={4} size={26} weight={600} color={C.dim}>
        DataHaskell DataFrame: групування й агрегація таблиці. Приклад стилю API; бібліотека потребує відповідних імпортів і типів стовпців.
      </At>
    </Slide>
  );
};

/* 33 · Підсумок */
const POINTS = [
  { t: "Потоки", d: "джерела, перетворення, споживачі" },
  { t: "Моделі", d: "DFD та граф залежностей" },
  { t: "Haskell", d: "ліниві потоки та функційні операції" },
  { t: "Згортки", d: "спільна основа map, filter, агрегатів" },
  { t: "Конвеєри", d: "чисті перетворення та впорядковані ефекти" },
];

const S33: React.FC = () => {
  const { s } = useSteps();
  return (
    <Slide>
      <div style={{ position: "absolute", right: 90, top: 90, opacity: 0.22 * s(0, 10) }}>
        <HaskellLogo size={380} p1={s(0, 4, POP)} p2={s(0, 10, POP)} p3={s(0, 16, POP)} />
      </div>
      <At x={130} y={140} step={0} delay={4} size={76} weight={800} font={F.head}>
        Підсумок
      </At>
      {POINTS.map((p, i) => {
        const a = s(0, 16 + i * 10, POP);
        return (
          <div
            key={p.t}
            style={{
              position: "absolute",
              left: 170,
              top: 300 + i * 112,
              display: "flex",
              alignItems: "center",
              gap: 30,
              opacity: clamp01(a),
              transform: `translateX(${(1 - a) * -30}px)`,
            }}
          >
            <Num n={i + 1} size={56} />
            <div style={{ width: 260, fontFamily: F.body, fontWeight: 800, fontSize: 40, color: C.text }}>{p.t}</div>
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 36, color: C.dim }}>{p.d}</div>
          </div>
        );
      })}
    </Slide>
  );
};

export const p5Slides: SlideDef[] = [
  { id: "pipeline-vs-fold", title: "Конвеєр і згортка", steps: [40, 80, 110, 80, 60], C: S24 },
  { id: "amp", title: "Оператор (&)", steps: [40, 80, 140, 70, 60], C: S25 },
  { id: "pure-io", title: "Чисте та IO", steps: [40, 70, 120, 70, 60], C: S26 },
  { id: "foldm", title: "foldM", steps: [40, 70, 100, 100, 60], C: S27 },
  { id: "program", title: "Цілісна програма", steps: [40, 70, 150, 50, 60], C: S28 },
  { id: "parse-format", title: "Підготовка даних", steps: [40, 70, 70, 80], C: S29 },
  { id: "report", title: "Функція report", steps: [40, 80, REPORT_VALS.length * RV_GAP + 40, 60], C: S30 },
  { id: "main", title: "Ввід-вивід", steps: [30, 70, 160, 60], C: S31 },
  { id: "etl", title: "ETL", steps: [40, 50, 70, 110, 60], C: S32 },
];
export const summarySlide: SlideDef = { id: "summary", title: "Підсумок", steps: [110], C: S33 };
