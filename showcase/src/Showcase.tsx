/**
 * GENSO — LIVING STYLE GUIDE
 *
 * Every component below is imported from the package. Nothing here
 * reimplements a component in HTML, which is what the old standalone showcase
 * did — and why it drifted, needed its own palette copy, and could never show
 * a component that hadn't been hand-rewritten.
 *
 * This file is also a working example of the system's own composition rules:
 * one accent leads (fire), exactly one Fourfold, prose on panels, and the
 * corner auras alternate sides with untinted stretches between them.
 */

import * as React from "react";
import {
  Button,
  Card,
  CardLink,
  Input,
  Badge,
  Status,
  CompareRow,
} from "elemental-design/primitives";
import {
  Heading,
  Eyebrow,
  Prose,
  Text,
  Link,
} from "elemental-design/typography";
import {
  FormField,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
} from "elemental-design/forms";
import { Container, Section, Stack, Grid } from "elemental-design/structure";
import { ElementMark, type Element } from "elemental-design/marks";
import { Fourfold } from "elemental-design/shells";

const ELEMENTS: Element[] = ["fire", "water", "earth", "air"];

/* A labelled specimen block. Local to the showcase — this is presentation of
   the system, not part of it. */
function Specimen({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack gap="md">
      <Stack gap="xs">
        <Heading level={4} as="h3">
          {title}
        </Heading>
        {note && (
          <Text size="sm" tone="muted" className="max-w-measure">
            {note}
          </Text>
        )}
      </Stack>
      {children}
    </Stack>
  );
}

export function Showcase() {
  const [email, setEmail] = React.useState("");
  const [plan, setPlan] = React.useState("air");

  /* Deliberately invalid so the error state is visible without interaction —
     an error state you have to trigger by hand is one nobody ever looks at. */
  const emailError =
    email.length > 0 && !email.includes("@")
      ? "That doesn't look like an email address."
      : undefined;

  return (
    <main>
      {/* ------------------------------- Hero ------------------------------- */}
      <Section rhythm="loose" aura="strong">
        <Container size="md">
          <Stack gap="lg" className="rise">
            <Eyebrow tone="fire">元素 · Genso</Eyebrow>
            <Heading level={1}>
              A design system, so nothing starts from a blank canvas.
            </Heading>
            <Text size="md" tone="muted" className="max-w-measure">
              Four elements, two neutrals, one accent leading at a time. Every
              value below is a token; every rule below is enforced by{" "}
              <Link href="#checks" tone="fire">
                genso-check
              </Link>
              .
            </Text>
            <Stack direction="horizontal" gap="sm" wrap>
              <Button variant="primary">Primary action</Button>
              <Button variant="air">Featured</Button>
              <Button variant="secondary">Secondary</Button>
            </Stack>
          </Stack>
        </Container>
      </Section>

      {/* ----------------------------- Elements ----------------------------- */}
      <Section>
        <Container size="lg">
          <Stack gap="xl">
            <Stack gap="sm">
              <Eyebrow>The four elements</Eyebrow>
              <Heading level={2}>Each one is a colour and a behaviour</Heading>
            </Stack>

            <Specimen
              title="Marks — geometric register"
              note="One 24×24 grid, 1.5 stroke, butt caps, miter joins, no circle enclosure. Colour is never passed in: the mark inherits its element through currentColor."
            >
              <Stack direction="horizontal" gap="xl" wrap>
                {ELEMENTS.map((el) => (
                  <Stack key={el} gap="sm" align="center">
                    <ElementMark element={el} size={32} halo />
                    <Eyebrow tone={el}>{el}</Eyebrow>
                  </Stack>
                ))}
              </Stack>
            </Specimen>

            <Specimen
              title="Marks — kanji register"
              note="火 水 土 風. Limited to the font subset; anything outside it silently falls back, which genso-check fails on."
            >
              <Stack direction="horizontal" gap="xl" wrap>
                {ELEMENTS.map((el) => (
                  <ElementMark key={el} element={el} size={32} kanji halo />
                ))}
              </Stack>
            </Specimen>

            <Specimen title="Badges — tagging content by element">
              <Stack direction="horizontal" gap="sm" wrap>
                {ELEMENTS.map((el) => (
                  <Badge key={el} tone={el}>
                    {el}
                  </Badge>
                ))}
              </Stack>
            </Specimen>
          </Stack>
        </Container>
      </Section>

      {/* ----------------------------- Fourfold ----------------------------- */}
      {/* At most one per page, never in the same viewport as a primary CTA. */}
      <Section aura="r">
        <Container size="lg">
          <Stack gap="xl">
            <Stack gap="sm">
              <Eyebrow>The one sanctioned exception</Eyebrow>
              <Heading level={2}>The Fourfold</Heading>
              <Text size="sm" tone="muted" className="max-w-measure">
                The only place all four accents coexist. Four peers, one element
                each — a claim about range, not four accents competing. Outside
                this set, one accent still leads.
              </Text>
            </Stack>

            <Fourfold
              cells={[
                {
                  element: "fire",
                  title: "Bold",
                  children: (
                    <Text size="sm" tone="muted">
                      The committed strike. Decisive, not reckless.
                    </Text>
                  ),
                },
                {
                  element: "water",
                  title: "Fluid",
                  children: (
                    <Text size="sm" tone="muted">
                      Yields to overcome. Wears down stone through persistence.
                    </Text>
                  ),
                },
                {
                  element: "earth",
                  title: "Grounded",
                  children: (
                    <Text size="sm" tone="muted">
                      The stance you strike from. Patient, rooted, alive.
                    </Text>
                  ),
                },
                {
                  element: "air",
                  title: "Formless",
                  children: (
                    <Text size="sm" tone="muted">
                      Breath and spirit. The most refined element.
                    </Text>
                  ),
                },
              ]}
            />
          </Stack>
        </Container>
      </Section>

      {/* ---------------------------- Typography ---------------------------- */}
      <Section>
        <Container size="lg">
          <Stack gap="xl">
            <Stack gap="sm">
              <Eyebrow>Type</Eyebrow>
              <Heading level={2}>One size per level, permanently</Heading>
            </Stack>

            <Specimen
              title="Heading levels"
              note="Display sizes are fluid clamp()s — resize the window and they scale without a single responsive variant."
            >
              <Stack gap="md">
                <Heading level={1}>Level 1 — hero</Heading>
                <Heading level={2}>Level 2 — section</Heading>
                <Heading level={3}>Level 3 — sub-heading</Heading>
                <Heading level={4}>Level 4 — card title</Heading>
              </Stack>
            </Specimen>

            <Specimen
              title="Eyebrow"
              note="13px floor, tracking-label, and structurally incapable of rendering as a heading — all three conditions that were violated at once on the first site to use them."
            >
              <Stack direction="horizontal" gap="lg" wrap>
                <Eyebrow>Neutral label</Eyebrow>
                <Eyebrow tone="fire">Fire label</Eyebrow>
                <Eyebrow tone="air">Air label</Eyebrow>
              </Stack>
            </Specimen>

            <Specimen
              title="Prose"
              note="Capped at --measure (68ch) and on a panel by default. Short passages read well directly on the void; sustained prose does not."
            >
              <Prose>
                <p>
                  Restraint and premium energy, held at once. Dark, minimal,
                  generous negative space — <em>ma</em>, the principle that
                  empty space is load-bearing rather than leftover.
                </p>
                <p>
                  Every component gets checked against both: does it hold
                  restraint, and does it still feel premium? A component that is
                  quiet but flat has failed as much as one that is flashy but
                  cluttered.
                </p>
              </Prose>
            </Specimen>
          </Stack>
        </Container>
      </Section>

      {/* ------------------------------ Surfaces ---------------------------- */}
      <Section aura="l">
        <Container size="lg">
          <Stack gap="xl">
            <Stack gap="sm">
              <Eyebrow>Elevation</Eyebrow>
              <Heading level={2}>Three tiers, darkest at the back</Heading>
            </Stack>

            <Grid cols={3}>
              <Card>
                <Stack gap="sm">
                  <Eyebrow>Page · --void</Eyebrow>
                  <Text size="sm" tone="muted">
                    The stage. Nothing sits at this level except the page
                    itself.
                  </Text>
                </Stack>
              </Card>
              <Card>
                <Stack gap="sm">
                  <Eyebrow>Recessed · --sumi</Eyebrow>
                  <Text size="sm" tone="muted">
                    Inputs, wells, code blocks. Never the same tier as the panel
                    it sits on.
                  </Text>
                </Stack>
              </Card>
              <Card>
                <Stack gap="sm">
                  <Eyebrow>Raised · --sumi-2</Eyebrow>
                  <Text size="sm" tone="muted">
                    Cards, modals, anything holding content. Solid, never
                    translucent.
                  </Text>
                </Stack>
              </Card>
            </Grid>

            <Specimen
              title="Card vs. CardLink"
              note="`interactive` is visual only and now defaults to false. Tab through these: only the second is focusable, because clickability comes from the element, not a styling prop."
            >
              <Grid cols={2}>
                <Card interactive accent="water">
                  <Heading level={4}>Card interactive</Heading>
                  <Text size="sm" tone="muted">
                    Hovers, but is not a control. No focus ring, and none is
                    implied.
                  </Text>
                </Card>
                <CardLink href="#surfaces" accent="fire">
                  <Heading level={4}>CardLink</Heading>
                  <Text size="sm" tone="muted">
                    A real anchor — focusable, keyboard-activatable, announced
                    as a link.
                  </Text>
                </CardLink>
              </Grid>
            </Specimen>

            <Specimen
              title="Earth's rooting shadow"
              note="Offset down and tightly spread, so it reads as weight rather than emission. Earth's behaviour half, described since v0.1 and shipped in v0.7."
            >
              <Card elevation="rooted" className="max-w-container-sm">
                <Heading level={4}>Rooted</Heading>
                <Text size="sm" tone="muted">
                  Never paired with a glow on the same object — that would be
                  two element behaviours at once.
                </Text>
              </Card>
            </Specimen>
          </Stack>
        </Container>
      </Section>

      {/* ------------------------------- Forms ------------------------------ */}
      <Section>
        <Container size="md">
          <Stack gap="xl">
            <Stack gap="sm">
              <Eyebrow>Forms</Eyebrow>
              <Heading level={2}>Wired, not just styled</Heading>
              <Text size="sm" tone="muted" className="max-w-measure">
                Type something without an @ to see the error state. The message
                is linked via <code className="font-mono">aria-describedby</code>{" "}
                and the field carries{" "}
                <code className="font-mono">aria-invalid</code> — neither of
                which existed before v0.7.
              </Text>
            </Stack>

            <Card className="w-full">
              <Stack gap="lg">
                <FormField
                  label="Email"
                  required
                  hint="We'll only use this to reply."
                  error={emailError}
                >
                  {(field) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  )}
                </FormField>

                <FormField label="Project" hint="What are you building?">
                  {(field) => (
                    <Textarea {...field} placeholder="A few sentences…" />
                  )}
                </FormField>

                <FormField label="Element">
                  {(field) => (
                    <Select {...field} defaultValue="fire">
                      {ELEMENTS.map((el) => (
                        <option key={el} value={el}>
                          {el}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormField>

                <RadioGroup
                  legend="Register"
                  name="register"
                  value={plan}
                  onChange={setPlan}
                  options={[
                    { value: "fire", label: "Bold — lead with the strike" },
                    { value: "air", label: "Formless — lead with restraint" },
                  ]}
                />

                <Checkbox label="Send me the changelog" defaultChecked />

                <Stack direction="horizontal" gap="sm">
                  <Button variant="primary">Submit</Button>
                  <Button variant="secondary" disabled>
                    Disabled
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>

      {/* ------------------------------ Status ------------------------------ */}
      <Section aura="r">
        <Container size="lg">
          <Stack gap="xl">
            <Stack gap="sm">
              <Eyebrow>Semantic</Eyebrow>
              <Heading level={2}>A separate axis from element colour</Heading>
              <Text size="sm" tone="muted" className="max-w-measure">
                Error shares fire's red and does not share its variable. Every
                tone renders its glyph with a <code className="font-mono">-text</code>{" "}
                token, because the base values are 2.43:1 on ink — invisible.
              </Text>
            </Stack>

            <Stack direction="horizontal" gap="sm" wrap>
              <Status tone="success">Passing</Status>
              <Status tone="warning">Degraded</Status>
              <Status tone="error">Failed</Status>
            </Stack>

            <Specimen title="Compare rows">
              <Stack gap="xs" className="max-w-container-sm">
                <CompareRow state="old">
                  Copy the tokens into each project
                </CompareRow>
                <CompareRow state="new">
                  Install the package and spread its content globs
                </CompareRow>
              </Stack>
            </Specimen>
          </Stack>
        </Container>
      </Section>

      {/* ------------------------------ Footer ------------------------------ */}
      <Section id="checks" rhythm="loose">
        <Container size="md">
          <Stack gap="md">
            <Eyebrow>Checks</Eyebrow>
            <Heading level={3}>
              Every rule above fails a build when broken
            </Heading>
            <Prose surface="bare">
              <p>
                <code className="font-mono text-sm">npm run check</code> guards
                this package's internals — the token graph, the CSS↔JS motion
                mirror, contrast on all three elevation tiers, the alpha caps,
                the mark drawing rules.
              </p>
              <p>
                <code className="font-mono text-sm">npx genso-check ./src</code>{" "}
                runs the other half in a consuming project, which is where every
                rule this system has was actually learned.
              </p>
            </Prose>
          </Stack>
        </Container>
      </Section>
    </main>
  );
}
