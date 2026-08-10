/**
 * SHOWCASE — MOTION LAB
 *
 * The motion language, made observable. Everything here demonstrates a value
 * that already exists in tokens.css or motion.ts — nothing invents a curve,
 * a duration or an effect for the demo's sake, which would defeat the point.
 *
 * Per the "balanced" intensity setting: demos play on interaction rather than
 * autoplaying, so scrolling past this section is quiet.
 *
 * Local to the showcase, not part of the package: this is *presentation of*
 * the system, and a curve plotter has no second consumer.
 */

import * as React from "react";
import { Card, Button, cx } from "elemental-design/primitives";
import { Heading, Eyebrow, Text } from "elemental-design/typography";
import { Stack, Grid } from "elemental-design/structure";
import { ElementMark, type Element } from "elemental-design/marks";
import { easeAir, durationMs } from "elemental-design/motion";

/* A replay counter is the simplest way to restart a CSS animation or
   transition: bump it, React re-keys the node, the browser treats it as new.
   The alternative — toggling a class and forcing reflow — is fiddlier and
   reads worse. */
function useReplay() {
  const [n, setN] = React.useState(0);
  return [n, () => setN((v) => v + 1)] as const;
}

/* ----------------------------- Easing curve plot ---------------------------- */
/* The bezier drawn at real scale, with a dot travelling it. Plotted from the
   token's own control points rather than hardcoded, so the drawing can never
   disagree with the curve the system actually animates on. */

const [cx1, cy1, cx2, cy2] = easeAir;

function EasingPlot() {
  const [replay, fire] = useReplay();
  const SIZE = 200;
  const PAD = 24;
  const span = SIZE - PAD * 2;

  /* SVG y grows downward; progress grows upward. */
  const px = (t: number) => PAD + t * span;
  const py = (v: number) => SIZE - PAD - v * span;

  const path = `M ${px(0)} ${py(0)} C ${px(cx1)} ${py(cy1)}, ${px(cx2)} ${py(cy2)}, ${px(1)} ${py(1)}`;
  const linear = `M ${px(0)} ${py(0)} L ${px(1)} ${py(1)}`;

  return (
    <Stack gap="md">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-container-sm"
        role="img"
        aria-label={`The ease-air curve, cubic-bezier(${easeAir.join(", ")}), plotted against a linear curve`}
      >
        {/* Grid — the shoji reference, at quarter intervals */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line
              x1={px(t)} y1={py(0)} x2={px(t)} y2={py(1)}
              stroke="var(--line)" strokeWidth={0.5}
            />
            <line
              x1={px(0)} y1={py(t)} x2={px(1)} y2={py(t)}
              stroke="var(--line)" strokeWidth={0.5}
            />
          </g>
        ))}

        {/* Linear, for comparison */}
        <path d={linear} fill="none" stroke="var(--washi-dim)" strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />

        {/* The system's curve */}
        <path d={path} fill="none" stroke="var(--fire-text)" strokeWidth={1.5} strokeLinecap="butt" />

        {/* Control handles — shows WHY it decelerates: both handles pull hard
            toward the end, so most of the distance is covered early. */}
        <line x1={px(0)} y1={py(0)} x2={px(cx1)} y2={py(cy1)} stroke="var(--fire)" strokeWidth={0.75} opacity={0.5} />
        <line x1={px(1)} y1={py(1)} x2={px(cx2)} y2={py(cy2)} stroke="var(--fire)" strokeWidth={0.75} opacity={0.5} />

        {/* Travelling dot.
            NOT SMIL <animateMotion>. That was the first attempt and it is
            broken in a way that looks like it works: a SMIL `begin="0s"` is
            relative to the DOCUMENT timeline, not to when the element was
            inserted. So the animation runs during the first 0.7s of page
            life — before anyone has scrolled here — and every later remount
            renders straight to the frozen end state. The dot simply sat at
            the end and Replay did nothing.

            CSS offset-path has no such problem (each new element starts its
            own animation), and unlike SMIL it is covered by the
            reduced-motion guard in tokens.css, which SMIL silently is not.
            The path is the same string the visible curve is drawn from, so
            the dot cannot travel a different line than the one on screen. */}
        <g
          key={replay}
          className={cx("curve-dot", replay > 0 && "curve-dot-run")}
          style={{ offsetPath: `path("${path}")` } as React.CSSProperties}
        >
          <circle r={4} fill="var(--fire-text)" />
        </g>
      </svg>

      <Stack direction="horizontal" gap="md" align="center" wrap>
        <Button variant="secondary" onClick={fire}>
          Replay
        </Button>
        <Text size="2xs" tone="muted" className="font-mono">
          cubic-bezier({easeAir.join(", ")})
        </Text>
      </Stack>
    </Stack>
  );
}

/* ------------------------------ Duration race ------------------------------- */
/* Three objects, same distance, same curve — only time differs. Makes
   "if the value you want isn't one of the three, the answer is one of the
   three" something you can feel rather than read. */

const DURATIONS = [
  { key: "fast", ms: durationMs.fast, note: "micro-interactions, button press" },
  { key: "default", ms: durationMs.default, note: "standard hover / transition" },
  { key: "slow", ms: durationMs.slow, note: "entrances" },
] as const;

function DurationRace() {
  const [replay, fire] = useReplay();

  return (
    <Stack gap="md">
      <Stack gap="sm">
        {DURATIONS.map((d) => (
          <Stack key={d.key} gap="xs">
            <Stack direction="horizontal" justify="between" align="center">
              <Eyebrow>{d.key}</Eyebrow>
              <Text size="2xs" tone="muted" className="font-mono">
                {d.ms}ms
              </Text>
            </Stack>
            <div className="relative h-8 bg-sumi rounded border border-line overflow-hidden">
              {/* `left-1` is the resting position the keyframe starts from,
                  so the dot sits at the line rather than jumping there on
                  first play. The animation is only attached after a click —
                  applied at mount it would run at page load and be finished
                  before this section is ever on screen. */}
              <div
                key={`${d.key}-${replay}`}
                className="race-dot absolute top-1/2 -translate-y-1/2 left-1 w-6 h-6 rounded bg-fire shadow-glow-fire-soft"
                style={
                  {
                    "--race-ms": `${d.ms}ms`,
                    ...(replay > 0 && {
                      animation: `raceAcross ${d.ms}ms var(--ease-air) forwards`,
                    }),
                  } as React.CSSProperties
                }
              />
            </div>
            <Text size="2xs" tone="muted">
              {d.note}
            </Text>
          </Stack>
        ))}
      </Stack>
      <Button variant="secondary" onClick={fire}>
        Race
      </Button>
    </Stack>
  );
}

/* --------------------------- Four element behaviours ------------------------- */
/* philosophy.md has given each element a colour AND a behaviour since v0.1.
   Until now the behaviour half was only ever described in prose. */

const BEHAVIOURS: Array<{
  element: Element;
  trait: string;
  behaviour: string;
  demo: string;
}> = [
  {
    element: "fire",
    trait: "Bold",
    behaviour: "The strike — fast, decisive, then it glows",
    demo: "demo-fire",
  },
  {
    element: "water",
    trait: "Fluid",
    behaviour: "Lifts and pools light rather than switching state",
    demo: "demo-water",
  },
  {
    element: "earth",
    trait: "Grounded",
    behaviour: "Settles down into its own weight",
    demo: "demo-earth",
  },
  {
    element: "air",
    trait: "Formless",
    behaviour: "Fades and rises. Never bounces, never overshoots",
    demo: "demo-air",
  },
];

/* State names from the reference that prompted the fill tier. They name what
   each element DOES rather than what it is, which is the right register for a
   card whose whole surface is the element — the colour already says which
   element it is, so the words shouldn't repeat it. */
const STATES: Array<{ element: Element; state: string }> = [
  { element: "fire", state: "Ignition" },
  { element: "water", state: "Flow" },
  { element: "earth", state: "Density" },
  { element: "air", state: "Vision" },
];

function ElementBehaviours() {
  /* A monotonic counter rather than toggling the class off and on again.
     The obvious approach — setActive(null), then re-set it next frame — is
     broken in a way that only shows up sometimes: requestAnimationFrame does
     not fire while the page is hidden or backgrounded, so the second setState
     never runs and the demo silently never plays. Bumping a counter and
     letting it drive the `key` restarts the animation by remounting, with no
     dependency on frame timing at all. */
  const [play, setPlay] = React.useState<{ el: Element; n: number } | null>(
    null,
  );

  return (
    <Grid cols={2} gap="lg">
      {BEHAVIOURS.map((b) => (
        <Card
          key={b.element}
          accent={b.element}
          edge={b.element}
          elevation={b.element === "earth" ? "rooted" : "raised"}
        >
          <Stack gap="md">
            <Stack direction="horizontal" gap="md" align="center">
              <span
                key={`${b.element}-${play?.el === b.element ? play.n : 0}`}
                className={cx(play?.el === b.element && b.demo)}
              >
                <ElementMark element={b.element} size={28} label={null} />
              </span>
              <Stack gap="xs">
                <Heading level={4}>{b.trait}</Heading>
                <Eyebrow tone={b.element}>{b.element}</Eyebrow>
              </Stack>
            </Stack>
            <Text size="sm" tone="muted">
              {b.behaviour}
            </Text>
            <Button
              variant="secondary"
              onClick={() =>
                setPlay((p) => ({ el: b.element, n: (p?.n ?? 0) + 1 }))
              }
            >
              Play
            </Button>
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}

/* ------------------------------ Entrance stagger ----------------------------- */

function EntranceStagger() {
  const [replay, fire] = useReplay();

  return (
    <Stack gap="md">
      <Grid cols={4} gap="sm">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`${i}-${replay}`}
            className={cx(
              replay > 0 && "rise",
              replay > 0 && `rise-d${i}`,
              "h-20 bg-sumi-2 border border-line rounded-md flex items-center justify-center",
            )}
          >
            <Text size="2xs" tone="muted" className="font-mono">
              d{i}
            </Text>
          </div>
        ))}
      </Grid>
      <Stack direction="horizontal" gap="md" align="center" wrap>
        <Button variant="secondary" onClick={fire}>
          Replay stagger
        </Button>
        <Text size="2xs" tone="muted" className="font-mono">
          0 · 50 · 180 · 300ms
        </Text>
      </Stack>
    </Stack>
  );
}

/* -------------------------------- Surface effects ---------------------------- */
/* The newest tier of the glow namespace. Shown side by side with a plain
   panel, because the whole claim is that these are *subtle* — and a subtle
   effect with nothing to compare it to just looks like the default. */

function SurfaceEffects() {
  return (
    <Stack gap="lg">
      <Grid cols={3} gap="lg">
        <Card>
          <Stack gap="sm">
            <Eyebrow>none</Eyebrow>
            <Text size="sm" tone="muted">
              A plain panel. Solid --sumi-2, one hairline border.
            </Text>
          </Stack>
        </Card>
        <Card sheen>
          <Stack gap="sm">
            <Eyebrow>sheen</Eyebrow>
            <Text size="sm" tone="muted">
              Light falls from the top and dies above the midpoint, so content
              never sits on a gradient. Capped at 0.04.
            </Text>
          </Stack>
        </Card>
        <Card edge="fire" sheen>
          <Stack gap="sm">
            <Eyebrow tone="fire">sheen + edge</Eyebrow>
            <Text size="sm" tone="muted">
              A gradient border lit from the top-left corner. Brighter is
              allowed — it is a 1px line, not a reading surface.
            </Text>
          </Stack>
        </Card>
      </Grid>

      <Stack gap="sm">
        <Eyebrow>edge, one per element</Eyebrow>
        <Grid cols={4} gap="md">
          {(["fire", "water", "earth", "air"] as const).map((el) => (
            <Card key={el} edge={el} elevation="none" className="py-4">
              <Stack gap="sm" align="center">
                <ElementMark element={el} size={22} label={null} />
                <Eyebrow tone={el}>{el}</Eyebrow>
              </Stack>
            </Card>
          ))}
        </Grid>
      </Stack>

      {/* The strongest tier. Label + short title only — see the usage rule on
          --wash-* in tokens.css and the `wash` prop on Card. */}
      <Stack gap="sm">
        <Eyebrow>Elemental states — fill</Eyebrow>
        <Text size="sm" tone="muted" className="max-w-measure">
          A filled card doesn't catch its element's light, it{" "}
          <em>is</em> its element. The only tier allowed to change what a
          surface reads as — so it is limited to a label and a short title,
          for the same reason prose belongs on a panel rather than the void.
        </Text>
        <Grid cols={4} gap="lg">
          {STATES.map((s) => (
            <Card
              key={s.element}
              wash={s.element}
              edge={s.element}
              sheen
              elevation="none"
              className="min-h-40 flex flex-col justify-between"
            >
              <Stack direction="horizontal" justify="between" align="center">
                <Eyebrow tone={s.element}>{s.element}</Eyebrow>
                <ElementMark element={s.element} size={20} label={null} />
              </Stack>
              <Heading level={3}>{s.state}</Heading>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Stack>
  );
}

/* ---------------------------------- Section ---------------------------------- */

function Lab({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <Stack gap="md">
      <Stack gap="xs">
        <Heading level={4} as="h3">
          {title}
        </Heading>
        <Text size="sm" tone="muted" className="max-w-measure">
          {note}
        </Text>
      </Stack>
      {children}
    </Stack>
  );
}

/* ------------------------- Reduced-motion opt-in ----------------------------- */
/* Shown only to readers who actually have the setting on — for everyone else
   it would be a control that does nothing, explaining a problem they don't
   have. `matchMedia` is read in an effect rather than during render so the
   markup is identical on the server and on first paint. */

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

function MotionOptIn({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Card accent="air" edge="air">
      <Stack gap="md">
        <Stack gap="xs">
          <Eyebrow tone="air">Reduced motion is on</Eyebrow>
          <Text size="sm" tone="muted" className="max-w-measure">
            Your system asks for reduced motion, so this page has switched every
            animation off — which is exactly what the setting is for, and what
            the system does in any project. But on this page the motion is the
            subject rather than decoration, so you can turn it back on just for
            the demos below. Nothing else on the page is affected, and nothing
            plays until you press a Play button.
          </Text>
        </Stack>
        <Button variant="air" onClick={onToggle} aria-pressed={enabled}>
          {enabled ? "Disable motion preview" : "Enable motion preview"}
        </Button>
      </Stack>
    </Card>
  );
}

export function MotionLab() {
  const reduced = useReducedMotion();
  const [preview, setPreview] = React.useState(false);

  return (
    <Stack gap="2xl" className={preview ? "motion-preview" : undefined}>
      {reduced && (
        <MotionOptIn
          enabled={preview}
          onToggle={() => setPreview((v) => !v)}
        />
      )}

      <Lab
        title="One curve, plotted"
        note="Every transition in the system runs on this bezier. Both control handles pull toward the end, which is why motion covers most of its distance early and settles rather than arriving. The dashed line is linear, for comparison."
      >
        <EasingPlot />
      </Lab>

      <Lab
        title="Three durations, raced"
        note="Same distance, same curve — only time differs. There is no fourth value: if the one you want isn't here, the answer is one of these three."
      >
        <DurationRace />
      </Lab>

      <Lab
        title="Four elements, four behaviours"
        note="Each element is a colour AND a behaviour. The behaviour half was described from v0.1 and only became demonstrable in v1.0, once earth had a rooting shadow to settle into."
      >
        <ElementBehaviours />
      </Lab>

      <Lab
        title="Entrances and stagger"
        note="Fade plus a 10px rise. Nothing bounces, nothing overshoots. The stagger delays match the .rise-d1–d4 utilities and the riseDelay array in motion.ts."
      >
        <EntranceStagger />
      </Lab>

      <Lab
        title="Surface effects"
        note="The glow namespace has four tiers, each budgeted by how much of your field of view it covers: aura tints a background (≤0.055), halo sits behind an object (≤0.30), sheen lies on a surface (≤0.05), edge lies on a 1px border (≤0.55). npm run check fails if any of them drifts above its cap."
      >
        <SurfaceEffects />
      </Lab>
    </Stack>
  );
}
