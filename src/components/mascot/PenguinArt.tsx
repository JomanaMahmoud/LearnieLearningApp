import { useId } from "react";
import { PENGUIN_TRACE as TRACE } from "./penguin.paths";
import { PENGUIN_GRAIN_SIZE, PENGUIN_GRAIN_URI } from "./penguin.grain";
import type { MascotPose } from "./moods";
import "./penguin.css";

/**
 * Pip the penguin: a layered, animatable SVG rebuilt from the supplied illustration
 * (docs/mascot/penguin-reference.jpg). Shapes come from scripts/mascot/trace.mjs; eyes,
 * closed-eye arcs and the duck's eye are hand-built so they can move independently.
 *
 * Every moving part is two nested groups: `*-pose` (static pose per state, eased by CSS
 * transitions) and `*-loop` (keyframes). All coordinates are absolute viewBox units, so
 * `transform-origin` pivots in px map straight onto the artwork. Animation is pure CSS.
 */

// viewBox height is nudged so width:height is exactly 160:170, the ratio the owl used.
export const PENGUIN_VIEWBOX = { w: TRACE.viewBox.w, h: (TRACE.viewBox.w * 170) / 160 } as const;
export const PENGUIN_ASPECT = 170 / 160;

type PartKey = keyof typeof TRACE.parts;

/** Grain tile edge in viewBox units: 1.6 viewBox units per tile pixel matches the reference's hatch scale. */
const GRAIN_UNITS = Math.round(PENGUIN_GRAIN_SIZE * 1.6);

/** Layers that receive the crayon-hatch grain (full detail only). */
const TEXTURED = new Set([
  "body.fill",
  "head.fill",
  "wingL.fill",
  "wingR.fill",
  "wingL.highlight",
  "wingR.highlight",
  "footL.fill",
  "footR.fill",
  "beak.fill",
  "mouth.fill",
]);

export type PenguinArtProps = {
  /** `reference` is the untouched illustration pose, used by the preview lab for comparison. */
  pose?: MascotPose | "reference";
  /** Rendered width in px. Height follows the 160:170 ratio. */
  size?: number;
  className?: string;
  /** Change this number to restart the burst animations (hop, wave, sparkle pop). */
  replayKey?: number;
  /** `auto` drops grain and ambient loops below 64px. */
  detail?: "auto" | "full" | "lite";
  /** When false, loops and transitions are frozen (poses still apply). */
  animate?: boolean;
  /** Force reduced-motion behaviour (the lab uses this; real users get the media query). */
  reduced?: boolean;
  /** Debug: layers to hide, e.g. ['head', 'wings']. */
  hide?: readonly string[];
  /**
   * Thin cream outline around the strap and duck, for placing Pip on a yellow surface where
   * yellow-on-yellow loses contrast. It lives inside the strap/duck groups so it moves with them.
   */
  halo?: boolean;
  title?: string;
};

const HALO_COLOR = "#fff9ec";
/** Total stroke width in viewBox units; half of it shows outside the shape (about 2px at 110px). */
const HALO_WIDTH = 26;

/** Cream underlay built from the first (silhouette) layer of each given part. */
function Halo({ parts }: { parts: readonly PartKey[] }) {
  return (
    <g
      className="pip-halo"
      fill={HALO_COLOR}
      stroke={HALO_COLOR}
      strokeWidth={HALO_WIDTH}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {parts.map((part) => {
        const first = (TRACE.parts[part] as { layers?: readonly { d: string }[] }).layers?.[0];
        return first ? <path key={part} d={first.d} /> : null;
      })}
    </g>
  );
}

function Layers({ part, ids }: { part: PartKey; ids: Record<string, string> | null }) {
  const layers =
    (TRACE.parts[part] as { layers?: readonly { id: string; fill: string; d: string }[] }).layers ??
    [];
  return (
    <>
      {layers.map((l) => {
        const key = `${part}.${l.id}`;
        const fill = ids && TEXTURED.has(key) ? `url(#${ids[key]})` : l.fill;
        return <path key={l.id} d={l.d} fill={fill} />;
      })}
    </>
  );
}

const EYE = {
  L: {
    iris: { cx: 249, cy: 242, rx: 35, ry: 43 },
    pupil: { cx: 256.5, cy: 241.2, rx: 32, ry: 27.5, rot: 70.9 },
    big: { cx: 265.4, cy: 225.1, rx: 8.2, ry: 8.2 },
    small: { cx: 272.8, cy: 239.6, rx: 3, ry: 3 },
    tiny: null,
    glint: { cx: 239.7, cy: 255, rx: 12, ry: 6.5, rot: -20 },
    arc: "M212 258 Q249 214 286 258",
  },
  R: {
    iris: { cx: 510.6, cy: 230.8, rx: 36, ry: 42 },
    pupil: { cx: 502.4, cy: 231.4, rx: 31, ry: 28.3, rot: -85.1 },
    big: { cx: 500.1, cy: 215.7, rx: 6.4, ry: 5.4 },
    small: { cx: 516.4, cy: 227.3, rx: 4.2, ry: 3.1 },
    tiny: { cx: 492.3, cy: 210, rx: 2.4, ry: 1.5 },
    glint: { cx: 524, cy: 247, rx: 12, ry: 6.5, rot: 25 },
    arc: "M474 247 Q511 203 548 247",
  },
} as const;

function Eye({ side, uid }: { side: "L" | "R"; uid: string }) {
  const e = EYE[side];
  const origin = { transformOrigin: `${e.iris.cx}px ${e.iris.cy}px` };
  return (
    <g className={`pip-eye pip-eye-${side.toLowerCase()}`}>
      <g className="pip-eyes-open">
        <g
          className="pip-blink"
          style={{ ...origin, animationDelay: side === "R" ? "0.06s" : "0s" }}
        >
          <ellipse
            cx={e.iris.cx}
            cy={e.iris.cy}
            rx={e.iris.rx}
            ry={e.iris.ry}
            fill={`url(#${uid}-iris)`}
          />
          <g className="pip-glance" style={{ animationDelay: side === "R" ? "-0.4s" : "0s" }}>
            <g className="pip-look">
              <ellipse
                cx={e.pupil.cx}
                cy={e.pupil.cy}
                rx={e.pupil.rx}
                ry={e.pupil.ry}
                transform={`rotate(${e.pupil.rot} ${e.pupil.cx} ${e.pupil.cy})`}
                fill="#372f32"
              />
              <ellipse
                cx={e.glint.cx}
                cy={e.glint.cy}
                rx={e.glint.rx}
                ry={e.glint.ry}
                transform={`rotate(${e.glint.rot} ${e.glint.cx} ${e.glint.cy})`}
                fill="#3f6ea8"
                opacity="0.42"
              />
            </g>
            <g className="pip-hl">
              <ellipse cx={e.big.cx} cy={e.big.cy} rx={e.big.rx} ry={e.big.ry} fill="#fff" />
              <ellipse
                cx={e.small.cx}
                cy={e.small.cy}
                rx={e.small.rx}
                ry={e.small.ry}
                fill="#fff"
              />
              {e.tiny && (
                <ellipse
                  cx={e.tiny.cx}
                  cy={e.tiny.cy}
                  rx={e.tiny.rx}
                  ry={e.tiny.ry}
                  fill="#fff"
                  opacity="0.9"
                />
              )}
            </g>
          </g>
          {/* lower lid: hidden below the iris except in warm poses (--lid), where it lifts into a gentle smile */}
          <clipPath id={`${uid}-iris-${side}`}>
            <ellipse cx={e.iris.cx} cy={e.iris.cy} rx={e.iris.rx} ry={e.iris.ry} />
          </clipPath>
          <g clipPath={`url(#${uid}-iris-${side})`}>
            <ellipse
              className="pip-lid"
              transform="translate(0 80)"
              cx={e.iris.cx}
              cy={e.iris.cy + e.iris.ry * 0.97}
              rx={e.iris.rx * 1.35}
              ry={e.iris.ry * 0.58}
              fill="#fcf8f3"
            />
          </g>
        </g>
      </g>
      <path
        className="pip-eyes-closed"
        d={e.arc}
        fill="none"
        stroke="#372f32"
        strokeWidth="13"
        strokeLinecap="round"
        opacity="0"
      />
    </g>
  );
}

export function PenguinArt({
  pose = "idle",
  size = 220,
  className,
  replayKey = 0,
  detail = "auto",
  animate = true,
  reduced = false,
  hide,
  halo = false,
  title,
}: PenguinArtProps) {
  const uid = "pip" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const lite = detail === "lite" || (detail === "auto" && size < 64);
  const ids = lite
    ? null
    : Object.fromEntries([...TEXTURED].map((k) => [k, `${uid}-${k.replace(".", "-")}`]));
  const g = TRACE.parts.shadow.ellipse;
  const spark0 = TRACE.parts.sparkle0.bbox;
  const spark1 = TRACE.parts.sparkle1.bbox;
  const sparkOrigin = (b: { x0: number; y0: number; x1: number; y1: number }) => ({
    transformOrigin: `${(b.x0 + b.x1) / 2}px ${(b.y0 + b.y1) / 2}px`,
  });
  const duckEye = TRACE.parts.duckEye;

  return (
    <svg
      viewBox={`0 0 ${PENGUIN_VIEWBOX.w} ${PENGUIN_VIEWBOX.h}`}
      width={size}
      height={size * PENGUIN_ASPECT}
      className={["pip", reduced ? "pip--reduced" : "", className].filter(Boolean).join(" ")}
      data-pose={pose}
      data-detail={lite ? "lite" : "full"}
      data-animate={animate ? "true" : "false"}
      data-hide={hide?.join(" ")}
      data-halo={halo ? "true" : undefined}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`${uid}-iris`} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="#2b66ae" />
          <stop offset="0.55" stopColor="#4b8fd6" />
          <stop offset="1" stopColor="#6fb0f0" />
        </linearGradient>
        {ids && (
          <>
            <image
              id={`${uid}-grain`}
              href={PENGUIN_GRAIN_URI}
              width={GRAIN_UNITS}
              height={GRAIN_UNITS}
            />
            {[...TEXTURED].map((k) => {
              const [part, layer] = k.split(".") as [PartKey, string];
              const fill = (
                TRACE.parts[part] as { layers: readonly { id: string; fill: string }[] }
              ).layers.find((l) => l.id === layer)!.fill;
              const s = GRAIN_UNITS;
              return (
                <pattern key={k} id={ids[k]} patternUnits="userSpaceOnUse" width={s} height={s}>
                  <rect width={s} height={s} fill={fill} />
                  <use href={`#${uid}-grain`} />
                </pattern>
              );
            })}
          </>
        )}
      </defs>
      {title && <title>{title}</title>}

      <g className="pip-shadow">
        <ellipse cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} fill={TRACE.parts.shadow.fill} />
      </g>

      <g key={replayKey} className="pip-hop">
        <g className="pip-breath">
          <g className="pip-body">
            <Layers part="body" ids={ids} />
          </g>

          <g className="pip-wings">
            <g className="pip-wing-l-pose">
              <g className="pip-wing-l-loop">
                <Layers part="wingL" ids={ids} />
              </g>
            </g>
            <g className="pip-wing-r-pose">
              <g className="pip-wing-r-loop">
                <Layers part="wingR" ids={ids} />
              </g>
            </g>
          </g>

          <g className="pip-feet">
            <g className="pip-foot-l-pose">
              <g className="pip-foot-l-loop">
                <Layers part="footL" ids={ids} />
              </g>
            </g>
            <g className="pip-foot-r-pose">
              <g className="pip-foot-r-loop">
                <Layers part="footR" ids={ids} />
              </g>
            </g>
          </g>

          <g className="pip-head-pose">
            <g className="pip-head-loop">
              <g className="pip-head">
                <Layers part="head" ids={ids} />
              </g>
              <g className="pip-eyes">
                <Eye side="L" uid={uid} />
                <Eye side="R" uid={uid} />
              </g>
              <g className="pip-beak">
                <Layers part="beak" ids={ids} />
              </g>
              <g className="pip-mouth">
                <Layers part="mouth" ids={ids} />
              </g>
            </g>
          </g>

          <g className="pip-strap-pose">
            <g className="pip-strap-loop">
              <g className="pip-strap">
                {halo && <Halo parts={["strap"]} />}
                <Layers part="strap" ids={null} />
              </g>
              <g className="pip-duck-pose">
                <g className="pip-duck-loop">
                  <g className="pip-duck">
                    {halo && <Halo parts={["duck", "duckBeak"]} />}
                    <Layers part="duck" ids={null} />
                    <circle cx={duckEye.cx} cy={duckEye.cy} r={duckEye.r} fill={duckEye.fill} />
                    <Layers part="duckBeak" ids={null} />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>

      <g className="pip-sparkles">
        <g className="pip-sparkle pip-sparkle-a" style={sparkOrigin(spark1)}>
          <Layers part="sparkle1" ids={null} />
        </g>
        <g className="pip-sparkle pip-sparkle-b" style={sparkOrigin(spark0)}>
          <Layers part="sparkle0" ids={null} />
        </g>
      </g>
    </svg>
  );
}
