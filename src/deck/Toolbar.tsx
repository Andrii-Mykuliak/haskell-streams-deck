import React, { useState } from "react";
import { CircleDot, Eraser, Flashlight, Highlighter, Moon, Pen, Sun } from "lucide-react";
import { INK, Screen, Tool } from "./Presenter";
import { C } from "./theme";

const Btn: React.FC<{ active?: boolean; title: string; onClick: () => void; children: React.ReactNode }> = ({ active, title, onClick, children }) => (
  <button
    title={title}
    aria-label={title}
    aria-pressed={active}
    onClick={onClick}
    style={{
      width: 40,
      height: 40,
      borderRadius: 10,
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: active ? C.bg : C.text,
      background: active ? C.accentHi : "transparent",
      transition: "background 150ms ease, color 150ms ease",
    }}
  >
    {children}
  </button>
);

const Sep = () => <div style={{ width: 1, height: 24, background: C.line, margin: "0 4px" }} />;

/** Always-visible presenter toolbar. Clicks on it never advance the slides. */
export const Toolbar: React.FC<{
  tool: Tool;
  setTool: (t: Tool) => void;
  ink: number;
  setInk: (i: number) => void;
  screen: Screen;
  setScreen: (s: Screen) => void;
  onClear: () => void;
}> = ({ tool, setTool, ink, setInk, screen, setScreen, onClear }) => {
  const [hover, setHover] = useState(false);
  const toggle = (t: Tool) => setTool(tool === t ? "none" : t);
  const toggleScreen = (s: Screen) => setScreen(screen === s ? "none" : s);
  const drawing = tool === "pen" || tool === "highlighter";
  const size = 20;
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      // keep focus off the buttons so Space / Enter still drive the slides
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "absolute",
        left: "50%",
        bottom: 12,
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: 6,
        borderRadius: 14,
        background: "rgba(20,23,34,0.85)",
        border: `1px solid ${C.line}`,
        boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
        opacity: hover ? 1 : 0,
        transition: "opacity 200ms ease",
        cursor: "default",
        zIndex: 10,
      }}
    >
      <Btn title="Лазерна указка (l)" active={tool === "laser"} onClick={() => toggle("laser")}>
        <CircleDot size={size} />
      </Btn>
      <Btn title="Прожектор (s) – коліщатко змінює розмір" active={tool === "spotlight"} onClick={() => toggle("spotlight")}>
        <Flashlight size={size} />
      </Btn>
      <Btn title="Перо (d)" active={tool === "pen"} onClick={() => toggle("pen")}>
        <Pen size={size} />
      </Btn>
      <Btn title="Маркер, що зникає (m)" active={tool === "highlighter"} onClick={() => toggle("highlighter")}>
        <Highlighter size={size} />
      </Btn>
      <Sep />
      {INK.map((c, i) => (
        <button
          key={c.c}
          title={`Колір: ${c.name} (${i + 1})`}
          aria-label={`Колір: ${c.name}`}
          aria-pressed={ink === i}
          onClick={() => {
            setInk(i);
            if (!drawing) setTool("pen");
          }}
          style={{
            width: 22,
            height: 22,
            margin: "0 3px",
            borderRadius: 11,
            cursor: "pointer",
            background: c.c,
            border: "none",
            outline: ink === i ? `2px solid ${C.text}` : "none",
            outlineOffset: 3,
            opacity: drawing ? 1 : 0.55,
          }}
        />
      ))}
      <Btn title="Стерти малюнки (c)" onClick={onClear}>
        <Eraser size={size} />
      </Btn>
      <Sep />
      <Btn title="Чорний екран (b)" active={screen === "black"} onClick={() => toggleScreen("black")}>
        <Moon size={size} />
      </Btn>
      <Btn title="Білий екран (w)" active={screen === "white"} onClick={() => toggleScreen("white")}>
        <Sun size={size} />
      </Btn>
    </div>
  );
};
