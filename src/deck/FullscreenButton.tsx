import React, { useEffect, useState } from "react";
import { ExternalLink, Maximize, Minimize } from "lucide-react";
import { C } from "./theme";

const openInNewTab = () => window.open(window.location.href, "_blank", "noopener");

/** Toggles fullscreen; inside an iframe that forbids fullscreen it opens the deck in a new tab instead. */
export const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
    return;
  }
  if (!document.fullscreenEnabled) {
    openInNewTab();
    return;
  }
  document.documentElement.requestFullscreen().catch(openInNewTab);
};

/** Corner button that appears only while the pointer is near the bottom-right corner. */
export const FullscreenButton: React.FC = () => {
  const [hover, setHover] = useState(false);
  const [full, setFull] = useState(() => !!document.fullscreenElement);

  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enabled = document.fullscreenEnabled;
  const title = full ? "Вийти з повного екрана (f)" : enabled ? "На весь екран (f)" : "Відкрити в новій вкладці (f)";
  const Icon = full ? Minimize : enabled ? Maximize : ExternalLink;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "absolute",
        right: 0,
        bottom: 14,
        width: 130,
        height: 110,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: "0 18px 10px 0",
        boxSizing: "border-box",
        zIndex: 10,
      }}
    >
      <button
        title={title}
        aria-label={title}
        onClick={(e) => {
          e.stopPropagation();
          toggleFullscreen();
        }}
        onContextMenu={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          border: `1px solid ${C.line}`,
          background: "rgba(20,23,34,0.85)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
          color: C.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          opacity: hover ? 1 : 0,
          transition: "opacity 200ms ease",
        }}
      >
        <Icon size={22} />
      </button>
    </div>
  );
};
