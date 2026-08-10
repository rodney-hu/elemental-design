/**
 * GENSO — LIVING STYLE GUIDE
 *
 * Every component below is imported from the package. Nothing here
 * reimplements a component in HTML, which is what the old standalone showcase
 * did — and why it drifted, needed its own palette copy, and could never show
 * a component that hadn't been hand-rewritten.
 *
 * It is also a working example of the system's composition habits: two
 * neutrals carrying nearly everything, prose on panels, and corner auras on
 * alternating sides with untinted stretches between them. Note what is NOT
 * here any more — no rule about which accent may lead, because as of v2.0
 * colour is not bound to role.
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
import { Modal, useToast } from "elemental-design/overlay";
import { Tabs, TabList, Tab, TabPanel } from "elemental-design/tabs";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "elemental-design/table";
import {
  Container,
  Section,
  Stack,
  Grid,
  Divider,
} from "elemental-design/structure";
import { Reveal } from "elemental-design/reveal";
import { ElementMark, type Element } from "elemental-design/marks";
import { Fourfold } from "elemental-design/shells";
import { MotionLab } from "./MotionLab";

const ELEMENTS: Element[] = ["fire", "water", "earth", "air"];

/* A section, plus the two things that give the page flow:
 *
 *   · a gradient hairline above it, so the eye is told one thing ended and
 *     another began. Generous spacing alone didn't do that — evenly-spaced
 *     sections on a flat black page read as separate slabs, not a sequence.
 *   · a scroll-triggered entrance, so a section arrives rather than simply
 *     being there.
 *
 * `first` suppresses the divider on the hero, which has nothing above it to
 * be separated from.
 *
 * Local to the showcase: the design system ships `Divider`, `Reveal` and
 * `Section` as separate pieces on purpose, because a project might well want
 * one without the others. This is just how THIS page composes them.
 */
function Chapter({
  first = false,
  children,
  ...section
}: React.ComponentProps<typeof Section> & { first?: boolean }) {
  return (
    <>
      {!first && <Divider />}
      <Reveal>
        <Section {...section}>{children}</Section>
      </Reveal>
    </>
  );
}

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
  const [modalOpen, setModalOpen] = React.useState(false);
  const toast = useToast();

  /* Deliberately invalid so the error state is visible without interaction —
     an error state you have to trigger by hand is one nobody ever looks at. */
  const emailError =
    email.length > 0 && !email.includes("@")
      ? "That doesn't look like an email address."
      : undefined;

  return (
    <main>
      {/* ------------------------------- Hero ------------------------------- */}
      <Chapter first rhythm="loose" aura="strong">
        <Container size="md">
          <Stack gap="lg" className="rise">
            <Eyebrow tone="fire">元素 · Genso</Eyebrow>
            <Heading level={1}>
              A design system, so nothing starts from a blank canvas.
            </Heading>
            <Text size="md" tone="muted" className="max-w-measure">
              Two neutrals do the work; four accents are free to lead anything.
              What the elements bind is motion. Every value below is a token,
              and every rule below is enforced by{" "}
              <Link href="#checks" tone="fire">
                genso-check
              </Link>
              .
            </Text>
            <Stack direction="horizontal" gap="sm" wrap>
              <Button accent="fire">Primary action</Button>
              <Button accent="air" shape="outline">Featured</Button>
              <Button shape="quiet">Secondary</Button>
            </Stack>
          </Stack>
        </Container>
      </Chapter>

      {/* ----------------------------- Elements ----------------------------- */}
      <Chapter>
        <Container size="lg">
          <Stack gap="xl">
            <Stack gap="sm">
              <Eyebrow>The four elements</Eyebrow>
              <Heading level={2}>Colour is free; motion is bound</Heading>
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

            <Specimen
              title="Buttons — every accent, both shapes"
              note="Until v2.0 there was one primary button and it was fire; a water or earth button needed a justification. Colour is not a job title any more — accent and shape are separate axes, so an outlined earth button is as ordinary as a solid fire one."
            >
              <Stack gap="md">
                <Stack direction="horizontal" gap="sm" wrap>
                  {ELEMENTS.map((el) => (
                    <Button key={el} accent={el}>
                      {el}
                    </Button>
                  ))}
                </Stack>
                <Stack direction="horizontal" gap="sm" wrap>
                  {ELEMENTS.map((el) => (
                    <Button key={el} accent={el} shape="outline">
                      {el}
                    </Button>
                  ))}
                  <Button shape="quiet">quiet</Button>
                </Stack>
                <Text size="2xs" tone="muted" className="max-w-measure">
                  Solid fills take their text colour from{" "}
                  <code className="font-mono">--on-{"{element}"}</code>, not from
                  a fixed neutral: paper on green is 3.67:1 and fails AA, and on
                  gold it is 2.09:1. Both need ink instead. Nobody had computed
                  those pairings while fire was the only legal solid fill.
                </Text>
              </Stack>
            </Specimen>
          </Stack>
        </Container>
      </Chapter>

      {/* ----------------------------- Fourfold ----------------------------- */}
      {/* Just a layout now. Its five governing conditions were retired in
          v2.0 along with the rest of the colour-to-role binding. */}
      <Chapter aura="r">
        <Container size="lg">
          <Stack gap="xl">
            <Stack gap="sm">
              <Eyebrow>Layout</Eyebrow>
              <Heading level={2}>The Fourfold</Heading>
              <Text size="sm" tone="muted" className="max-w-measure">
                Four peers, one element each, in canonical order. Until v2.0
                this was the single sanctioned place all four accents could
                coexist, governed by five conditions. Those are gone — accents
                are free now, so this is simply a four-up layout you can reach
                for because it looks right.
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
      </Chapter>

      {/* ---------------------------- Typography ---------------------------- */}
      <Chapter>
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
      </Chapter>

      {/* ------------------------------ Surfaces ---------------------------- */}
      <Chapter aura="l">
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
      </Chapter>

      {/* ------------------------------- Forms ------------------------------ */}
      <Chapter>
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
                  <Button accent="fire">Submit</Button>
                  <Button shape="quiet" disabled>
                    Disabled
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Chapter>

      {/* ------------------------------ Status ------------------------------ */}
      <Chapter aura="r">
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
      </Chapter>

      {/* ------------------------- Overlays and structure ------------------------ */}
      <Chapter>
        <Container size="lg">
          <Stack gap="xl">
            <Stack gap="sm">
              <Eyebrow>Composed</Eyebrow>
              <Heading level={2}>Overlays, tabs and tables</Heading>
              <Text size="sm" tone="muted" className="max-w-measure">
                The four patterns that sat on the "still to build" list since
                v0.1. Each one leans on a native element, so the browser
                provides the behaviour that hand-rolled versions reimplement
                and get wrong.
              </Text>
            </Stack>

            <Specimen
              title="Modal"
              note="A native <dialog>. Escape closes it, focus is trapped inside, and it renders in the browser's top layer — none of which is our code."
            >
              <Stack direction="horizontal" gap="sm" wrap>
                <Button accent="fire" onClick={() => setModalOpen(true)}>
                  Open modal
                </Button>
              </Stack>
            </Specimen>

            <Specimen
              title="Toast"
              note="One aria-live region for the whole stack. The entrance reuses the system's own .rise utility, so it inherits the reduced-motion guard instead of reimplementing it."
            >
              <Stack direction="horizontal" gap="sm" wrap>
                {(["success", "info", "warning", "error"] as const).map((tone) => (
                  <Button
                    key={tone}
                    shape="quiet"
                    onClick={() =>
                      toast.push({
                        tone,
                        message: `This is a ${tone} toast.`,
                      })
                    }
                  >
                    {tone}
                  </Button>
                ))}
              </Stack>
            </Specimen>

            <Specimen
              title="Tabs"
              note="Roving tabindex: only the selected tab is a Tab stop, and arrow keys move between them. Try it from the keyboard."
            >
              <Tabs defaultValue="fire">
                <TabList>
                  {ELEMENTS.map((el) => (
                    <Tab key={el} value={el}>
                      {el}
                    </Tab>
                  ))}
                </TabList>
                {ELEMENTS.map((el) => (
                  <TabPanel key={el} value={el}>
                    <Stack direction="horizontal" gap="md" align="center">
                      <ElementMark element={el} size={28} />
                      <Text size="sm" tone="muted">
                        The {el} panel. Panels unmount when hidden unless you
                        pass <code className="font-mono">keepMounted</code>.
                      </Text>
                    </Stack>
                  </TabPanel>
                ))}
              </Tabs>
            </Specimen>

            <Specimen
              title="Table"
              note="Native table semantics inside a scroll container, so a wide table scrolls in its own box rather than blowing out the page."
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Token</TableHeaderCell>
                    <TableHeaderCell>Tier</TableHeaderCell>
                    <TableHeaderCell>What sits here</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-2xs">--void</TableCell>
                    <TableCell>Page</TableCell>
                    <TableCell>The stage — nothing but the page</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-2xs">--sumi</TableCell>
                    <TableCell>Recessed</TableCell>
                    <TableCell>Inputs, wells, code blocks</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-2xs">--sumi-2</TableCell>
                    <TableCell>Raised</TableCell>
                    <TableCell>Cards, modals, anything holding content</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Specimen>
          </Stack>
        </Container>
      </Chapter>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="A native dialog"
      >
        <Stack gap="md">
          <Text size="sm" tone="muted">
            Press Escape, click the backdrop, or use the close button. Tab
            through this — focus never leaves the dialog, because the browser
            traps it.
          </Text>
          <Stack direction="horizontal" gap="sm">
            <Button
              accent="fire"
              onClick={() => {
                setModalOpen(false);
                toast.push({ tone: "success", message: "Confirmed." });
              }}
            >
              Confirm
            </Button>
            <Button shape="quiet" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Modal>

      {/* ---------------------------- Motion lab ---------------------------- */}
      <Chapter aura="l">
        <Container size="lg">
          <Stack gap="xl">
            <Stack gap="sm">
              <Eyebrow>Motion</Eyebrow>
              <Heading level={2}>One curve, three durations</Heading>
              <Text size="sm" tone="muted" className="max-w-measure">
                The whole motion language is a single ease-out and three
                durations, and every entrance is decorative — so all of it is
                gated on <code className="font-mono">prefers-reduced-motion</code>{" "}
                at the token level. Everything below plays on click rather than
                autoplaying, so scrolling past here stays quiet.
              </Text>
            </Stack>

            <MotionLab />
          </Stack>
        </Container>
      </Chapter>

      {/* ------------------------------ Footer ------------------------------ */}
      <Chapter id="checks" rhythm="loose">
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
      </Chapter>
    </main>
  );
}
