# Design — Ferma Fruct Brabova

Written from the built page, not a plan. Code wins if they disagree.

Scope: `index.html` (built) and `contact.html` (scaffold only, 2026-08-18).

## Which file to read

One stylesheet per page, on purpose. Read only the one for the page you are on.

| Page | Its CSS | Shared with |
|---|---|---|
| `index.html` | `css/style.css` (~2900 lines) | — |
| `contact.html` | `css/contact.css` | `style.css` for three components only |

`contact.html` loads `style.css` **before** `contact.css`, but only for the three components both pages share: `.site-header`, `.drawer`/`.burger`, and `.site-footer`. Nothing else in `style.css` applies there — hero, `.grove`, the drawn spine, the background drawings and both width passes are all landing-page-only.

**So: working on the contact page means reading `css/contact.css` and stopping.** Do not read the 2900 lines of `style.css` to understand it. The end of `style.css` carries the same note; the head of `contact.css` says what it does with each shared component.

Contact CSS never goes in `style.css`, and landing CSS never goes in `contact.css`. A component that genuinely ends up on both pages belongs in `style.css`, with a line added to the table above.

There is no include mechanism — the header, drawer, footer and the partner band inside it are hand-copied HTML. **A change to any of them has to be made in both files.** The `<div class="partners">` block and its comment are byte-identical in the two files (client asked for the band on the contact page too, 2026-08-18), so they diff cleanly — keep it that way rather than letting the two drift.

## Idea

Cream ground, photos are the colour. Green appears three times: hero wash, header fill after scroll, subsol. Four fruits run in calendar order (cireșe, caise, prune, pere) — not to be re-sorted without checking PRODUCT.md, which has different actual harvest windows than the current placeholders.

`.ticket` component (label/hole/perforation) is gone, not recoverable.

## Section order

Hero → banda cu cifre → declarație + fruits → video → FAQ → subsol (cu parteneri). Client picked this from three wireframes in `mockups/landing-layouts.html`; not to be re-litigated without asking.

Parteneri moved from its own band into the subsol on 2026-08-15 (client's call). Testimoniale deleted (was placeholder brackets, client rejected); comes back with real quotes. FAQ wording is provisional — remove `.faq__note` once real answers arrive.

## Colour

Client-supplied hex, not sampled from the logo.

| Token | Hex | Use |
|---|---|---|
| `--paper-lift` | `#FAF9EF` | raised cards |
| `--paper` | `#F6F1E1` | the page |
| `--cream` | `#F4EDDB` | warm alternate section |
| `--sand-soft` | `#E9E3D6` | hairlines |
| `--sand` | `#D8CFBD` | plates (stat band) |

`--paper`/`--cream` only 1.03 apart — never touch edge to edge.

Green: one hex `#698240`, three token names (`--forest`/`--forest-deep`/`--leaf`), no dark variant.

Text: `--ink`/`--bark` `#493017`, `--ink-soft`/`--bark-soft` `#6E4F30`, `--bark-deep` `#3A2611` (only on `--action`). `--action` `#E87614` is the one clickable colour. `--sky` is accent only, never a band ground. No white token anywhere.

Four contrast pairs fail and are client-signed-off — don't "fix" without asking:

| Pair | Ratio | Where |
|---|---|---|
| `#698240` on `#F6F1E1` | 3.8 | Display headings, large size only |
| `#F4EDDB` on `#698240` | 3.7 | Subsol secondary text |
| `#F6F1E1` on `#698240` | 3.8 | Nav links, filled header |
| `#FAF9EF` on `#E87614` | 2.8 | Button mid-hover — still worth fixing |

Cream ground + Fraunces are accepted exceptions in `.impeccable/config.json`. The pairs above are not suppressed there.

## Type

Self-hosted in `fonts/`. Fraunces (variable, opsz/wght/SOFT/WONK, split latin/latin-ext for Romanian diacritics) — display cut is weight 800 at opsz 144 WONK 1; anything under about 1.5rem uses `--axes-label` (opsz 24, WONK 0) or it turns to mush. Chivo — 400 body, 600 labels, 900 button.

Alfa Slab One: unused, file still in `fonts/`, delete at launch.

Scale is fluid `clamp()`, `--step--1` to `--step-5`, capped at 6rem. Hero title uses `--step-4` not `--step-5` (step-5 wraps to 3 lines, pushes the button off screen).

Do not reintroduce `salvage/salvage.css` fonts (Bricolage Grotesque, DM Mono, Caveat Brush) — previous project.

## Components — gotchas not obvious from the CSS

- `.brief` — negative margin is half its own height; change the padding, the overlap moves with it. Shadow is load-bearing (`--sand` is only 1.46 against `--paper`).
- `.grove` — one block per fruit, four of them, in picking order. Replaced the old row of four `.fruit` plates on 2026-08-15; that component and its cursor-trailing ring are gone from CSS/JS, recoverable from commit `121458f`.
  - Two columns, each flowing on its own, not a grid with shared rows — a grid pinned photos to shared row lines and opened large gaps in the text column, tried and rejected twice.
  - `flex-direction: row-reverse` is the **normal** state, `.grove--flip` sets `row`. Deliberate: `.grove__tell` comes first in the DOM (screen reader hears the fruit name first) while CSS puts the big photo on the left for unflipped blocks.
  - `flex-basis: 0` on both columns, so the 1.08:1 ratio comes from `flex-grow`, not from how much text happened to land in each.
  - **Photo silhouette is a watercolour wash** (webp alpha mask, `mask-image: var(--blob)`, files `img/blob-{a1,a2,b1,b2}.webp`, `-webkit-mask-*` for Safari) — not `radial-gradient` (too clean an oval) and not `feTurbulence` (paints every frame). `mask-size: 100% 100%` stretches to the box, so `blob-a*` is square and `blob-b*` is 4:3 to match each frame's aspect ratio — **change a photo's ratio and the mask must be regenerated.** Set by `:nth-child` so no two of the four blocks share an outline.
    - Mask generation recipe (numpy/PIL script kept outside the repo): contour is a circle whose radius wobbles, `0.955 + harmonics 2..6 at 0.030–0.062 each`, plus fractal wobble `±0.13`. Harmonics above ~7 turn it into a flower; below 2 it stays an ellipse. Alpha is `smoothstep((contour - radius) / 0.115)`. Granulation is fractal noise `±0.44` multiplied by `alpha * (1 - alpha) * 4` so it stays confined to the fading band. Mask lives in the alpha channel of an RGBA file. `cwebp -q 40 -alpha_q 88`.
  - No `border-radius`, no `overflow` — `clip-path: inset(...)` is only the arrival wipe now; the mask does the shape. No `box-shadow` (would be clipped off); photos sit flat on cream.
  - `.grove__rail` — the harvest calendar, a real column of the block, not a margin label. `order: -1` puts it opposite `.motif--grove-branch` without moving it in the DOM.
    - **The column moves down the page per fruit** (client's call, 2026-08-16): cireșe and pere keep it on the outer edge, caise and prune carry `.grove--mid` and move it to the middle. `.grove--mid` only changes the three `order` values.
    - `padding-inline: 0 var(--rail-pad)` — both sides written out because `list-style: none` doesn't remove a list's default `padding-inline-start`.
    - `--rail-pad` on `.grove--mid` is 3.4× `--space-l` — that's the corridor the drawn spine sways in, not breathing room.
    - Dots use physical `left`/`right`, not logical — they key off which side the spine is on (chosen by `.grove--flip`), not writing direction. RTL would need them rewritten.
    - The straight `border-inline-*` and its rounded-corner hooks stay in the CSS but are switched off under `.has-spine` — that's the no-script fallback.
  - **`.orchard__spine`** — one drawn Catmull-Rom spline for the whole section, from cireșe's head to under pere (client's call, 2026-08-16, replaced a version that used the list's own border and read as too rigid).
    - On edge blocks the line runs beside the calendar and carries its dots, swaying up to 16px, only outwards. In middle blocks it lets go of the calendar and swings the full corridor (~190px); dots there stay pinned at `-1.15rem`.
    - The swing toward the text is `0.82 × --rail-pad`. The swing away is measured from the block's own `column-gap` minus an 18px guard, not a constant — a constant would eventually be smaller than the gap and the line would cross the prose.
    - Handle length comes from the segment, not the neighbour span (textbook Catmull-Rom does the latter and loops badly given how uneven these anchors are — 25px to nearly 800px). **Do not "simplify" this back to textbook.**
    - Long, unequal handles (0.98 and 0.88 of the gap) are what keep the between-block crossings reading as a drawn stroke instead of two corners and a ruled diagonal — a symmetric S reads as machine-drawn.
    - Redrawn by `ResizeObserver` on the groves list and each rail, plus `load`. Which side the spine is on is read from the border **before** `.has-spine` turns it off, and cached.
    - `.orchard__groves` needs `position: relative` for this and must never take `z-index` (same reason as `.grove` below).
  - `.grove__cue` / `.grove__seal` — small serif line and italic closer. The rule under `.grove__seal` is deliberately short; full width cut the column in two.
  - `aspect-ratio` sits on `.grove__photo`, not `.grove__frame` — on the frame it's ignored (content-based sizing wins); on the `img` it overrides the file's ratio and `object-fit: cover` crops. Never put `height` next to it.
  - Photos: `*-a480/-a960.webp` (4:5, cropped to square) and `*-b420/-b840.webp` (4:3). **Cireșe's source is only 640px wide** — `cirese-a640`/`cirese-b640` are the top of its ladder, can't reach 2x. Ask the farm for a bigger original.
  - Both photos of a fruit are currently different crops of the same source; client is sending real second photos — only the `-b*` files change when they arrive.
- `.film__frame` — height, not `aspect-ratio` (Chrome shrinks width if both are set). Excluded from the reveal tilt (rotated video reads as crooked).
- `.site-header__inner` — `1fr auto 1fr`, not `space-between` (unequal end widths would push the nav off centre).
- `.partners` — a row inside `.site-footer`, not a section. No dividers, no hover (not links; hover to `--forest` would be invisible on green anyway).
- `.partners__logo` — all four SVGs inlined in `index.html` with `fill`/`stroke` set to `currentColor` so `.partners__logo`'s `color` recolours them. A linked SVG can't be recoloured from CSS. Whatever was white inside a mark carries `style="fill:var(--knockout)"` (declared on `.partners`), so moving to another background is one line.
  - Markup is `<svg role="img" aria-label="...">`, not `<img>` — keep the label.
  - Don't switch back to `mask-image` + `--logo-src` — didn't render in Firefox.
  - Check edits to these four in Firefox specifically — a malformed self-closing tag rendered fine in Chrome but swallowed sibling logos in Firefox before.
  - Fourth logo is `calc(var(--logo-size) * 1.3)` (optical correction, a box not a transform, so the row still ends flush). Re-measure when the real 4th partner's file arrives.
  - Big Family Market's wordmark is `<text>` in Arial — `overused-font=arial` is suppressed in `.impeccable/config.json` for this, it's a vendor logo not a site typeface.
- `.faq` — native `<details>`, no JS. `--sand-soft` is a flat surface here, not a hairline; no hover/open colour change (tried, read as damage). Bottom padding lives on `.faq__body`, not `.faq__a`.

## Fundal decorativ

Three engraved line drawings, client-supplied 2026-08-15: `branch-farm.png`, `apple-farm.png`, `leaf-farm.png` → exported to `branch-1024.webp`, `apple-480.webp`, `leaf-640.webp`.

The centre apple-tree drawing that used to run down the page is **deleted** (file and CSS, client's call) — recoverable from `121458f`. `leaf-top.png`/`leaf-bottom.png` are still in `img/`, still unused.

First attempt scattered the three drawings as separate ornaments; client rejected it and sent a reference of a vine climbing between alternating content blocks. Now:

- **The vine is the leaf drawing alone**, running down the free middle lane between the alternating fruit blocks: four leaves per block (`.motif--vine-leaf-c/a/d/b`) plus the apple on the last one. Placement via `.motif--vine`: `inset-inline-start: 50%` plus a negative margin from `--w` and `--shift`; `.grove--flip` negates `--shift` and flips `scale` so consecutive blocks mirror into a zigzag. Placement is never `translate` (the drift animation writes `translate` and the two would erase each other); `rotate:`/`scale:` are standalone for the same reason.
  - Top/bottom bleeds on the end leaves must sum to more than `--space-section` or the vine reads as separate pieces — recheck if that gap changes.
- **Side branches** (`.motif--grove-branch`) — one per fruit block, alternating sides with `.grove--flip` so both edges carry branches and the middle stays clear for the vine. `opacity: 0.4` (palest thing in the section, because biggest).
- **Crossing branches** (`.motif--cross`) — lie across the page at section joins, tying the vine to the rest of the page. Biggest drawing, palest.
- **Branch above the video** (`.motif--film-branch`) — child of `.orchard`, not `.film` (`.film` has no top padding). Enters from the right, unmirrored (mirroring put the stem in the wrong corner, client rejected). `opacity: 0.46` — below ~0.4 it stops reading on cream.
- **Scattered leaves** (`.motif--band-leaf`, `a`–`j`) fill the band between the video caption and FAQ title. Deliberately not a second vine — smaller, paler (0.36–0.5), no two the same size/angle. Split as children of `.film` and `.faq` so the section boundary clips them; none may straddle it. `k`/`l`/`m` are the only ones allowed to cross the FAQ title text (`z-index: -1`, `multiply` only darkens cream so it raises contrast rather than lowering it).
- `mix-blend-mode: multiply` needs both a stacking context (`isolation: isolate`) and a background on the host, or it multiplies against nothing and stays white. `.orchard`, `.film`, `.faq` all have `background: var(--paper)` for this reason.
- **`overflow: clip` on those three sections, both axes** — the drawings bleed past the section edges, and `overflow-x: clip` on `html` alone does not stop sideways page scroll (measured `scrollLeft` reaching 271px).
- `z-index: -1` on `.motif` — under the section's text, over its background. A block hosting a drawing (`.grove`) may be `position: relative` but must never take `z-index`/`opacity`/`filter`/`transform` — any of those makes it a stacking context and the drawing loses its cream to multiply into.
- `max-width: none` on `.motif` (`base.css` caps every `img` at 100%).
- **Drift**: drawings move slower than the page (behind the paper, not on it), via `animation-timeline: view()` — no JS, no loop, nothing to throttle. Wrapped in `@supports` + `prefers-reduced-motion: no-preference`; unsupported browsers just get the still version.

## Motion

One idea: a card laid on a table — arrives low, tilted, settles flat. Two exceptions: the video frame keeps the rise and loses the tilt (rotated film reads as crooked), and the fruit photographs don't arrive at all — they're **uncovered**, bottom to top, by one `clip-path` transition (own observer, job 7 in `main.js`, not in a reveal group).

The two photographs of a fruit start half a second apart, in page order, walking the eye down the block's diagonal.

GSAP core runs the hero as one timeline. Scroll arrivals are IntersectionObserver + GSAP tween, one stagger group per section. `within:` restarts the stagger index inside each matching element — used for `.grove`, so the last paragraph across four blocks isn't waiting a full second. Header fill reads `scrollY` in `requestAnimationFrame` and publishes `--p` (0 to 1) for both header and hero CSS.

Background drawings drift on `animation-timeline: view()` — see Fundal decorativ.

`.film__video` plays only on-screen, tab visible, reduced-motion off. `.brief` numbers count on arrival, reset on leaving, with reduced-motion and no-IntersectionObserver fallbacks.

**Can't judge motion in a headless/hidden Chrome tab** — `requestAnimationFrame` throttles there, so GSAP tweens never advance and a screenshot shows an empty column. CSS-only transitions (the photo wipe) still finish. Judge in a real window.

`.reveal` is added only by JS, never in HTML, so a script-less page shows everything. GSAP must add `.is-in` before clearing its inline transform, or it snaps back. `.reveal--js` turns off the CSS transition while GSAP owns the frame, or the two fight.

## Five bugs already fixed — don't reintroduce

1. `preload="none"` + `autoplay` together silently does nothing in several browsers. Both videos use `preload="metadata"`. Neither ever gets `controls`.
2. `min-height: 100svh` on the hero without subtracting padding (content-box adds it on top) — the two padding values in `.hero` must stay in step.
3. Hero timeline started in a background tab freezes mid-fade — now waits for `visibilitychange`.
4. Source video was letterboxed (1920×1248 containing a 1920×1080 picture). Cropped with `ffmpeg -vf crop=1920:1080:0:72`. Check new footage with `cropdetect` first.
5. Reveal observer's `rootMargin: '0px 0px -15% 0px'` means anything in the bottom 15% of the last screenful never intersects and stays at opacity 0. Groups flagged `atBottom: true` in `main.js` get a second observer with no bottom inset. Any block added at the very end of the page needs that flag.

## Lățimi

Done 2026-08-17. Lives in section 13 of `style.css`, plus `.burger`/`.drawer` in section 3b. Everything above section 13 stayed fluid, untouched.

Queries are in `em`, not `px` (so a visitor with enlarged text gets the narrow arrangement earlier). Three widths, each chosen because something measurably broke there:

- **64em** — fruit block can't hold three columns; header can't hold mark + nav + language.
- **48em** — bands and subsol can't hold rows of three.
- **30em** — last tightenings for a small phone.
- **`pointer: coarse`** — separate from the three above. Footer nav links and social marks are under the 44px finger threshold at any width.

Decisions worth not re-litigating:

- **Wordmark leaves the bar under 64em** (client's call) — only the round mark stays; full name is still in the subsol.
- **`.grove` stacks with `display: contents`** on `.grove__tell`/`.grove__lead`, then six `order` values. Reading order: name, intro, photo A, prose, photo B, calendar.
- **Photos cap at 26rem on one column** — the files stop at 840w/960w, so wider than that with a 2x screen would stretch them. `sizes` has four entries matched to this; rewrite both together if the cap moves.
- **The drawn spine runs at every width** — client rejected turning it off under 64em on 2026-08-17: it's the section's centrepiece, not a wide-screen extra. Three things make it work stacked:
  - Each calendar's border side is never overridden — it stays whatever `.grove--flip` chose, so the spine still zigzags across the page.
  - The line's vertical run is taken from the whole `.grove`, not the calendar (`plot.grove` in job 8) — otherwise a line drawn calendar-to-calendar would cut through the fruit text between them.
  - `.grove` carries a corridor (`padding-inline`, `--space-l`) and the calendar is pulled back into it, so the stroke falls in open space rather than on the text's own edge. Costs about 32 characters a line at 320px — paid deliberately.
- **Mid-block behaviour folds into edge behaviour under 64em** (`plot.mid && wide.matches`) — the 3.4× corridor was room between three columns, which doesn't exist stacked, so all four blocks hug their own calendar there.
- **Both subsol branches stay under 64em**, small, client's call — `--leaf` drops to `clamp(6.5rem, 22vw, 11rem)`, opacity 0.62 → 0.38, anchored directly in their own corners.
  - `padding-block: var(--space-2xl)` on the subsol under 64em makes room for them — without it the branches overlapped the farm name and the copyright line.
- **Motifs are thinned, not scaled** under 64em — several leaves were placed against percentages measured on a wide title and don't land right narrow.
- **All four vine leaves per block run at every width** (client's call 2026-08-17) — an earlier version dropped the middle two, client rejected it as breaking the descending vine on phone. They now sit astride each photo's outer edge (`--shift` derived from `.grove__frame`'s own width cap, not typed as a number) rather than the centre line. No text sits behind them at any width — verified against every text line in all four blocks; re-run that check if block order changes.
- **Side menu is a paper panel, not green** — a green panel over the already-green filled bar read as one undifferentiated block.
- **Panel is sized by two insets, not a width** (`content-box` means a written width is content width, padding adds on top — a 314px panel shipped on a 320px screen before this was caught). `inset-inline: max(18%, calc(100% - 20rem)) 0`.
- **Panel's leaf must not have a negative block-end inset** — the panel scrolls on short screens and a drawing hanging below it adds to that scroll.
- **No focus trap was written** — `inert` on everything but the panel when open does the job; it's also on the closed panel so tabbing never reaches an off-screen menu.
- **Burger is hidden without JavaScript** via `.no-js` removed by an inline script in `<head>` (must be head, not foot, or the bar flickers).
- `--gutter` gained `max(..., env(safe-area-inset-left), env(safe-area-inset-right))`; viewport meta gained `viewport-fit=cover` (required for `env()` to be non-zero).

Measured after the pass at 320/768/1000/1333 CSS px: no horizontal overflow anywhere, desktop layout unchanged. Spine checked by sampling 600 points along the curve and testing against every text/photo box — zero hits at 320 and 768. Re-run that check after any change to the corridor, block order, or gap between fruits.

## Ecrane mari

Done 2026-08-17, section 14 of `style.css`. One query, `min-width: 85em`, and nothing outside it — below 1360 the file behaves exactly as before, verified at 1280 (`--lane` unset, old type scale, no overflow).

85em is where the column reaches `--container` and the composition stops growing; measured, that happens at 1355px. The client's call was to **hold the width, not grow it**: the reading measures were already right and the fruit photos are near their source ceiling, so a wider container would have softened them. What changed instead is everything that was following the *window* rather than the composition.

- **`--lane`** is the whole idea: `max(0px, (100vw - var(--container)) / 2 - var(--gutter))`, how much empty paper there is beyond the normal gutter. It is 0 at the threshold, so every rule that uses it passes through 85em continuously — measured at 1359 against 1360, nothing moves more than 3px and the collision set is identical. `100vw` includes the scrollbar (~15px); every drawing that uses it is cut by `overflow: clip`, so the error never shows.
- **The branches grow by `--lane` instead of moving.** A branch enters from the window edge and stops over the block's corner; on a wide screen the window edge walks away from the block by exactly `--lane`, so the drawing gets longer by exactly that and lands in the same place. Ceiling is `64rem` — the true width of `branch-1024.webp`, never upscale. Above about 2400px the ceiling binds and the branches reach slightly less far in (grove branch 162px into the block at 1360, 147px at 2560). That is the accepted cost of not upscaling.
  - `.motif--grove-branch` also needs its offset grown (`calc(-20rem - var(--lane))`), because its host is the block, not the window. The other three (`.motif--cross`, `.motif--film-branch`) hang off full-bleed sections, so their negative offsets are already right at any width.
  - The subsol branches are the same trick on `--leaf`. `--leaf-lane` was already correct — it grows on its own and keeps them locked to the column — but at 2560 they stopped 368px short of the window with their own cut edge showing. `sizes` on both `<img>` tags was rewritten to match the new displayed width; **it must be rewritten again if that 64rem ceiling moves.**
- **The scattered leaves are pinned from the middle of the page, not from the window edge.** They were placed in percentages of a full-bleed section, so at 2560 four of the seven declaration leaves and five of the band leaves landed out in the empty margins instead of over the text. Conversion is `calc(50% - Nrem)` where **N = 42.5 − 0.85 × the old percentage** (42.5rem is half the page at the threshold). `band-leaf-e` sits at 50%, dead centre, so it is the one that did not move.
- **Type and rhythm start growing again.** Every clamp in `tokens.css` tops out around 1330–1430px, so a 27-inch monitor was getting the laptop page. `--step-3`, `--step-4` and `--space-section` get a second, gentler ramp above the threshold: hero title 64px at 1360 and 80px at 2560, section rhythm 8.5rem to 10rem. **Body text deliberately does not grow** — 18px reads the same on any monitor and the line is already at `--measure`.
  - `--space-section` grew, so the two vine end-leaves went from `-4.5rem` to `-5.25rem`: together they must still cover the gap between blocks or the vine reads as four pieces. That tie is in section 2 and it is easy to miss.
  - The bigger type pushes text down into a few leaves that used to clear it. Bounding-box testing counts 10 new leaf-over-text overlaps at 1920 against 59 already present at 1359 — the test is deliberately conservative, the drawings sit at 0.27–0.5 opacity under `multiply`, and the result was looked at in a real window before it was accepted.

Measured after the pass at 1280, 1359, 1360, 1920 and 2560: no horizontal overflow anywhere, spine hits zero at every width with 320px of clearance to the window edge at 1920, and the subsol branches still cross the column by their `--leaf-reach` (160px) while bleeding past the window.

**Both `style.css` and `main.js` share the same `?v=` string — bump both together.** A cached `main.js` alone reads the spine's side from the desktop border and draws it on the wrong edge, which looks like a layout bug, not a cache bug. Also: `python3 -m http.server` sends no cache headers, so a plain reload doesn't always refetch `index.html` itself — hard-refresh, or add a query to the page URL.

## Viewing it

`file://` breaks video and Chrome tooling. Serve it:

```
python3 -m http.server 8811
```

Hard-refresh after CSS edits — stale stylesheets have caused false reads before.

## Pagina de contact

Scaffold written 2026-08-18. Chrome and stylesheet only — the page itself is not designed and its content is not decided with the client.

What is already settled:

- **`<body class="page-inner">`** — the page has no hero, and `main.js` publishes `--p` (the header's fill, 0 to 1) only when it finds a `.hero`. Left unset, `--p` is 0 and the bar is cream text on cream paper. `.page-inner` pins `--p: 1`, so the bar is green from the first frame. Any future page without a hero needs the same class.
- **`--header-h`** is `calc(3rem + var(--space-xs) * 2)`, built from the round mark's real size and the bar's own padding, because the fixed header takes no space in flow and the first section would slide under it. Measured against the real bar at 1456px: both are 78px. Change either part and this has to follow.
- **Nav links are file-absolute** (`index.html#fructe`), not bare anchors — those sections do not exist on this page.
- **`main.js` is loaded unchanged.** Every job in it looks for its element first and exits when it is missing, so in practice only the side menu runs here. Checked, not assumed.
- The `<main>` holds one placeholder heading and paragraph. They are the right length for the slot and nothing more; replace them, do not build around them.

**All four Contact links now go to the page.** Until 2026-08-18 the top bar, the side menu, the hero button and the footer nav all pointed at `#contact`, which was an `id` on `index.html`'s own footer — clicking Contact scrolled you to the bottom of the landing page. The `id` is gone and all four are `href="contact.html"`. Nothing in CSS or `main.js` ever keyed off that `id`, checked before removing it.

Not written and not to be guessed: phone, email, address, opening hours. They are on the "Still open" list below. A form cannot be submitted from here (Cloudflare Pages, no server code) — it would have to post to a third-party endpoint.

## Still open

- Client has a list of landing-page changes — ask, don't guess.
- Motion timing never watched at full speed in a real window (only verified as DOM/CSS end states).
- Responsive pass done 2026-08-17 (see Lățimi); not yet opened on a real phone, only measured in-browser at 320/768/1280.
- Other pages: 3-4 planned. `contact.html` exists as a scaffold since 2026-08-18 (see „Pagina de contact” above); its content and layout are not designed. The rest are not started.
- Placeholder policy: square-bracket placeholders banned; round numbers are the one exception (cifre, FAQ), both flagged for removal once real. Still owed by the farm:
  - phone + email — nothing on the site carries either yet. The parked `.site-footer__contact` markup that used to sit in a comment in `index.html` was deleted on 2026-08-18 when the four Contact links were repointed; the real place for these is `contact.html`, not the footer.
  - real hectares/years/tonnage (removes `.brief__note`)
  - two quotes with names (brings back testimoniale)
  - FAQ answers in the farm's own words (removes `.faq__note`)
  - **harvest windows — CONFIRM.** Current dates (Mai-Iunie cireșe, Iunie-Iulie caise, August-Septembrie prune, August-Octombrie pere) are placeholders; PRODUCT.md says the real windows differ and that's a selling point. Also sets fruit order. In `.grove__season` and `.orchard__foot`.
  - second photograph per fruit (only `-b*` files change when real photos arrive)
  - a bigger cireșe original (current source is 640px wide, can't reach 2x)
  - fourth partner's name (`img/yellow-logo-transparent.svg`, alt is a placeholder)
- Deleted 2026-08-15, recoverable from first commit: letterboxed video originals, unused webp srcset steps, alfa-slab-one font. Also recoverable from `121458f`: `center-background.png`/`center-background-1254.webp`.
- Unused since the `.fruit` row came out, not yet deleted: `cirese/caise/prune/pere-p320.webp`/`-p640.webp` and the older `-280`/`-560` set. Ask before deleting.
- Kept on purpose though unused: camera-original images in `img/` (source for exported webps), `salvage/` (old design, client wants it kept), `mockups/landing-layouts.html` (record of the layout decision).
- `fructe.html` is no longer referenced — nav's `#fructe` is now an in-page anchor. Whether a fruit page still gets built is open in PRODUCT.md.
- Image generation unavailable (account out of credits) — mockups are HTML wireframes, not renders.
