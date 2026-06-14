import { ImageResponse } from "next/og"

export const alt = "LumarSoft — Desarrollo Web y Software a Medida"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const BRAND = "#DA8037"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#09090b",
          padding: "72px",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(218,128,55,0.18), transparent 55%)",
        }}
      >
        {/* Top row: location chip */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              border: "1px solid #27272a",
              borderRadius: "9999px",
              padding: "10px 22px",
              color: "#a1a1aa",
              fontSize: "26px",
            }}
          >
            <div style={{ width: "12px", height: "12px", borderRadius: "9999px", background: "#22c55e" }} />
            Rosario, Argentina
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: "84px", fontWeight: 800, color: "#fafafa", lineHeight: 1.05 }}>
            Software que se entrega.
          </div>
          <div style={{ display: "flex", fontSize: "84px", fontWeight: 800, color: "#71717a", lineHeight: 1.05 }}>
            No que se promete.
          </div>
          <div style={{ display: "flex", marginTop: "28px", fontSize: "32px", color: "#a1a1aa" }}>
            Desarrollo web y software a medida. Sin intermediarios, sin vueltas.
          </div>
        </div>

        {/* Footer: wordmark + accent */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: "40px", fontWeight: 700, color: "#fafafa" }}>
            Lumar<span style={{ color: BRAND }}>Soft</span>
          </div>
          <div style={{ display: "flex", width: "120px", height: "6px", borderRadius: "9999px", background: BRAND }} />
        </div>
      </div>
    ),
    { ...size }
  )
}
