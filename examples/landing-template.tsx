/**
 * GENSO — LANDING PAGE TEMPLATE
 *
 * An opt-in / lead-magnet landing page, assembled entirely from this system's
 * own components. Copy this file into a project and replace the bracketed
 * placeholder copy — the structure, rhythm, and glow budget are the deliverable
 * here, not the words.
 *
 * — Setup this file assumes (README.md, steps 1–3) —
 *   1. tailwind.config: presets: [require("elemental-design/tailwind")]
 *      and content: [...genso.content, ...your own globs]  ← the spread is
 *      NOT optional; without it every utility used only inside the package's
 *      components silently generates nothing.
 *   2. Your stylesheet imports "elemental-design/fonts.css" then
 *      "elemental-design/tokens.css", above the @tailwind directives.
 *   3. body { background-color: var(--void); color: var(--washi); }
 *
 * Nothing below is imported by relative path. Every component comes through
 * the package's `exports` map, exactly as it will in the consuming project.
 *
 * — The aura ledger —
 * `Section` applies a corner aura correctly but cannot see its siblings, so
 * the three sibling rules (not every section, alternating sides, never two
 * adjacent) live here:
 *
 *     hero        strong · left
 *     5-day list  —
 *     proof       right
 *     author      —
 *     closing     left
 *
 * — The glow budget —
 *   aura ×3 (above, never adjacent) · halo ×1 (the author mark) ·
 *   edge ×1 (the closing CTA card) · sheen ×0 · wash ×0
 *
 * — The accent strategy —
 * Fire is the only accent carrying a job: it is the repeated "act here"
 * signature, and appears in exactly five places (topbar mark, both CTA
 * eyebrows, both CTA buttons, the closing card's edge). Water, earth and air
 * appear only as identity marks on people. That is v2.0's "colour is free"
 * held honestly — fire is a repeated affordance, not a rank.
 */

import * as React from "react";
import { Button, Card, Input, Status } from "elemental-design/primitives";
import {
  Heading,
  Eyebrow,
  Text,
  Prose,
  Link,
} from "elemental-design/typography";
import { FormField } from "elemental-design/forms";
import {
  Container,
  Section,
  Stack,
  Grid,
  Divider,
} from "elemental-design/structure";
import { Reveal } from "elemental-design/reveal";
import { ElementMark, type Element } from "elemental-design/marks";

/* ------------------------------ Placeholder content ------------------------------ */
/* All copy lives here so the JSX below stays readable as structure. Replace the
   brackets; don't restructure to fit longer copy — the measures are capped for
   a reason. */

const BRAND = "[Brand]";

const DAYS = [
  {
    title: "[Day one title — a verb, something they do]",
    teaser: "[One sentence on what changes by the end of the day.]",
  },
  {
    title: "[Day two title]",
    teaser: "[One sentence on what changes by the end of the day.]",
  },
  {
    title: "[Day three title]",
    teaser: "[One sentence on what changes by the end of the day.]",
  },
  {
    title: "[Day four title]",
    teaser: "[One sentence on what changes by the end of the day.]",
  },
  {
    title: "[Day five title]",
    teaser: "[One sentence on what changes by the end of the day.]",
  },
];

/* Three testimonials, three different element marks. Deliberately not four:
   `Fourfold` is the only place in this system where all four elements appear
   as peers, and a testimonial row is not that place. */
const TESTIMONIALS: Array<{
  quote: string;
  name: string;
  role: string;
  element: Element;
}> = [
  {
    quote: "[Two sentences. What was true before, and what is true now.]",
    name: "[Name]",
    role: "[Role · Company]",
    element: "water",
  },
  {
    quote: "[Two sentences. Concrete beats enthusiastic — a number if there is one.]",
    name: "[Name]",
    role: "[Role · Company]",
    element: "earth",
  },
  {
    quote: "[Two sentences. The objection they had, and what answered it.]",
    name: "[Name]",
    role: "[Role · Company]",
    element: "air",
  },
];

const TRUST = ["[No spam]", "[Unsubscribe anytime]", "[1,200+ readers]"];

const AUTHOR_LINKS = ["[Site]", "[Writing]", "[Contact]"];
const FOOTER_LINKS = ["[Privacy]", "[Terms]", "[Contact]"];

/* ---------------------------------- Chapter ---------------------------------- */
/* A section, plus the two things that give a long page flow: a hairline above
   it so the eye is told one thing ended and another began, and a
   scroll-triggered entrance so it arrives rather than simply being there.
   `first` suppresses the divider on the hero, which has nothing above it.
 *
 * Local on purpose. The system ships Divider, Reveal and Section separately
 * because a page might want one without the others; this is just how THIS
 * page composes them. */
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

/* ---------------------------------- CtaForm ---------------------------------- */
/* Used twice — hero and closing — each instance owning its own state, so
   submitting one leaves the other idle. FormField generates its ids from
   React.useId(), so two instances on one page never collide.
 *
 * On submit the card's CONTENTS swap; the card itself stays. Replacing the
 * whole card would collapse its footprint and jump everything below it.
 *
 * `Status tone="success"` and not a green-tinted card: semantic status is a
 * separate axis from the four elements on purpose, so a confirmation never
 * reads as "earth". */
function CtaForm({ emphasis = false }: { emphasis?: boolean }) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("[That doesn't look like an email address.]");
      return;
    }
    setError(undefined);
    setSubmitted(true);
  }

  return (
    <Card className="w-full" edge={emphasis ? "fire" : false}>
      {submitted ? (
        <Stack gap="sm" align="start">
          <Status tone="success">[Check your inbox]</Status>
          <Heading level={4} as="p">
            [Day one is on its way]
          </Heading>
          <Text size="sm" tone="muted">
            [One line on what happens next, and when.]
          </Text>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap="lg">
            <FormField
              label="Email"
              required
              hint="[We'll only email the lessons.]"
              error={error}
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
            <Stack direction="horizontal" gap="sm" align="center" wrap>
              <Button accent="fire" type="submit">
                [Get day one]
              </Button>
              <Text size="xs" tone="muted">
                [Takes 30 seconds]
              </Text>
            </Stack>
          </Stack>
        </form>
      )}
    </Card>
  );
}

/* ---------------------------------- TrustRow --------------------------------- */
/* Plain muted text, not Badges. Three element-tinted pills side by side is the
   rainbow the accent strategy above exists to avoid, and these are reassurances
   rather than tags. */
function TrustRow() {
  return (
    <Stack direction="horizontal" gap="lg" wrap>
      {TRUST.map((item) => (
        <Text key={item} size="xs" tone="muted">
          {item}
        </Text>
      ))}
    </Stack>
  );
}

/* ----------------------------------- DayRow ---------------------------------- */
/* The divider sits INSIDE the <li>, not between them: Divider renders an <hr>,
   and an <hr> as a direct child of <ol> is invalid markup.
 *
 * The marker is a mono numeral rather than an ElementMark. Five rows across
 * four elements would force a repeat or a drop, and the days are a sequence —
 * an element mark on each would read as four categories plus one. */
function DayRow({
  index,
  title,
  teaser,
}: {
  index: number;
  title: string;
  teaser: string;
}) {
  return (
    <Reveal as="li" delay={index as 0 | 1 | 2 | 3 | 4}>
      {index > 0 && <Divider space="md" />}
      <Stack direction="horizontal" gap="lg" align="start">
        <Eyebrow as="span" className="shrink-0 w-2xl pt-xs">
          {`0${index + 1}`}
        </Eyebrow>
        <Stack gap="xs">
          <Heading level={4} as="h3">
            {title}
          </Heading>
          <Text size="sm" tone="muted">
            {teaser}
          </Text>
        </Stack>
      </Stack>
    </Reveal>
  );
}

/* ------------------------------ TestimonialCard ------------------------------ */
/* A plain card: no interactive (it isn't clickable), no sheen, no wash. Wash is
   scoped to a card carrying a label and a short title — a quote is neither, and
   a tinted ground costs reading comfort that two sentences can't afford. */
function TestimonialCard({
  quote,
  name,
  role,
  element,
}: (typeof TESTIMONIALS)[number]) {
  return (
    <Card>
      <Stack gap="lg">
        <Text as="p" size="sm">
          {`"${quote}"`}
        </Text>
        <Stack direction="horizontal" gap="sm" align="center">
          <ElementMark element={element} size={20} label={null} />
          <Stack gap="xs">
            <Text size="xs">{name}</Text>
            <Eyebrow>{role}</Eyebrow>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

/* ------------------------------- The page ------------------------------------ */

export function LandingTemplate() {
  return (
    <>
      {/* Topbar. Deliberately not a Section — a masthead is not a <section>,
          and the shells in this system (Sidebar, NavLink) are app chrome
          rather than marketing chrome. No Reveal either: it is above the fold
          and always visible, so revealing it only makes the page flash. */}
      <header>
        <Container size="lg">
          <Stack
            direction="horizontal"
            justify="between"
            align="center"
            className="py-md"
          >
            <Stack direction="horizontal" gap="sm" align="center">
              <ElementMark element="fire" size={20} label={null} />
              <span className="font-brush text-washi">{BRAND}</span>
            </Stack>
            <Eyebrow>[Free · 5 days]</Eyebrow>
          </Stack>
        </Container>
      </header>

      <main>
        {/* -------------------------------- Hero -------------------------------- */}
        <Chapter first rhythm="loose" aura="strong">
          <Container size="md">
            <Stack gap="xl" className="rise">
              <Eyebrow tone="fire">[Free · 5-day challenge]</Eyebrow>
              <Heading level={1} className="max-w-measure-display">
                [Headline — the outcome they get, in one line]
              </Heading>
              <Text size="md" tone="muted" className="max-w-measure">
                [Subheadline — who this is for, what arrives each day, and what
                is different by the end of the week.]
              </Text>
              <CtaForm />
              <TrustRow />
            </Stack>
          </Container>
        </Chapter>

        {/* ----------------------------- What to expect -------------------------- */}
        {/* Five hairline-divided rows, not a grid of cards. Grid sanctions 1/2/3/4
            columns, so five items always leave an orphan row — and more to the
            point, the days are a SEQUENCE while cards are peers. Five equal
            slabs would erase the ordinal meaning that is the whole content of
            this section. The page is already the stage. */}
        <Chapter>
          <Container size="md">
            <Stack gap="xl">
              <Stack gap="sm">
                <Eyebrow>[What to expect]</Eyebrow>
                <Heading level={2}>[Five days, five shifts]</Heading>
                <Text tone="muted" className="max-w-measure">
                  [One line framing the arc — where they start, where they land.]
                </Text>
              </Stack>
              <ol>
                {DAYS.map((day, i) => (
                  <DayRow
                    key={day.title}
                    index={i}
                    title={day.title}
                    teaser={day.teaser}
                  />
                ))}
              </ol>
            </Stack>
          </Container>
        </Chapter>

        {/* ------------------------------ Social proof --------------------------- */}
        {/* Three testimonials fit cols={3} exactly, and testimonials genuinely
            ARE peers — the case cards fail for the day list is the case they
            pass here. */}
        <Chapter aura="r">
          <Container size="lg">
            <Stack gap="xl">
              <Stack gap="sm">
                <Eyebrow>[From past participants]</Eyebrow>
                <Heading level={2}>[What people said afterwards]</Heading>
              </Stack>
              <Grid cols={3} gap="lg">
                {TESTIMONIALS.map((t) => (
                  <TestimonialCard key={t.element} {...t} />
                ))}
              </Grid>
            </Stack>
          </Container>
        </Chapter>

        {/* -------------------------------- Author ------------------------------- */}
        {/* Earth: settle, grounded — the stance you strike from, which is the
            right register for "who is behind this". The page's only halo, and a
            halo on an OBJECT is the sanctioned use; on a section it would be
            the banned full-page wash under a new name. */}
        <Chapter>
          <Container size="md">
            <Card>
              <Stack direction="horizontal" gap="xl" align="start" wrap>
                <ElementMark element="earth" size={48} halo label={null} />
                <Stack gap="sm">
                  <Eyebrow>[About your host]</Eyebrow>
                  <Heading level={3} as="h2">
                    [Name]
                  </Heading>
                  <Prose surface="bare">
                    <p>
                      [Two or three sentences — who you are, why you are the one
                      teaching this, and what you have actually shipped.]
                    </p>
                    <p>
                      [One more, on why you built this particular thing and who
                      it is for.]
                    </p>
                  </Prose>
                  <Stack direction="horizontal" gap="md" wrap>
                    {AUTHOR_LINKS.map((label) => (
                      <Text key={label} as="span" size="xs" tone="muted">
                        <Link href="#" tone="inherit">
                          {label}
                        </Link>
                      </Text>
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Container>
        </Chapter>

        {/* ------------------------------ Closing CTA ---------------------------- */}
        {/* Left-aligned like every other section. This system does not centre a
            block of copy just because it is the last one. */}
        <Chapter rhythm="loose" aura="l">
          <Container size="md">
            <Stack gap="xl">
              <Stack gap="sm">
                <Eyebrow tone="fire">[Last call]</Eyebrow>
                <Heading level={2}>[Closing headline — restate the outcome]</Heading>
                <Text tone="muted" className="max-w-measure">
                  [One line. The same promise as the hero, in fewer words.]
                </Text>
              </Stack>
              <CtaForm emphasis />
              <TrustRow />
            </Stack>
          </Container>
        </Chapter>
      </main>

      <footer>
        <Divider />
        <Container size="lg">
          <Stack
            direction="horizontal"
            justify="between"
            align="center"
            wrap
            className="py-xl"
          >
            <Eyebrow>[© 2026 Brand]</Eyebrow>
            <Stack direction="horizontal" gap="md" wrap>
              {FOOTER_LINKS.map((label) => (
                <Text key={label} as="span" size="xs" tone="muted">
                  <Link href="#" tone="inherit">
                    {label}
                  </Link>
                </Text>
              ))}
            </Stack>
          </Stack>
        </Container>
      </footer>
    </>
  );
}
