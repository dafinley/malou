import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Molou · Model Training Visualizer";
export const dynamic = "force-static";

const BG = "#11110f";
const TEXT = "#f5f1e8";
const MUTED = "#b8b0a3";
const CYAN = "#55d6be";
const AMBER = "#f1bb55";
const VIOLET = "#aa8df6";
const GREEN = "#8bd46e";
const RED = "#f16f60";

function PathwayChip({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 18px",
        border: `1px solid ${color}`,
        borderRadius: 999,
        background: `${color}22`,
        color: TEXT,
        fontFamily: "monospace",
        fontSize: 22
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: 999, background: color }} />
      {label}
    </div>
  );
}

function BrandMark() {
  return (
    <svg width="44" height="44" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="6" fill={BG} />
      <path
        d="M 7 26 L 7 6 L 16 16 L 25 6 L 25 26"
        stroke="#a8a8a6"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="6" r="3" fill="#d896c4" />
      <circle cx="25" cy="6" r="3" fill="#d896c4" />
      <circle cx="16" cy="16" r="3" fill="#7cc7e8" />
      <circle cx="7" cy="26" r="3" fill="#d896c4" />
      <circle cx="25" cy="26" r="3" fill="#d896c4" />
      <circle cx="16" cy="16" r="1.1" fill="#f4f2ee" />
    </svg>
  );
}

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "72px 80px",
        background: BG,
        color: TEXT,
        fontFamily: "sans-serif"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          color: MUTED,
          fontFamily: "monospace",
          fontSize: 20,
          letterSpacing: 2,
          textTransform: "uppercase"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 8
          }}
        >
          <BrandMark />
        </div>
        molou · machine learning, made legible
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginTop: 40
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 600, lineHeight: 1, letterSpacing: -2 }}>
          Model training,
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: -2,
            color: MUTED
          }}
        >
          visualized.
        </div>
      </div>

      <div
        style={{
          color: MUTED,
          fontSize: 28,
          lineHeight: 1.4,
          marginTop: 32,
          maxWidth: 940
        }}
      >
        What moves, what stays frozen, where memory goes — for full training, LoRA, QLoRA,
        distillation, and RL.
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginTop: "auto"
        }}
      >
        <PathwayChip label="full training" color={RED} />
        <PathwayChip label="LoRA" color={CYAN} />
        <PathwayChip label="QLoRA" color={VIOLET} />
        <PathwayChip label="distillation" color={AMBER} />
        <PathwayChip label="RL" color={GREEN} />
      </div>
    </div>,
    { ...size }
  );
}
