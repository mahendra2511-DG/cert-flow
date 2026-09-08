import { ImageResponse } from "next/og";

export const alt = "PrepHarbor — certification practice tests";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f3d38 0%, #163a2e 42%, #f4efe4 100%)",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#d7efe8",
          }}
        >
          PrepHarbor
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              lineHeight: 1.1,
              fontWeight: 650,
              color: "#f8f5ef",
              maxWidth: 900,
            }}
          >
            Sit a realistic practice exam.
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#e4ddd0", maxWidth: 820 }}>
            Original certification practice tests with timed sittings, scores, and explanations.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
