# Design — Ferma Fruct Brabova

Written from the built page, not from a plan. If the code and this file
disagree, the code is right and this file is out of date.

Scope right now: **`index.html` only.** The client asked for the landing page to
be finished before any other page is started.

## The idea

**The page runs light and the photographs are the colour.** The ground is a
warm cream and green appears three times only: the wash over the hero film, the
header's fill once the hero has gone, and the subsol. On any given screen the
loudest thing is a fruit.

This replaced a white page with a cool dark green on it, at the client's
direction, on 2026-08-15. He supplied both the creams and the green.

The four fruits run **four across, in the order they are picked**, each one
dropped half a step from its neighbour so the row is a hand of cards rather than
a shelf. Under every name are the weeks it is picked, hung off a green upright.
**The order on the page is the calendar** — cireșe, caise, prune, pere — and it
is not to be re-sorted.

The band under the hero laps over the foot of the film by half its own height.
It is the one place the page overlaps itself, and it is what stops the hero and
the section below it reading as two unrelated screens. A haze in the page's own
cream carries the last 16% of the film down into it so the two never meet at a
cut edge.

What it deliberately is not: no thin elegant serif, no muted sage, no photo with
a whispered headline over it. **The cream ground is now the brief, not a thing to
avoid** — an earlier version of this file warned against it and that warning is
void.

### The market-ticket object is gone

The earlier build was built around a `.ticket` component — label, punched hole,
perforation. Every ticket on the page held a fact the farm had not supplied, so
when the placeholders were removed the tickets went with them. **It is not
recoverable — this project is not under version control.** If that treatment is
wanted back it has to be rebuilt from scratch.

## How the arrangement was chosen

Three arrangements were drawn as grey wireframes in
`mockups/landing-layouts.html` and the client picked **C (Benzi)**, then asked
for **parteneri and cifre to swap places**. The order below is that decision and
is not to be re-litigated without asking.

Hero → banda cu cifre → declarație și cele patru fructe → video → parteneri →
subsol.

**`.figures` no longer exists as a section.** Its three counted numbers moved
into the band under the hero on 2026-08-15 and the white section they sat in was
deleted. The band is the only place the numbers appear.

Parteneri moved to the end: the logos are proof, and proof lands after you have
seen the fruit, not before. The declarație no longer has a band of its own; it
opens the cream section that the four fruits sit in.

Testimoniale and întrebări frecvente are still **deleted**, not hidden: every
line in both was a square-bracket placeholder and the client rejected
placeholders outright for those two. They come back, in their old position, the
day the farm supplies real quotes and real answers.

Cifre is a reversal of that same call: the client asked for it back with the
numbers filled in as obvious, round placeholders — 12 hectares, 8 years, 40
tonnes — said plainly on the page in a note under the row, rather than left
deleted until the real figures arrive. Replace all three numbers and delete the
note in the same edit once the farm answers.

`mockups/` is a working folder. Delete it when it stops being useful.

## Colour

**Chosen by the client, not sampled off the logo.** The five creams and the one
green were supplied as hex codes on 2026-08-15. The logo-sampled palette this
file used to describe is gone.

### The grounds — all five creams, lightest to deepest

| Token | Value | What it is |
|---|---|---|
| `--paper-lift` | `#FAF9EF` | Raised cards sitting on the page. |
| `--paper` | `#F6F1E1` | **The page.** |
| `--cream` | `#F4EDDB` | Text on the green. |
| `--sand-soft` | `#E9E3D6` | Hairlines and edges. |
| `--sand` | `#D8CFBD` | Plates: the band under the hero, and parteneri. |

`--paper` and `--cream` are 1.03 apart, so they must never touch edge to edge.
They are the page and a colour used far down it.

### The green — one, and only one

| Token | Value | What it is |
|---|---|---|
| `--forest` / `--forest-deep` / `--leaf` | `#698240` | Subsol, header fill, hero wash, display headings. |
| `--leaf-bright` | `#8EAE5B` | Decoration only. Never text. |

The three names are **the same hex on purpose** so that one green could be put
across the page without renaming anything. Do not reintroduce a darker variant:
the darker greens were exactly what the client rejected.

### Text is brown, not green

| Token | Value | What it is |
|---|---|---|
| `--ink` / `--bark` | `#493017` | Everything read, on every cream. |
| `--ink-soft` / `--bark-soft` | `#6E4F30` | Secondary text and the harvest months. |
| `--bark-deep` | `#3A2611` | Only on `--action`, where `--bark` is 4.09. |
| `--action` | `#E87614` | The orange fruit in the logo. |
| `--sky` | `#AECBE1` | Accent on small things. **Never a band ground.** |
| `--earth` | `#C3A278` | Hairlines only. |

**There is no white on this site.** `--white` does not exist as a token and
nothing references one. A white surface among these creams reads as a hole.

**Rules that still hold.** The four fruits are not four palettes — their colour
arrives inside their own photograph. Orange means clickable. No pale blue field.

**Contrast, measured.** `--ink` on `--paper` 10.8, on `--sand` 7.9.
`--ink-soft` on `--paper` 6.58. `--bark-deep` on `--action` 4.8.

**Four knowingly-failing pairs, signed off by the client.** All four are the
price of `#698240`, and none is to be "fixed" without asking him:

| Pair | Measured | Where |
|---|---|---|
| `#698240` on `#F6F1E1` | 3.8 | Display headings. Passes at large size, which is the only place it appears. |
| `#F4EDDB` on `#698240` | 3.7 | Subsol secondary text. |
| `#F6F1E1` on `#698240` | 3.8 | Nav links over the filled header. |
| `#FAF9EF` on `#E87614` | 2.8 | The contact button mid-hover. **Predates the palette change and is still worth fixing.** |

The cream page ground and Fraunces are recorded as accepted in
`.impeccable/config.json`, so the detector no longer reports them. The contrast
pairs above are **deliberately not** suppressed.

## Type

Both faces are self-hosted in `fonts/`.

- **Fraunces**, variable, split latin / latin-ext by `unicode-range` so the
  Romanian ș, ț, ă, î, â come from the second file. Four axes travel in the one
  file: `opsz`, `wght`, `SOFT` and `WONK`. The display cut is weight **800** at
  `opsz 144, SOFT 0, WONK 1` — WONK turns on the alternate letterforms, which
  are drawn for large sizes. Anything under about 1.5rem (the wordmark, the
  county line) uses `--axes-label`, `opsz 24, WONK 0`, or the forms turn to
  mush.
- **Chivo** — everything read. 400 body, 600 small tracked uppercase labels,
  900 button.

**Alfa Slab One is gone.** The client called it horrendous. The file is still in
`fonts/` but nothing references it; delete it at launch.

**Impeccable's detector flags Fraunces as an overused face** and it is right
about plain Fraunces. What is on this page is weight 800 at display optical size
with WONK on, which is a different animal from the Fraunces regular that ships on
every AI landing page. If it ever starts to look generic, that warning is the
reason and the swap is one line in `tokens.css`.

Sizes are a fluid `clamp()` scale, `--step--1` to `--step-5`, capped at 6rem.
The hero title deliberately uses `--step-4`, not `--step-5`: at the largest step
it runs to three lines and pushes the button off the first screen.

**Do not reintroduce the fonts in `salvage/salvage.css`** (Bricolage Grotesque,
DM Mono, Caveat Brush). They belong to the previous project.

## Components

- **`.brief`** — the band under the hero, in `--sand`, carrying the three
  counted numbers. Pulled up by half its own height with a negative margin, so
  **changing its vertical padding changes the overlap and both values move
  together.** It is a wide, thin strip: number and unit sit side by side on one
  baseline, because stacking them is what makes it tall, and the client is
  explicit that widening it must never raise it. Text is `--bark`. `--sand` is
  only 1.46 against `--paper`, so **the `box-shadow` is load-bearing** — it is
  the only thing holding the plate off the page on the half that is not over the
  film.
- **`.fruit`** — photograph, name, harvest months, one line of note. Four in a
  grid, every second one dropped by `--space-xl`. The months hang off a
  `border-inline-start` in `--leaf` with `padding-block` on the same element:
  without that padding the rule is one line's cap height and reads as a speck.
  The month text is `--ink-soft`. It used to be a dark green; there is no dark
  green type left on this site.
- **`.btn`** — a soft pill in sentence case. It was a square-cut block in heavy
  tracked capitals and read as a warning notice on a page about fruit. Dark ink
  on `--action` at rest; on hover the fill sweeps in and the label goes to
  `--bark-deep`, which is 4.8 on orange where plain `--bark` is 4.09.
- **The count** — lives on `.brief__number` now. It runs when the band arrives
  and **resets to zero when the band leaves**, so it replays every time you come
  back to it. Each number holds a handle on both its stagger timer and its frame
  request, because a reset mid-count has to cancel both or an old count keeps
  writing digits over the new one. The finished value is written immediately,
  with no count and no reset, for `prefers-reduced-motion` and for a browser
  with no `IntersectionObserver`, so a number is never stuck at zero.
- **`.film__frame`** — the video set into the page with a margin all round,
  `height: clamp(15rem, 34vw, 27rem)`, rounded, with the video cropped into it.
  **Do not give it an `aspect-ratio` plus a `max-height`:** Chrome runs the
  ratio the other way and shrinks the frame's width. It is also the one thing
  excluded from the reveal's tilt — a rotated block of moving film reads as
  crooked, not as an arrival.
- **`.site-header__inner`** — `grid-template-columns: 1fr auto 1fr`, not
  `space-between`. With space-between the nav centres between the wordmark and
  the language switch, which are different widths, so it sits off the middle of
  the page.
- **`.partners`** — one centred column, label over logos, one gap value in both
  directions. Grey until hover. Its ground is `--sand`, **the same cream as
  `.brief`**: two bands doing the same job in two different creams is a thing
  the client rejected by name.

## Motion

One idea used everywhere: **a card laid on a table.** It arrives from slightly
below, tilted a hair, and settles flat. Nothing fades in place, nothing slides
in from the side.

GSAP core (`js/gsap.min.js`, no ScrollTrigger) runs the hero as one timeline
with overlapping starts. Scroll arrivals are IntersectionObserver plus a GSAP
tween, one stagger group per section so nothing is held back by a count running
the whole page. The video frame is the single exception to the tilt.

The header ground is the one exception to IntersectionObserver: it reads
`window.scrollY` directly, inside `requestAnimationFrame`, and publishes a
single `--p` custom property (0 at the top of the page, 1 once the hero has
fully scrolled past) that both the header's fill and the hero's own words are
written against in CSS, so the two always agree. Everything else on the page
is a state change with a trigger; this is a quantity tracking the scroll
thumb, which is the one place that justifies reading it every frame.

The second video (`.film__video`, in the film band) plays only while it is on
screen, the tab is visible, and `prefers-reduced-motion` is not set, synced
live so a mid-session setting change takes effect immediately. The three
numbers in `.brief` count up on arrival and reset on leaving, on the same kind
of watcher as the reveal system, with their own reduced-motion and
no-`IntersectionObserver` fallbacks so a number is never left stuck at zero.

**Watching it in an automated Chrome tab does not work.** A hidden tab throttles
the rendering pipeline, and IntersectionObserver callbacks ride on it: the
header's green ground and every scroll reveal simply never fire, and a
screenshot forces one frame and catches the transition half done. Nothing is
broken. Judge the motion in a real window.

`.reveal` is only ever added by JavaScript, never written into the HTML: with
the script removed nothing is hidden. An early build put the reveal on every
section, which left real content at opacity 0 waiting on an observer.

**Two traps in the reveal, both already sprung.** The GSAP tween must add
`.is-in` *before* it clears its inline transform — clearing it alone drops the
block straight back to `.reveal`'s 28px offset and tilt, which looked like every
element on the page falling the instant it arrived. And `.reveal` carries a CSS
`transition` on `transform` and `opacity`, which fights GSAP writing an inline
transform every frame; `.reveal--js`, added only when GSAP is present, turns that
transition off. Remove either and the whole page misbehaves at once.

## Four bugs already fixed here — do not reintroduce

1. **`preload="none"` with `autoplay`.** Tells the browser never to fetch the
   file and also to play it; several browsers resolve that by doing nothing,
   silently. Both videos use `preload="metadata"`. **Neither video ever grows
   `controls`** — they are wallpaper, not something to watch. `main.js` used to
   add controls on a rejected `play()`, and the film band triggered that against
   itself: the autoplay loop called `play()`, then the on-screen watcher called
   `pause()` a moment later, and pausing a video with a `play()` promise in
   flight rejects it. The loop now skips `.film__video` entirely, because the
   watcher owns when that one runs.
2. **`min-height: 100svh` on the hero.** `box-sizing` is `content-box` by house
   rule, so `min-height` measures the content box and the padding is added on
   top: the hero came out a whole screen *plus* its padding and pushed the
   scroll cue past the fold. The padding is subtracted in the same tokens and
   **the two lines must be kept in step.**
3. **Hero timeline in a background tab.** Animation frames are suspended there,
   so a timeline begun in a hidden tab freezes part-way and the visitor arrives
   at a half-faded hero. It now waits for `visibilitychange`.
4. **Letterboxed source video.** `orchard-hero.mp4` and `orchard-band.mp4` were
   1920x1248 files containing a 1920x1080 picture with 72px of black above and
   96px below, baked in. The strip showed both bands. `ffmpeg -vf
   crop=1920:1080:0:72` produced `orchard-hero-1080.mp4` and
   `orchard-band-1080.mp4`, which is what the page loads; the posters were
   re-cut from the cropped files. **Check any new footage with
   `ffmpeg -vf cropdetect` before wiring it up.**

## Viewing it

`file://` will not do: the Chrome tooling refuses it and video behaves
differently. Serve the folder and open over http:

```
python3 -m http.server 8811
```

**Hard-refresh after any CSS edit.** A normal reload served stale stylesheets for
a whole round of work and the colours read back wrong. If what you measure does
not match what you just wrote, this is why: re-point the `<link>` hrefs with a
cache-busting query and measure again.

## Still open

- **The client has a list of changes to the landing page.** Ask for it; do not
  start guessing improvements.
- **The motion has still never been watched at full speed.** Chrome keeps the
  automation tab hidden, which suspends animation and video, so everything has
  been verified by measuring the DOM and by forcing end states before a
  screenshot. Reveal, count-up, count-reset and the header fill are all
  confirmed correct as values; none of their *timings* has been judged by eye.
- **Responsive pass has not happened.** No media queries exist, on purpose. The
  layout is fluid (`clamp`, `auto-fit`, `flex-wrap`, scroll-snap) but no width
  has been tested. House rule: this is a separate job at the end, using
  Playwright at 320, 768 and 1280.
- **Other pages.** Three or four in total, undecided which, and deliberately not
  started.
- **Square-bracket placeholders are still banned; obvious round numbers are
  not.** A section with no real *words* stays deleted rather than filled with
  brackets — that is still the rule for testimoniale and întrebări frecvente.
  Cifre is the one exception, at the client's explicit request: its three
  numbers are visible, obviously made up, and labelled as such in the note
  under the row, rather than the section being deleted. Still owed by the
  farm:
  - **phone and email** — the markup is parked in a comment in the subsol and
    goes live the moment they arrive. **Until then the "Contactați-ne" button
    and the Contact nav link land on a footer that cannot be contacted.** This
    is the one open hole in the page.
  - **real hectares, years, tonnage** — replaces the three placeholder numbers
    in the band and removes `.brief__note`.
  - **two real quotes with names** — brings back testimoniale.
  - **five answers** — brings back întrebări frecvente.
  - **the four harvest windows — CONFIRM THESE.** The page now carries Mai to
    Iunie for cireșe, Iunie to Iulie for caise, August to Septembrie for prune,
    August to Octombrie for pere. Those are the ordinary Romanian windows, put
    in at the client's request so the green upright beside each name has
    something to hold. PRODUCT.md says this farm's harvest runs **slightly
    differently from the usual window** and that the difference is one of its
    real selling points, so these four lines are the first thing to correct
    when the farm answers. They also set the order the fruits appear in.
  - **the fourth partner's name.** `img/yellow-logo-transparent.svg` is in the
    band with `alt="Partener comercial"`, because the file arrived without a
    name. Replace the alt with the real one.
- **Dead files are gone.** Deleted on 2026-08-15: the three letterboxed
  originals (`orchard.mp4`, `orchard-hero.mp4`, `orchard-band.mp4`),
  `orchard-poster.webp`, the unused `logo-56/112.webp` srcset steps, and
  `fonts/alfa-slab-one-regular.woff2`. All recoverable from the first commit.
  **`img/hero-*.webp` was on that list by mistake and has been kept** —
  `salvage/salvage.html` uses all four sizes.
- **Kept on purpose, though nothing on the page links to them:**
  - `img/cirese.png`, `img/prune.png`, `img/pere ultim.png`,
    `img/caise (3).jpeg`, `img/ferma-fruct-logo-cropped.png` — about 10 MB of
    camera originals. These are what the `-280` and `-560` webps were exported
    from. **The responsive pass will very likely need new sizes, and you cannot
    upscale a webp to get them.** Delete only after that pass is finished.
  - `salvage/` — the old navbar, button and hero, kept at the client's explicit
    request. Not a page; nothing loads it.
  - `mockups/landing-layouts.html` — the three wireframes the arrangement was
    chosen from. It is the record of that decision.
- **Image generation is unavailable** (the connected account is out of credits),
  which is why the mockups are HTML wireframes rather than rendered pictures.
