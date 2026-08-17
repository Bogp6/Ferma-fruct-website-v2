# Design — Ferma Fruct Brabova

Written from the built page, not a plan. Code wins if they disagree.

Scope: `index.html` only.

## Idea

Cream ground, photos are the colour. Green appears three times: hero wash, header fill after scroll, subsol. Four fruits run in calendar order (cireșe, caise, prune, pere) — not to be re-sorted without checking PRODUCT.md, which says this farm's actual harvest windows differ from the placeholder ones now on the page (see Still open).

`.ticket` component (label/hole/perforation) is gone, not recoverable — rebuild from scratch if wanted back.

## Section order

Hero → banda cu cifre → declarație + fruits → video → FAQ → subsol (cu parteneri).

Chosen from three wireframes in `mockups/landing-layouts.html` (client picked C, "Benzi", then swapped parteneri/cifre order). Not to be re-litigated without asking.

Parteneri was a `--sand` band after the fruit section; client read it as heavily out of place there and it moved into the subsol on 2026-08-15, under a rule, as a closing fact rather than a proof band. FAQ is now the last thing before the page ends; wording is provisional, remove `.faq__note` once the farm confirms real answers.

Testimoniale: deleted (was all placeholder brackets, client rejected that outright). Comes back with real quotes.

## Colour

Client-supplied hex, not sampled from the logo.

Grounds (lightest to deepest):

| Token | Hex | Use |
|---|---|---|
| `--paper-lift` | `#FAF9EF` | raised cards |
| `--paper` | `#F6F1E1` | the page |
| `--cream` | `#F4EDDB` | warm alternate section |
| `--sand-soft` | `#E9E3D6` | hairlines |
| `--sand` | `#D8CFBD` | plates (stat band) |

`--paper`/`--cream` only 1.03 apart — never touch edge to edge.

Green: one hex `#698240`, three token names (`--forest`/`--forest-deep`/`--leaf`), no dark variant.

Text is brown: `--ink`/`--bark` `#493017`, `--ink-soft`/`--bark-soft` `#6E4F30`, `--bark-deep` `#3A2611` (only on `--action`). `--action` `#E87614` is the one clickable colour. `--sky` is accent only, never a band ground. No white token anywhere on the site.

Four contrast pairs fail and are signed off by the client — don't "fix" without asking:

| Pair | Ratio | Where |
|---|---|---|
| `#698240` on `#F6F1E1` | 3.8 | Display headings, large size only |
| `#F4EDDB` on `#698240` | 3.7 | Subsol secondary text |
| `#F6F1E1` on `#698240` | 3.8 | Nav links, filled header |
| `#FAF9EF` on `#E87614` | 2.8 | Button mid-hover — still worth fixing |

Cream ground + Fraunces are accepted exceptions in `.impeccable/config.json`. The pairs above are not suppressed.

## Type

Self-hosted in `fonts/`. Fraunces (variable, opsz/wght/SOFT/WONK, split latin/latin-ext for Romanian diacritics) — display cut is weight 800 at opsz 144 WONK 1; anything under ~1.5rem uses `--axes-label` (opsz 24, WONK 0) or it turns to mush. Chivo — 400 body, 600 labels, 900 button.

Alfa Slab One: unused, file still in `fonts/`, delete at launch.

Scale is fluid `clamp()`, `--step--1` to `--step-5`, capped at 6rem. Hero title uses `--step-4` not `--step-5` (step-5 wraps to 3 lines, pushes the button off screen).

Do not reintroduce `salvage/salvage.css` fonts (Bricolage Grotesque, DM Mono, Caveat Brush) — previous project.

## Components — gotchas not obvious from the CSS

- `.brief` — negative margin is half its own height; change the padding, the overlap moves with it. Number/unit sit side by side on purpose (stacking makes it tall). Shadow is load-bearing (`--sand` is only 1.46 against `--paper`).
- `.grove` — one block per fruit, four of them, in picking order. Replaced the row of four `.fruit` plates on 2026-08-15 at the client's call: the fruits are described on this page now, so there is no fruit page and nothing links out. The old `.fruit` component and its cursor-trailing ring are gone from CSS and JS; recover from commit `121458f` if ever wanted back.
  - **Two columns, each flowing on its own — not a grid with shared rows.** `.grove__lead` is the big photo then the second paragraph; `.grove__tell` is the name, the first paragraph, then the second photo. A grid was tried first and rejected twice: it pinned the second photo to a shared row line and left a large hole above it, and before that it shared a spanning photo's surplus height between two rows and opened a ~150px hole in the middle of the text column. Columns that do not wait for each other have neither problem.
  - `.grove` is `flex-direction: row-reverse` **as its normal state**, and `.grove--flip` sets `row`. That looks backwards and is deliberate: `.grove__tell` comes first in the DOM so a screen reader hears which fruit it is before anything else, and CSS puts the big photo on the left for the unflipped blocks.
  - `flex-basis: 0` on both columns, so the 1.08 to 1 ratio comes from `flex-grow` and not from how much text happened to land in each.
  - **Photo silhouette: a watercolour wash, no straight edges anywhere.** Replaced the leaf `clip-path` on 2026-08-16 at the client's call, against three references of fruit photos washed onto paper. The photo dissolves on all four sides into an irregular organic contour with granulation where the wash runs out. A short-lived torn-paper version sat here in between and was rejected; recover either from the branch history if wanted.
  - The silhouette is a **webp alpha mask** — `mask-image: var(--blob)`, four files `img/blob-{a1,a2,b1,b2}.webp`, `-webkit-mask-*` kept for Safari. Not a `radial-gradient` (that gives a clean oval, and the whole point is the irregular contour) and not `feTurbulence` (costs on every paint). `mask: url(#svgmask)` was not considered: unreliable in Safari.
  - `mask-size: 100% 100%` stretches the file onto the box, so `blob-a*` is square and `blob-b*` is 4:3 to match each frame's `aspect-ratio`. **Change a photo's ratio and the mask must be regenerated**, or the granulation smears into streaks.
  - Four files, four different pairings, set by `:nth-child` on `.orchard__groves > .grove` — so no two of the four blocks show the same outline anywhere.
  - Masks were generated once by a numpy/PIL script kept outside the repo. Recipe: the contour is a circle whose radius wobbles, `0.955 + sum of harmonics 2..6 at 0.030-0.062 each`, plus a fractal wobble at `+/-0.13`. **Harmonics above about 7 turn it into a flower; below 2 it stays an ellipse.** Alpha is `smoothstep((contour - radius) / 0.115)`. Granulation is fractal noise at `+/-0.44`, multiplied by `alpha * (1 - alpha) * 4` so it is confined to the band that is already fading and never touches the photo. The mask lives in the **alpha** channel of an RGBA file, so no `mask-mode` is needed anywhere. `cwebp -q 40 -alpha_q 88` — the RGB is blank so it costs nothing, and 88 is within 1/255 of lossless on the alpha.
  - No `border-radius`, no `overflow` — `clip-path: inset(...)` is now only the arrival wipe, and the mask does the shape. A `box-shadow` would be clipped off, so the photos sit flat on the cream.
  - `.grove__rail` — the harvest calendar, now a **real column of the block**, not a label pinned to the margin. Start month, two named stages with a note each, end month. `order: -1` puts it on the side opposite `.motif--grove-branch` without moving it in the DOM, where it sits last so a screen reader hears the fruit before its calendar.
    - **The column moves down the page.** Client's call on 2026-08-16, against a reference: cireșe keeps it on the outer edge, caise and prune carry `.grove--mid` and take it into the middle of the block, pere keeps it on the outer edge. `.grove--mid` changes nothing but the three `order` values — photo and prose stay on the sides they already had, so the zigzag from fruit to fruit survives. The same three values read correctly under both `row` and `row-reverse` because the flipped block reads them left to right and the normal one right to left.
    - The hairline always falls on the side facing `.grove__tell`, because the side is chosen by `.grove--flip` and not by where the column sits in the row. In a middle block that means the line separates the calendar from the prose, which is what it should be doing there.
    - `padding-inline: 0 var(--rail-pad)`, both sides written out: an `ol` carries a browser `padding-inline-start` of 40px, and `list-style: none` does not remove it. It left a dead strip beside the text on the two non-flipped blocks, and only the flipped rule happened to reset it.
    - **`--rail-pad` on `.grove--mid` is 3.4 times `--space-l`, not 1.** That is not breathing room, it is the corridor the drawn line sways in; `align-self: stretch` still overrides `align-items: start` on `.grove`, so the column runs the full height of the fruit.
    - **Physical `left`/`right` on the dots, not logical.** They key off which side the line is on, and that is chosen by `.grove--flip`, not by writing direction. An RTL layout would need them rewritten.
    - Stage markers are hollow rings; the two months are filled dots, so the ends of the season read as ends.
    - The straight `border-inline-*` and its two rounded corner hooks are still in the CSS but are switched off under `.has-spine`. They are the no-script picture: four straight, self-contained calendars, nothing broken. With script they would be a second line lying beside the drawn one.
  - **`.orchard__spine` — one drawn line for the whole section**, from the head of cireșe to under pere. Client's call on 2026-08-16 against two references: the first pass used the list's own border and read as too rigid.
    - **Two behaviours, chosen by `.grove--mid`.** On the edge blocks the line runs beside the calendar and carries its dots, swaying up to 16px and only ever *outwards*, so a dot never drifts into its own text. In the middle blocks it lets go of the calendar and swings the full corridor, about 190px of left-right travel; the dots stop following it there and stay pinned beside their labels at `-1.15rem`, which is what the reference does too.
    - The swing towards the text is a fraction of `--rail-pad` (0.82, the rest is guard). The swing the other way is **measured from the block's own `column-gap`** minus an 18px guard, not a constant: a constant would have worked until the first window width where that gap came out smaller than it, and from there the line would have crossed the prose. Measured clearance to the nearest text at 1248px is 37px.
    - **It has to be measured, not written in CSS**: every x depends on how wide the flexible columns came out.
    - The whole path is **one Catmull-Rom spline** through the anchor points, so it passes through each one exactly and has no corner anywhere — that is what makes it read as a drawn stroke instead of arcs glued end to end.
    - **The crossings between blocks are the hard part, and the numbers say why: the gap is 218px tall and the two long crossings travel 814px sideways.** On a rectangle that flat, any curve with short handles comes out as two tight corners with a ruler-drawn diagonal between them, which is exactly what the client rejected on 2026-08-16. The first attempt made it worse by holding each side's x for a quarter of the gap before crossing at all. What works is **long handles**: nearly the whole gap vertically (0.98 and 0.88, deliberately unequal — a symmetric S reads as machine-drawn) plus a tenth of the travel horizontally. The long vertical keeps the departure almost as upright as the calendar line it leaves, and the length spreads the turn over the entire width, so there is no straight section left. Measured bow away from the chord: 204px on the long crossings, 95px on the short one. **If it ever looks ruled again, the handles got shorter — that is the only knob.**
    - **The handle length comes from the segment, not from the span between neighbours.** Textbook Catmull-Rom takes it from the neighbours, and the anchors here are wildly uneven — 25px from the first month to the top of the block, nearly 800px between blocks. That version looped at every crowded point and threw the crossing 130px off the side of the page. Do not "simplify" it back.
    - Terminals are two small filled circles, so the stroke starts and ends on purpose rather than by fading out.
    - Redrawn by a `ResizeObserver` on the groves list and on each rail, plus `load`. `.has-spine` is added by the same code.
    - Which side the line is on is read from the border **before** `.has-spine` turns that border off, and cached — afterwards there is nothing left to read it from.
    - `.orchard__groves` took `position: relative` for this. It must not take `z-index` — same reason as `.grove`, the background drawings need the cream underneath them.
  - `.grove__cue` / `.grove__seal` — the small serif line with the drawn leaf that opens the second paragraph, and the italic closing line under a short rule. The rule is deliberately short: full width, it cut the column in two.
  - **`aspect-ratio` sits on `.grove__photo`, not on `.grove__frame`.** On the frame it is ignored: the image inside pushes the frame to its own natural height and content-based sizing wins. Measured 486x608 when it should have been 486x486. On the `img` it overrides the file's ratio and `object-fit: cover` crops. Never put `height` next to it — see `.film__frame`.
  - Photos are `*-a480/-a960.webp` (4:5 source, cropped to square) and `*-b420/-b840.webp` (4:3). **Cireșe is the exception: its source is only 640px wide, so `cirese-a640`/`cirese-b640` are the top of the ladder and it cannot reach 2x.** Ask the farm for a bigger cireșe original.
  - **Both photos of a fruit are currently different crops of the same source photograph.** The client is supplying a real second photo per fruit; swap the `-b*` files when they arrive, nothing else changes.
  - A twelve-month season chart was built here on 2026-08-15 and deleted the same day, client's call. Months are words in two places and are still placeholders — see Still open. `.grove__season` is the span under the fruit name; `.grove__rail` is the calendar column. Both come from the same reference, so if the real dates change, change both.
- `.film__frame` — height not aspect-ratio (Chrome shrinks width if both are set). Excluded from the reveal tilt (rotated video reads as crooked).
- `.site-header__inner` — `1fr auto 1fr`, not space-between (unequal end widths push the nav off centre).
- `.partners` — a row inside `.site-footer`, not a section: label at the start, four logos at the end, one hairline above it. No dividers between logos and no hover state — they are not links, and a hover to `--forest` would have been invisible on green anyway.
- `.partners__logo` — all four SVGs are inlined in `index.html` with `fill`/`stroke` changed to `currentColor`, so `.partners__logo`'s `color` recolours them, all four in `--paper` on the green. A linked SVG can't be recoloured from CSS, which is why they're inline. Whatever was white inside a mark carries `style="fill:var(--knockout)"`; `--knockout` is declared on `.partners` as the ground beneath it, so a move to another background is one line, not seven inline edits.
  - Markup is `<svg role="img" aria-label="...">`, not `<img>` — keep the label or the partner is unnamed to a screen reader.
  - Do not switch back to `mask-image` + `--logo-src`: that version didn't render in Firefox.
  - Check any edit to these four blocks in Firefox, not only Chrome — a malformed self-closing tag (`/ style="..."` instead of `style="..."/`) rendered fine in Chrome but swallowed its siblings in Firefox, leaving one logo an empty ring.
  - All four source files are square-ish canvases with inset artwork — check `viewBox` before swapping one. Fourth logo is `calc(var(--logo-size) * 1.3)`, an optical correction for its small artwork — a box, not `transform: scale()`, because the row ends flush with the subsol's right edge and a transform let the artwork hang past it. Re-measure when the real 4th partner's file arrives.
  - Big Family Market's wordmark is set in `<text>` with Arial (from the supplied artwork) — renders slightly differently without Arial installed. `overused-font=arial` is suppressed in `.impeccable/config.json` for this reason; it's a vendor logo, not a site typeface.
- `.faq` — native `<details>`, no JS. Rows are the only place `--sand-soft` is a surface, not a hairline; flat, no border, no hover/open colour change (both were tried, read as damage). Answer hangs off the same green-upright device as the fruit months; bottom padding lives on `.faq__body`, not `.faq__a`, so the rule doesn't run into empty space on a closed row.

## Fundal decorativ

Three engraved line drawings, client-supplied on 2026-08-15: `branch-farm.png`, `apple-farm.png`, `leaf-farm.png`, exported to `branch-1024.webp`, `apple-480.webp`, `leaf-640.webp`.

The apple-tree drawing that used to run down the middle of the page is **deleted** — file and CSS both, client's call. `center-background.png` and `center-background-1254.webp` are gone from `img/`; recover from `121458f` if ever needed. `leaf-top.png` and `leaf-bottom.png` are still in `img/` and still unused.

A first attempt scattered the three drawings around the page as separate ornaments. The client rejected it outright and sent a reference: a vine climbing the page between alternating content blocks. **The drawings now have one line and one job.**

- **The vine is the leaf drawing alone.** The fruit blocks alternate left and right, so the middle of the section is free the whole way down. That lane is where the vine grows: four leaves per block (`.motif--vine-leaf-c/a/d/b`, top to bottom), plus the apple hanging off the last one. The branch drawing is no longer in that lane — client's call on 2026-08-15; it moved to the section's left and right edges (see below).
  - All four leaves share `.motif--vine`, which does the placement: `inset-inline-start: 50%` and `margin-inline-start: calc(var(--w) / -2 + var(--shift))`. `--w` is the leaf's own width, so half of it puts the leaf on the middle line and `--shift` weaves it off that line. Consecutive blocks mirror (`.grove--flip` negates `--shift` and flips `scale`) so the line zigzags instead of repeating. Rotation pairs are `180 - x` between a block and its mirror; that is what keeps a leaf leaning the same way down the page.
  - Placement is never `translate` — the drift animation writes `translate` and the two would erase each other. `rotate:` and `scale:` are standalone properties for the same reason.
- The top and bottom bleeds (`-4.5rem` on `.motif--vine-leaf-c` and `.motif--vine-leaf-b`) have to add up to more than `--space-section`, or the vine reads as four separate pieces instead of one line. Re-check them if that gap changes.
- **The side branches** (`.motif--grove-branch`) sit one per fruit block, entering from a window edge and stopping over the block's corner. The side alternates with `.grove--flip`, so across the four blocks both edges of the section carry branches and the middle lane stays free for the vine. Palest thing in the section (`opacity: 0.4`) because it is the biggest. `-20rem` of it hangs past the block; `overflow: clip` on `.orchard` cuts it at the window edge. These are separate from the crossing branches on the video band and the FAQ, which are untouched.
- **The crossing branches** (`.motif--cross`) lie across the page at the joins between sections. They are what ties the vine in the middle to the rest of the page. Biggest drawing on the page, therefore the palest — at the leaves' strength one of them would weigh as much as a section.
- **The branch above the video** (`.motif--film-branch`) is a child of `.orchard`, not of `.film` — `.film` has no top padding, so inside it that space does not exist. Anchored `inset-block-end: 0`, so `overflow: clip` cuts it exactly on the orchard's bottom edge, which is exactly the video frame's top edge: the branch reads as running behind the film rather than as a drawing that was cropped. Enters from the **right** (client's correction, 2026-08-15 — it was built on the left first), but **unmirrored**: no `scale: -1 1`, so the stem still comes in low from the left and the crown opens up to the right, the same attitude as the non-flipped `.motif--grove-branch`. Mirroring it to match the side put the stem in the top corner and dropped the crown over the video, which the client rejected. `opacity: 0.46`, not the `0.38` it started at: below about `0.4` a drawing this size stops reading on cream at all.
- **The scattered leaves** (`.motif--band-leaf`, variants `a` to `j`) fill the empty band between the video caption and the FAQ title. Deliberately not a second vine: smaller, paler (`0.36`–`0.5`), no two the same size or angle, no line through them — at a shared angle two neighbours read as a pattern rather than as something that fell there. `a`, `b`, `e`, `h` and `i` are children of `.film`, `c`, `d`, `f`, `g` and `j` of `.faq` — the section boundary clips, so no leaf may straddle it, and the block insets are set from the bounding box after rotation, which is bigger than the drawing.
  - They keep out of two corners already taken: `.motif--film` enters bottom-left, `.motif--faq` top-right. Two of them are placed against text, not against the grid: `c` sits at `20%` because at `28%` it touched the Î of the title, and `f` at `28%` from the right because at `30%` its box corner reached the last e of "frecvente".
  - `k`, `l` and `m` are the only ones that cross the text rather than dodge it, and they are there because every other leaf avoided the title and the middle of the band stayed a hole. `0.28`–`0.3`, the palest of the set. They are safe under text: `z-index: -1` keeps them under the letters, and `multiply` only darkens the cream, which raises the text's contrast rather than lowering it.
  - `g` is the exception to the paleness: it sits in a gap in the middle of `.motif--faq`'s own drawing, at title height, so it carries that branch's `0.46` rather than the scatter's. It is meant to be read as a leaf of the branch, not as one more fallen leaf.
- `mix-blend-mode: multiply` needs **two** things from the host and is silent when either is missing: a stacking context of its own (`isolation: isolate`) and a background of its own. It multiplies against what was painted below it *inside* that context, and the host's background is that "below". With no background on the host the white in the PNG stays white. `.orchard`, `.film` and `.faq` therefore got `background: var(--paper)` back — they had lost it so the old page-wide tree could show through.
- **`overflow: clip` on those three sections**, both axes, no `overflow-clip-margin`. The drawings hang well past the section's inline edges and `overflow-x: clip` on `html` does **not** stop the page scrolling sideways — measured, `scrollLeft` reached 271px. `clip` never scrolls, so it does not create a second scroll container the way `hidden` or a one-axis `clip` would. The cut lands on the window edge, where a cut is invisible. Anything meant to bleed vertically has to stay inside its section.
- `z-index: -1` on `.motif`: under the section's text, over the section's background.
- A block that hosts a drawing (`.grove`) may be `position: relative` but must **never** take `z-index`, `opacity`, `filter` or `transform` — any of them makes it a stacking context and the drawing then has no cream to multiply into. This is why `.grove` itself is not in a reveal group; its children are.
- `max-width: none` on `.motif`: `base.css` caps every `img` at 100%.
- Anything sitting on the middle line uses `inset-inline-start: 50%` with a negative inline-start margin, not `margin-inline: auto` — half the element's own width brings it onto the line and whatever is left over moves it off the line on purpose. The vine leaves do it from `--w`, the apple from a flat `-1rem` because it has to hang beside the stem rather than on it. **Never `translate`** — the drift animation writes `translate` and the two would erase each other. `rotate:` and `scale:` are standalone properties for the same reason.
- **Drift:** the drawings move slower than the page, which says one thing — they are behind the paper, not on it. Driven by `animation-timeline: view()`, not JavaScript: no loop, no position reads, nothing to throttle. Wrapped in `@supports` plus `prefers-reduced-motion: no-preference`; where the browser does not know the property the drawing simply sits still, which is the design as it was before the motion.

## Motion

One idea: a card laid on a table — arrives low, tilted, settles flat. Two exceptions, both deliberate: the video frame keeps the rise and loses the tilt (rotated film reads as crooked), and the fruit photographs do not arrive at all — they are **uncovered**, bottom to top, in their own leaf shape, by one `clip-path` transition. An element doing both would be doing two moves at once, which is why `.grove__frame` is not in a reveal group and has its own observer (job 7 in `main.js`).

The two photographs of a fruit start half a second apart, in page order, so the eye is walked down the diagonal the block is laid on. That diagonal is the composition; the motion is what points at it.

GSAP core runs the hero as one timeline. Scroll arrivals are IntersectionObserver + GSAP tween, one stagger group per section. A group may carry `within:`, which restarts the stagger index inside each matching element — used for `.grove`, where a single running index across four blocks would have left the last paragraph waiting most of a second. Header fill is the one exception to IntersectionObserver: reads `scrollY` in `requestAnimationFrame`, publishes `--p` (0 to 1) that both header and hero read in CSS.

Background drawings drift on `animation-timeline: view()` — no JS at all. See Fundal decorativ.

`.film__video` plays only on-screen, tab visible, reduced-motion off, synced live. `.brief` numbers count on arrival, reset on leaving, with reduced-motion and no-IntersectionObserver fallbacks (never stuck at zero).

Can't judge in a headless/hidden Chrome tab. IntersectionObserver does fire there, but `requestAnimationFrame` is throttled, so GSAP starts a tween and never advances it: the block sits at opacity 0 for good and a screenshot shows an empty column. Pure-CSS transitions (the photo wipe) do finish. The tab can also freeze the renderer outright mid-session. Judge in a real window.

`.reveal` is added only by JS, never in HTML — script-less page shows everything. Two traps already sprung: GSAP must add `.is-in` before clearing its inline transform (order matters, or it snaps back to the offset). `.reveal--js` turns off the CSS transition while GSAP owns the frame — without it the two fight.

## Five bugs already fixed — don't reintroduce

1. `preload="none"` + `autoplay` together silently does nothing in several browsers. Both videos use `preload="metadata"`. Neither ever gets `controls`.
2. `min-height: 100svh` on the hero without subtracting padding (content-box adds it on top) — the two padding values in `.hero` must stay in step.
3. Hero timeline started in a background tab freezes mid-fade — now waits for `visibilitychange`.
4. Source video was letterboxed (1920x1248 containing a 1920x1080 picture). Cropped with `ffmpeg -vf crop=1920:1080:0:72`. Check new footage with `cropdetect` first.
5. The reveal observer's `rootMargin: '0px 0px -15% 0px'` means anything sitting in the bottom 15% of the last screenful never intersects and stays at opacity 0 forever — first hit when parteneri moved to the end of the subsol. Groups flagged `atBottom: true` in `main.js` get a second observer with no bottom inset. Any block added at the very end of the page needs that flag.

## Lățimi

Done 2026-08-17. All of it lives in section 13 of `style.css`, plus the `.burger` / `.drawer` component in section 3b. Everything above section 13 stayed fluid and was not touched.

Queries are in `em`, not `px`: in a media query `em` resolves against the browser's own base size, so a visitor who has enlarged their text gets the narrow arrangement earlier, which is when they need it. Three widths, each chosen because something measurably broke there — they are not device sizes.

- **64em** — the fruit block cannot hold three columns, and the header cannot hold mark plus nav plus language.
- **48em** — the bands and the subsol cannot hold rows of three.
- **30em** — last tightenings for a small phone.
- **`pointer: coarse`** — separate from all three. Footer nav links measured 19px tall and the social marks 24px; both are under the 44px finger threshold at any width, and width is the wrong thing to ask about anyway.

Decisions worth not re-litigating:

- **The wordmark leaves the bar under 64em, client's call.** Only the round mark stays. The full name is still in the subsol, so it is not lost from the page.
- **`.grove` stacks with `display: contents` on `.grove__tell` / `.grove__lead`**, then six `order` values. Those two divs are not reveal targets (main.js watches `.grove__head`, `.grove__intro`, `.grove__detail`), so nothing is left without a box to move. Reading order becomes name, intro, photo A, prose, photo B, calendar. The block's zigzag survives as auto margins: one photo left, the other right, mirrored per `.grove--flip`.
- **Photos cap at 26rem on one column, and the cap is not taste.** The files stop at 840w and 960w; wider than 26rem and a 2x screen would stretch them. `sizes` was rewritten to match — four entries now, and it must be rewritten again if that cap moves.
- **The drawn spine runs at every width. It is the section's drawing, not a wide-screen ornament — do not switch it off.** It was switched off under 64em in the first version of this pass and the client rejected that outright on 2026-08-17: the snaking stroke is the centrepiece of the orchard's background. Three things make it work on one column:
  - **The side of each calendar's border is never overridden.** It stays whatever `.grove--flip` chose, so the line runs right, left, right, left down the four fruits and sweeps across the page in between. Forcing every calendar to the left kills the snake — that was the other half of the same rejected version. Measured at 320px: the curve spans x −8 to 288 across a 280px list, so it reaches both edges and crosses the middle on every join.
  - **The line's vertical run is taken from the whole `.grove`, not from the calendar** (`plot.grove` in job 8). On a wide screen the calendar is a column stretched to the block's full height, so rail and block are the same run. Stacked, the calendar is only the block's last row, and a line drawn between two calendars would travel through everything in the fruit between them — measured, it cut 18 separate pieces of text at 320px. Now it descends beside the whole block, exactly as it does wide.
  - **`.grove` carries a corridor** (`padding-inline` on the line's side, `--space-l`) and the calendar is pulled back out into it with a negative inline margin, so the stroke falls in open space 8px inside the list edge rather than on the text's own edge. This costs text width: 250px at 320px, about 32 characters a line. That is the price of keeping the drawing, and it was paid deliberately.
- **The mid-block behaviour folds into edge behaviour under 64em** (`plot.mid && wide.matches`). The 3.4x corridor was the room the line had between three columns; on one column there is nothing to sit between. All four blocks therefore hug their own calendar and carry its dots, and the CSS rules that pin mid-block dots at `-1.15rem` are overridden to match. If these two ever disagree, the dots come off the line.
- The calendar's corner hooks need no special handling: `.has-spine` is present at every width now, and it already turns them off.
- **Both subsol branches stay under 64em, small, client's call 2026-08-17.** They were hidden in the first pass because the free lane they live in on a wide screen is `--gutter` and nothing more at that width. The client asked for them back at a size proportionate to the narrow subsol, so: `--leaf` drops to `clamp(6.5rem, 22vw, 11rem)`, roughly 40% of the wide-screen width, opacity from 0.62 to 0.38, and each anchors directly in its own corner (top right, bottom left) instead of going through the `--leaf-lane` formula, which has nothing to work with down there.
  - **The room they sit in is made on the vertical, not the horizontal.** `padding-block: var(--space-2xl)` on the subsol under 64em. Without it there is no band free of letters anywhere in a stacked subsol: measured, the top branch started on the farm's name and the bottom one covered the copyright line by 49 by 22 pixels. With it, clearance to the nearest text is 26px at both ends at 320px, and at 768px neither branch shares a horizontal band with any text at all.
  - Cream on this green is 3.69:1 and drops to 2.40:1 over the watercolour at full strength, which is why clearance is measured rather than eyeballed. Re-measure if the subsol gains a row.
- **The motifs are thinned, not scaled.** Four of seven declaration leaves go, seven of thirteen band leaves go — those were placed against percentages measured on a wide title and land on it at narrow widths.
- **All four vine leaves per block run at every width, client's call 2026-08-17.** The first version of this pass deleted the middle two (`-a` and `-d`) because the centre lane they grew through is the text on one column. That left each block carrying one leaf at its top edge and one at its bottom, with 1400px of bare paper between them, and the client rejected it: the descending run of leaves is the section's background and has to be there on a phone too. The two middle leaves now sit **astride the outer edge of each photograph** instead of on the centre line — half behind the photo (motifs are `z-index: -1`, so the photo covers them), half out in the lane beside it. Details that must hold:
  - **`--shift` is derived from the photo's own width rule, not typed as a number:** `calc(min(100%, 26rem) - 50%)` is the distance from the block's centre to the photo's outer edge at any width, because `min(100%, 26rem)` is what `.grove__frame` is capped to. Change that cap and this follows it, or the leaf stops landing on the edge. Sign picks the side: positive goes to `frame--a`'s lane, negative to `frame--b`'s, and `.grove--flip` inverts both, so the run reads right, right, left, left and mirrors at the next fruit — the vine still snakes.
  - **The vertical figures are the photo's centre, not its top.** Measured across all four fruits at every narrow width, photo A holds 22%–39% of the block and photo B 63%–76%; the leaves sit at 30% and 70% with half of `--w` subtracted to put the leaf's centre, not its corner, on that mark.
  - **No text is behind these two leaves, and that is load-bearing, not luck.** The leaf's darkest pixel leaves the small brown text (`#6E4F30`, 12–16px) at 3.62:1 over it, under the 4.5:1 floor, so the overlap is avoided by placement rather than by dropping opacity. Verified by testing every leaf box against every text line rect in all four blocks: zero hits at 493px and at 853px. Re-run that check if the block's row order changes. (The desktop layout does let `-a` cross the prose — same 3.62:1 worst case, pre-existing, untouched here.)
  - **The clamp floors are large on purpose.** On a phone the photograph fills the whole column, so the strip of leaf left showing is only as wide as the gutter, about 50px, and the only way it grows is upward: `9rem`/`9.5rem` floors make that strip tall enough to read as a leaf rather than as a smudge. Measured on screen: 139px and 144px of leaf visible at 493px, 207px and 228px at 853px.
- **The side menu is a paper panel, not green.** The bar is already green once filled, and a green panel over it read as one undifferentiated block. Panel carries the mark, three links in Fraunces on its own clamp (`--step-2` dips under 1.5rem where WONK 1 turns to mush), the contact button held at the bottom for thumb reach, and the language pair.
- **The panel is sized by two insets, not a width.** `box-sizing` is `content-box` across the project, so a written `inline-size` is content width and the padding lands on top of it — that shipped a 314px panel on a 320px screen before it was caught. `inset-inline: max(18%, calc(100% - 20rem)) 0` gives `min(82%, 20rem)` as a border box.
- **The panel's leaf must not have a negative block-end inset.** The panel scrolls on a short screen, and a drawing hanging below it adds exactly that much scroll — measured, 95px of empty space under the menu. Rotation counts too: a 15rem square at 24deg reaches about 38px past its box on every side.
- **No focus trap was written.** Open, everything in `<body>` except the panel takes `inert`, which does the same job in four lines. `inert` also sits on the closed panel in the HTML, so tabbing never reaches an off-screen menu.
- **The burger is hidden without JavaScript** via `.no-js` on `<html>`, removed by an inline script in `<head>` (in the head, not at the foot, or the bar flickers). Script off, the plain row of three links takes its place. Nothing on the page becomes unreachable either way.
- `--gutter` gained `max(..., env(safe-area-inset-left), env(safe-area-inset-right))` and the viewport meta gained `viewport-fit=cover`. Without the meta, `env()` is always 0 and the token change does nothing.

Measured after the pass, at 320, 768, 1000 and 1333 CSS px: no horizontal overflow at any of them (`scrollWidth` equals `clientWidth`), and the desktop layout is byte-for-byte what it was.

The spine is checked by sampling 600 points along the real curve with `getPointAtLength` and testing each against every text and photo box in the section. The passing result is **zero hits at 320 and at 768**, with the curve staying 12px clear of the window edge at 320 and 27px at 768. Re-run that check after any change to the corridor, the block order, or the gap between fruits — a spine that crosses a paragraph is a hairline drawn through the letters, and it is not obvious from a glance at the code. Every calendar dot measures 0px from its own hairline at all narrow widths, on all four fruits.

**Both `style.css` and `main.js` carry the same `?v=` string, and both must be bumped together.** The first version of this pass bumped only the stylesheet, and a cached `main.js` then drew the spine on top of the stacked layout: on the non-flipped blocks it read the line's side from the desktop border and put the stroke at the far right of the screen while the dots sat at the far left. That is what a stale script looks like here, and it looks like a layout bug. Note also that a plain reload does not necessarily refetch `index.html` itself from `python3 -m http.server`, which sends no cache headers — hard-refresh, or add a query to the page URL.

## Viewing it

`file://` breaks video and Chrome tooling. Serve it:

```
python3 -m http.server 8811
```

Hard-refresh after CSS edits — stale stylesheets have caused false reads before.

## Still open

- Client has a list of landing-page changes — ask, don't guess.
- Motion timing never watched at full speed in a real window (only verified as DOM/CSS end states).
- Responsive pass done 2026-08-17, see Lățimi below. What is still unverified there: nothing has been opened on a real phone, only measured in a browser at 320/768/1280.
- Other pages: 3-4 planned, not started.
- Placeholder policy: square-bracket placeholders banned; obvious round numbers are the one exception (cifre, FAQ), both flagged with a note to remove once real. Still owed by the farm:
  - phone + email (markup parked in an index.html comment — until then Contact links go nowhere)
  - real hectares/years/tonnage (removes `.brief__note`)
  - two quotes with names (brings back testimoniale)
  - FAQ answers in the farm's own words (removes `.faq__note`)
  - **harvest windows — CONFIRM.** Current dates (Mai-Iunie cireșe, Iunie-Iulie caise, August-Septembrie prune, August-Octombrie pere) are generic placeholders. PRODUCT.md says this farm's actual harvest differs from the usual window and that's a real selling point — check before launch. Also sets fruit order. Written in words in `.grove__season`; `.orchard__foot` says they are provisional and goes at the same time.
  - **second photograph per fruit.** Both `-a*` and `-b*` files are crops of the same source. Client is sending real second photos; only the `-b*` files change.
  - **a bigger cireșe original.** `cirese.png` is 640px wide, so cireșe is the one fruit whose photos cannot reach 2x.
  - fourth partner's name (`img/yellow-logo-transparent.svg`, alt is a placeholder)
- Deleted 2026-08-15, recoverable from first commit: letterboxed video originals, unused webp srcset steps, alfa-slab-one font. Also deleted the same day, recoverable from `121458f`: `center-background.png` and `center-background-1254.webp`.
- **Unused since the `.fruit` row came out, not yet deleted:** `cirese/caise/prune/pere-p320.webp` and `-p640.webp` (the 3:4 plate crops), plus the older `-280`/`-560` set. Nothing references any of them. Ask before deleting — they are cheap to keep and a plate row could come back.
- Kept on purpose though unused: camera-original images in `img/` (source for exported webps, needed for the responsive pass), `salvage/` (old design, client wants it kept), `mockups/landing-layouts.html` (record of the layout decision).
- `fructe.html` is no longer referenced anywhere. The fruit cards used to point at it; the descriptions live on the landing page now, and the nav's `#fructe` is an in-page anchor. Whether a fruit page still gets built is the client's open three-or-four-pages question in PRODUCT.md.
- Image generation unavailable (account out of credits) — mockups are HTML wireframes, not renders.
