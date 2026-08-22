# Design — Ferma Fruct Brabova

Written from the built page, not a plan. Code wins if they disagree.

Scope: `index.html` (built) and `contact.html` (in progress).

## Cache busting — read this before you touch CSS or JS

`style.css`, `contact.css`, `despre.css` and `main.js` are all linked with a `?v=` query. **Bump it on every change to those files, in all three pages.** The comment above the `main.js` tag in `index.html` says so; it is easy to miss and the failure is silent and expensive — the browser serves the old stylesheet, the new asset filenames are never requested, and the change looks like it simply did not happen. Current value: `20260821-masks-1`. `contact.js` and `despre.js` carry their own versions and only move when they change.

## Which file to read

One stylesheet per page, on purpose. Read only the one for the page you are on.

| Page | Its CSS | Shared with |
|---|---|---|
| `index.html` | `css/style.css` (~2900 lines) | — |
| `contact.html` | `css/contact.css` | `style.css` for three components only |
| `despre.html` | `css/despre.css` | `style.css` for the same three, plus `.motif` |

`contact.html` loads `style.css` before `contact.css`, but only for the three shared components: `.site-header`, `.drawer`/`.burger`, `.site-footer`. Nothing else in `style.css` applies there — hero, `.grove`, the drawn spine, and the landing page's own drawings are landing-page-only.

Two width exceptions cross this boundary: section 13 of `style.css` narrows the shared header/footer on phone, and section 14 gives the contact page `--lane` and the wide type ramp above 85em (used by section 9 of `contact.css`, which also raises `--container` there — see "Lățimi — pagina de contact").

**Working on the contact page means reading `css/contact.css` and stopping.** Do not read the 2900 lines of `style.css` to understand it. The end of `style.css` carries the same note; the head of `contact.css` says what it does with each shared component.

Contact CSS never goes in `style.css`, and landing CSS never goes in `contact.css`. A component that ends up on both belongs in `style.css`, with a line added to the table above.

There is no include mechanism — the header, drawer, footer, and the partner band inside it are hand-copied HTML. **A change to any of them has to be made in both files.** The `<div class="partners">` block and its comment are byte-identical in the two files (client wanted the band on the contact page too), so they diff cleanly — keep it that way rather than letting the two drift.

## Idea

Cream ground, photos are the colour. Green appears three times: hero wash, header fill after scroll, subsol. Four fruits run in calendar order (cireșe, caise, prune, pere) — not to be re-sorted without checking PRODUCT.md, which has different actual harvest windows than the current placeholders.

`.ticket` component (label/hole/perforation) is gone, not recoverable.

## Section order

Hero → banda cu cifre → declarație + fruits → video → FAQ → subsol (cu parteneri). Client picked this from three wireframes in `mockups/landing-layouts.html`; not to be re-litigated without asking.

Parteneri moved from its own band into the subsol on client's call. Testimoniale deleted (was placeholder brackets, client rejected); comes back with real quotes. FAQ wording is provisional — remove `.faq__note` once real answers arrive.

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
- `.grove` — one block per fruit, four of them, in picking order. Replaced the old row of four `.fruit` plates; that component and its cursor-trailing ring are gone from CSS/JS, recoverable from commit `121458f`.
  - Two columns, each flowing on its own, not a grid with shared rows — a grid pinned photos to shared row lines and opened large gaps in the text column, tried and rejected twice.
  - `flex-direction: row-reverse` is the **normal** state, `.grove--flip` sets `row`. Deliberate: `.grove__tell` comes first in the DOM (screen reader hears the fruit name first) while CSS puts the big photo on the left for unflipped blocks.
  - `flex-basis: 0` on both columns, so the 1.08:1 ratio comes from `flex-grow`, not from how much text happened to land in each.
  - **Photo silhouette is a watercolour wash** (webp alpha mask, `mask-image: var(--blob)`, files `img/blob-{a1,a2,b1,b2}.webp`, `-webkit-mask-*` for Safari) — not `radial-gradient` (too clean an oval) and not `feTurbulence` (paints every frame). `mask-size: 100% 100%` stretches to the box, so `blob-a*` is square and `blob-b*` is 4:3 to match each frame's aspect ratio — **change a photo's ratio and the mask must be regenerated.** Set by `:nth-child` so no two of the four blocks share an outline.
    - Mask generation recipe (numpy/PIL script kept outside the repo): contour is a circle whose radius wobbles, `0.955 + harmonics 2..6 at 0.030–0.062 each`, plus fractal wobble `±0.13`. Harmonics above ~7 turn it into a flower; below 2 it stays an ellipse. Alpha is `smoothstep((contour - radius) / 0.115)`. Granulation is fractal noise `±0.44` multiplied by `alpha * (1 - alpha) * 4` so it stays confined to the fading band. Mask lives in the alpha channel of an RGBA file. `cwebp -q 40 -alpha_q 88`.

    - **`blob-e{1,2,3}.webp` (2026-08-21), the despre masks — different numbers, and the old ones were broken.** They replace `blob-d*`, whose contour ran off the top and bottom of the file: the browser cut the silhouette flat there, which read as an unfinished photo. Measured on the old files, 29–46% of the top and right edges were fully opaque. Renamed rather than overwritten so a returning visitor cannot get a cached broken mask.

      What changed: base radius `0.96` in a box normalised to `[-1, 1]` on both axes (r = 1 touches the edge midpoints), harmonics 2..6 at `0.014–0.028` plus slow wobble on k = 1, 3 — max reach stays under 1, so nothing clips. Band widened to `0.17` and granulation raised to `0.95`: at the documented `0.44` a speck can never flip once alpha drops under about 0.35, so the outer band came out as a tight sawtooth instead of spray. Fractal noise is 8 octaves from 8 cells with amplitude decay `0.82`, so the fine octaves carry real weight.

      **They are 16:9 (960×540), not 16:10.** `blob-d*` were 16:10 stretched over a 16:9 photo box, which flattened the top and bottom bulges on top of the clipping.

      Check after regenerating: fill about 60% of the box and every edge 0% solid, matching `blob-a1` (60.6%) and `blob-b1` (60.7%). `blob-c*` are still on the old clipped recipe — unused, check before reusing them anywhere.

    - **`blob-{a3,a4,b3,b4,f1}.webp` (2026-08-21), the index and contact masks.** Client's call: the despre photos read cleaner, so the whole site moved onto the `blob-e` recipe. `blob-{a1,a2,b1,b2}` had about **12% semi-transparent pixels** — a soft milky band around every photo that read as an unfinished edge. The new files have **0.00%**: alpha is thresholded to black or white, so the edge is spray, not a fade. Fill 57–61%, every edge 0% solid.
      - `blob-a3` / `blob-a4` — 900×900, `.grove__frame--a` (1:1).
      - `blob-b3` / `blob-b4` — 900×675, `.grove__frame--b` (4:3).
      - `blob-f1` — 960×600, `.reach__frame` on contact. **New ratio:** `.reach__photo` is 8:5 and was wearing the 4:3 `blob-b1` stretched over it, which pulled the granulation into streaks.
      - Letter is the aspect ratio, number is the recipe generation. `a1`/`a2` are still live on `despre.html` (`.keeper__frame`) — do not delete them, and do not put them back on index or contact.
    - **`blob-{b5,b6,b7}.webp` (2026-08-22), the phone masks on despre.** 900×675 (4:3), same `blob-e` recipe and the same `REACH = 0.935` rescaling, seeds 71 / 204 / 613. Fill 58.5 / 61.1 / 57.1%, 0.00% semi-transparent, every edge 0% solid — measured, in family with `b3` (56.9%) and `b4` (58.7%).
      - They exist because under 48em both `.stage__photo` and `.reel__media` turn 4:3: the photos there can only grow in height, and a 16:9 `blob-e` stretched over a 4:3 box would comb the granulation into vertical dashes. Three of them, not two, so the carousel's `3n` cycle never repeats a silhouette inside one screen.
      - `b3`/`b4` were left alone on index rather than reused here, so a change to the phone masks cannot reach the landing page.
      - Contour rescaling differs from the `blob-e` write-up above: the harmonic sum is normalised so the contour's own maximum lands at `REACH = 0.935`, which guarantees the granulation spray stays inside `r = 1` no matter which seed comes up. Base radius `0.96` plus raw harmonics could reach 1.14 and clip.
  - No `border-radius`, no `overflow` — `clip-path: inset(...)` is only the arrival wipe now; the mask does the shape. No `box-shadow` (would be clipped off); photos sit flat on cream.
  - `.grove__rail` — the harvest calendar, a real column of the block, not a margin label. `order: -1` puts it opposite `.motif--grove-branch` without moving it in the DOM.
    - **The column moves down the page per fruit** (client's call): cireșe and pere keep it on the outer edge, caise and prune carry `.grove--mid` and move it to the middle. `.grove--mid` only changes the three `order` values.
    - `padding-inline: 0 var(--rail-pad)` — both sides written out because `list-style: none` doesn't remove a list's default `padding-inline-start`.
    - `--rail-pad` on `.grove--mid` is 3.4× `--space-l` — that's the corridor the drawn spine sways in, not breathing room.
    - Dots use physical `left`/`right`, not logical — they key off which side the spine is on (chosen by `.grove--flip`), not writing direction. RTL would need them rewritten.
    - The straight `border-inline-*` and its rounded-corner hooks stay in the CSS but are switched off under `.has-spine` — that's the no-script fallback.
  - **`.orchard__spine`** — one drawn Catmull-Rom spline for the whole section, from cireșe's head to under pere (client's call, replaced a version that used the list's own border and read as too rigid).
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

Three engraved line drawings, client-supplied: `branch-farm.png`, `apple-farm.png`, `leaf-farm.png` → exported to `branch-1024.webp`, `apple-480.webp`, `leaf-480.webp`.

**Leaf sizes (2026-08-21).** `leaf-640.webp` (72 KB) was serving every leaf on all three pages, and the biggest leaf on the site renders at 240 CSS px (`.drawer__leaf`, `clamp(10rem, 28svh, 15rem)`) — so 640 was more than 2.5× the pixels any of them could use. Now:

  - `leaf-480.webp` (28 KB, `cwebp -q 80 -alpha_q 88`) — **every leaf on all three pages.** 480 covers the biggest leaf on the site (the 240 px drawer) at 2× DPR, so nothing is under-resolved anywhere.
  - `leaf-320.webp` and `leaf-640.webp` are now **unreferenced**; kept in `img/` in case a leaf ever needs redrawing at another size.

  One URL repeated many times is one download, so the cheapest page is the one that uses a single leaf file. That is why despre's roots leaves moved off `leaf-320` too: two files cost 42 KB, one costs 28 KB, and the roots leaves got sharper in the bargain.

  `.drawer__leaf` is hand-copied byte-identical into all three pages, so its size changed in all three at once. Keep them identical.

The centre apple-tree drawing that used to run down the page is **deleted** (file and CSS, client's call) — recoverable from `121458f`. `leaf-top.png`/`leaf-bottom.png` are still in `img/`, still unused.

First attempt scattered the three drawings as separate ornaments; client rejected it and sent a reference of a vine climbing between alternating content blocks. Now:

- **The vine is the leaf drawing alone**, running down the free middle lane between the alternating fruit blocks: four leaves per block (`.motif--vine-leaf-c/a/d/b`) plus the apple on the last one. Placement via `.motif--vine`: `inset-inline-start: 50%` plus a negative margin from `--w` and `--shift`; `.grove--flip` negates `--shift` and flips `scale` so consecutive blocks mirror into a zigzag. Placement is never `translate` (the drift animation writes `translate` and the two would erase each other); `rotate:`/`scale:` are standalone for the same reason.
  - Top/bottom bleeds on the end leaves must sum to more than `--space-section` or the vine reads as separate pieces — recheck if that gap changes.
- **Side branches** (`.motif--grove-branch`) — one per fruit block, alternating sides with `.grove--flip` so both edges carry branches and the middle stays clear for the vine. `opacity: 0.4` (palest thing in the section, because biggest).
- **Crossing branches** (`.motif--cross`) — lie across the page at section joins, tying the vine to the rest of the page. Biggest drawing, palest.
- **Branch above the video** (`.motif--film-branch`) — child of `.orchard`, not `.film` (`.film` has no top padding). Enters from the right, unmirrored (mirroring put the stem in the wrong corner, client rejected). `opacity: 0.46` — below ~0.4 it stops reading on cream.
- **Scattered leaves** (`.motif--band-leaf`, `a`–`j`) fill the band between the video caption and FAQ title. Deliberately not a second vine — smaller, paler (0.36–0.5), no two the same size/angle. Split as children of `.film` and `.faq` so the section boundary clips them; none may straddle it. `k`/`l`/`m` are the only ones allowed to cross the FAQ title text (`z-index: -1`, `multiply` only darkens cream so it raises contrast rather than lowering it).
- `mix-blend-mode: multiply` needs both a stacking context (`isolation: isolate`) and a background on the host, or it multiplies against nothing and stays white. `.orchard`, `.film`, `.faq` all have `background: var(--paper)` for this reason.
- **`overflow: clip` on those three sections, both axes** — the drawings bleed past the section edges, and `overflow-x: clip` on `html` alone does not stop sideways page scroll.
- `z-index: -1` on `.motif` — under the section's text, over its background. A block hosting a drawing (`.grove`) may be `position: relative` but must never take `z-index`/`opacity`/`filter`/`transform` — any of those makes it a stacking context and the drawing loses its cream to multiply into.
- `max-width: none` on `.motif` (`base.css` caps every `img` at 100%).
- **Drift**: drawings move slower than the page (behind the paper, not on it), via `animation-timeline: view()` where supported and a request-animation-frame scroll fallback elsewhere. The landing page keeps its authored motion when the operating system requests reduced motion.

## Motion

One idea: a card laid on a table — arrives low, tilted, settles flat. Two exceptions: the video frame keeps the rise and loses the tilt (rotated film reads as crooked), and the fruit photographs don't arrive at all — they're **uncovered**, bottom to top, by one `clip-path` transition (own observer, job 7 in `main.js`, not in a reveal group).

The two photographs of a fruit start half a second apart, in page order, walking the eye down the block's diagonal.

GSAP core runs the hero as one timeline. Its four parts move upward into place from an already-visible first paint; the timeline never changes their opacity. This is deliberate: browsers may throttle the first animation frames after a reload, and an opacity-based start left the hero looking empty until those frames resumed. The completed timeline clears its transforms. Scroll arrivals are IntersectionObserver + GSAP tween, one stagger group per section. `within:` restarts the stagger index inside each matching element — used for `.grove`, so the last paragraph across four blocks isn't waiting a full second. Header fill reads `scrollY` in `requestAnimationFrame` and publishes `--p` (0 to 1) for both header and hero CSS.

Background drawings drift on `animation-timeline: view()` — see Fundal decorativ.

`.hero__film` autoplays normally on desktop and on phones that permit it. iOS Low Power Mode can reject the cold-load request and cannot be bypassed without a real visitor gesture: Safari's native overlay is hidden, the poster remains visible, and the first touch, pointer press or key press retries playback. The recovery listeners remove themselves as soon as the film starts. `pageshow` and returning to a visible tab retry too.

`.film__video` plays only on-screen while the tab is visible. If iOS rejects autoplay, its own centred play control appears and retries from the visitor's tap. `.brief` numbers count on arrival and reset on leaving, with a no-IntersectionObserver fallback.

**Can't judge timing in a headless/hidden Chrome tab** — `requestAnimationFrame` throttles there, so GSAP tweens may not advance at normal speed. The hero remains visible in that state; CSS-only transitions such as the photo wipe still finish. Judge timing in a real window.

`.reveal` is added only by JS, never in HTML, so a script-less page shows everything. GSAP must add `.is-in` before clearing its inline transform, or it snaps back. `.reveal--js` turns off the CSS transition while GSAP owns the frame, or the two fight.

## The drift fallback read rem as pixels (fixed 2026-08-21)

`main.js`, the `if (!hasViewTimeline)` branch — the levitation the background drawings do on scroll, in **Firefox and any browser without view timelines**.

`--drift` is written in rem and is **not** registered with `@property`, so `getComputedStyle(el).getPropertyValue('--drift')` hands back the raw token `"2.75rem"`, not a pixel length. The old code ran `parseFloat` on it and got **2.75**. Every drawing on the page was levitating two to five pixels instead of 44 to 80 — visually nothing, which is exactly how the client described it.

Fixed with an offscreen probe element: the value is assigned to a real `width` and read back computed, so layout does the unit conversion. Now `2.75rem` → 44 px, matching what the CSS `motif-drift` keyframes produce in Chromium exactly. The probe also survives `--drift` ever becoming `px`, `em`, or `calc()`.

Chromium has view timelines, so it runs the CSS path and never showed this. **Do not test motif drift in Chromium alone.**

## Five bugs already fixed — don't reintroduce

1. `preload="none"` + `autoplay` together silently does nothing in several browsers. Both videos use `preload="metadata"`. Neither ever gets `controls`.
2. `min-height: 100svh` on the hero without subtracting padding (content-box adds it on top) — the two padding values in `.hero` must stay in step.
3. Hero timeline started in a background tab freezes mid-fade — now waits for `visibilitychange`.
4. Source video was letterboxed (1920×1248 containing a 1920×1080 picture). Cropped with `ffmpeg -vf crop=1920:1080:0:72`. Check new footage with `cropdetect` first.
5. Reveal observer's `rootMargin: '0px 0px -15% 0px'` means anything in the bottom 15% of the last screenful never intersects and stays at opacity 0. Groups flagged `atBottom: true` in `main.js` get a second observer with no bottom inset. Any block added at the very end of the page needs that flag.

## Lățimi

Lives in section 13 of `style.css`, plus `.burger`/`.drawer` in section 3b. Everything above section 13 stayed fluid, untouched.

Queries are in `em`, not `px` (so a visitor with enlarged text gets the narrow arrangement earlier). Three widths, each chosen because something measurably broke there:

- **64em** — fruit block can't hold three columns; header can't hold mark + nav + language.
- **48em** — bands and subsol can't hold rows of three.
- **30em** — last tightenings for a small phone.
- **`pointer: coarse`** — separate from the three above. Footer nav links and social marks are under the 44px finger threshold at any width.

Decisions worth not re-litigating:

- **Wordmark leaves the bar under 64em** (client's call) — only the round mark stays; full name is still in the subsol.
- **`.grove` stacks with `display: contents`** on `.grove__tell`/`.grove__lead`, then six `order` values. Reading order: name, intro, photo A, prose, photo B, calendar.
- **Photos cap at 26rem on one column** — the files stop at 840w/960w, so wider than that with a 2x screen would stretch them. `sizes` has four entries matched to this; rewrite both together if the cap moves.
- **The drawn spine runs at every width** — client rejected turning it off under 64em: it's the section's centrepiece, not a wide-screen extra. Three things make it work stacked:
  - Each calendar's border side is never overridden — it stays whatever `.grove--flip` chose, so the spine still zigzags across the page.
  - The line's vertical run is taken from the whole `.grove`, not the calendar — otherwise a line drawn calendar-to-calendar would cut through the fruit text between them.
  - `.grove` carries a corridor (`padding-inline`, `--space-l`) and the calendar is pulled back into it, so the stroke falls in open space rather than on the text's own edge. Costs about 32 characters a line at 320px — paid deliberately.
- **Mid-block behaviour folds into edge behaviour under 64em** (`plot.mid && wide.matches`) — the 3.4× corridor was room between three columns, which doesn't exist stacked, so all four blocks hug their own calendar there.
- **Both subsol branches stay under 64em**, small, client's call — `--leaf` drops to `clamp(6.5rem, 22vw, 11rem)`, opacity 0.62 → 0.38, anchored directly in their own corners.
  - `padding-block: var(--space-2xl)` on the subsol under 64em makes room for them — without it the branches overlapped the farm name and the copyright line.
- **Motifs are thinned, not scaled** under 64em — several leaves were placed against percentages measured on a wide title and don't land right narrow.
- **All four vine leaves per block run at every width** (client's call) — an earlier version dropped the middle two, client rejected it as breaking the descending vine on phone. They now sit astride each photo's outer edge (`--shift` derived from `.grove__frame`'s own width cap, not typed as a number) rather than the centre line. No text sits behind them at any width — re-run that check if block order changes.
- **Side menu is a paper panel, not green** — a green panel over the already-green filled bar read as one undifferentiated block.
- **Panel is sized by two insets, not a width** (`content-box` means a written width is content width, padding adds on top — a 314px panel shipped on a 320px screen before this was caught). `inset-inline: max(18%, calc(100% - 20rem)) 0`.
- **Panel's leaf must not have a negative block-end inset** — the panel scrolls on short screens and a drawing hanging below it adds to that scroll.
- **No focus trap was written** — `inert` on everything but the panel when open does the job; it's also on the closed panel so tabbing never reaches an off-screen menu.
- **Burger is hidden without JavaScript** via `.no-js` removed by an inline script in `<head>` (must be head, not foot, or the bar flickers).
- `--gutter` gained `max(..., env(safe-area-inset-left), env(safe-area-inset-right))`; viewport meta gained `viewport-fit=cover` (required for `env()` to be non-zero).

Measured after the pass at 320/768/1000/1333 CSS px: no horizontal overflow anywhere, desktop layout unchanged. Spine checked by sampling 600 points along the curve and testing against every text/photo box — zero hits at 320 and 768. Re-run that check after any change to the corridor, block order, or gap between fruits.

## Ecrane mari

Section 14 of `style.css`. One query, `min-width: 85em`, and nothing outside it — below 1360 the file behaves exactly as before, verified at 1280 (`--lane` unset, old type scale, no overflow).

85em is where the column reaches `--container` and the composition stops growing; measured, that happens at 1355px. The client's call was to **hold the width, not grow it**: the reading measures were already right and the fruit photos are near their source ceiling, so a wider container would have softened them. What changed instead is everything that was following the *window* rather than the composition.

- **`--lane`** is the whole idea: `max(0px, (100vw - var(--container)) / 2 - var(--gutter))`, how much empty paper there is beyond the normal gutter. It is 0 at the threshold, so every rule that uses it passes through 85em continuously — nothing moves more than 3px across the boundary and the collision set is identical. `100vw` includes the scrollbar; every drawing that uses it is cut by `overflow: clip`, so the error never shows.
- **The branches grow by `--lane` instead of moving.** A branch enters from the window edge and stops over the block's corner; on a wide screen the window edge walks away from the block by exactly `--lane`, so the drawing gets longer by exactly that and lands in the same place. Ceiling is `64rem` — the true width of `branch-1024.webp`, never upscale. Above about 2400px the ceiling binds and the branches reach slightly less far in. That is the accepted cost of not upscaling.
  - `.motif--grove-branch` also needs its offset grown (`calc(-20rem - var(--lane))`), because its host is the block, not the window. The other three (`.motif--cross`, `.motif--film-branch`) hang off full-bleed sections, so their negative offsets are already right at any width.
  - The subsol branches are the same trick on `--leaf`. `sizes` on both `<img>` tags was rewritten to match the new displayed width; **it must be rewritten again if that 64rem ceiling moves.**
- **The scattered leaves are pinned from the middle of the page, not from the window edge.** They were placed in percentages of a full-bleed section, so at 2560 several of them landed in the empty margins instead of over the text. Conversion is `calc(50% - Nrem)` where **N = 42.5 − 0.85 × the old percentage** (42.5rem is half the page at the threshold). `band-leaf-e` sits at 50%, dead centre, so it is the one that did not move.
- **Type and rhythm start growing again.** Every clamp in `tokens.css` tops out around 1330–1430px, so a 27-inch monitor was getting the laptop page. `--step-3`, `--step-4` and `--space-section` get a second, gentler ramp above the threshold: hero title 64px at 1360 and 80px at 2560, section rhythm 8.5rem to 10rem. **Body text deliberately does not grow** — 18px reads the same on any monitor and the line is already at `--measure`.
  - `--space-section` grew, so the two vine end-leaves went from `-4.5rem` to `-5.25rem`: together they must still cover the gap between blocks or the vine reads as four pieces. That tie is in section 2 and it is easy to miss.
  - The bigger type pushes text down into a few leaves that used to clear it. Overlaps at 1920 are more numerous than at 1359, but the drawings sit at 0.27–0.5 opacity under `multiply`, and the result was looked at in a real window before it was accepted.

Measured after the pass at 1280, 1359, 1360, 1920 and 2560: no horizontal overflow anywhere, spine hits zero at every width, and the subsol branches still cross the column while bleeding past the window edge.

**Both `style.css` and `main.js` share the same `?v=` string — bump both together.** A cached `main.js` alone reads the spine's side from the desktop border and draws it on the wrong edge, which looks like a layout bug, not a cache bug. Also: `python3 -m http.server` sends no cache headers, so a plain reload doesn't always refetch `index.html` itself — hard-refresh, or add a query to the page URL.

## Viewing it

`file://` breaks video and Chrome tooling. Serve it:

```
python3 -m http.server 8811
```

Hard-refresh after CSS edits — stale stylesheets have caused false reads before.

## Fotografia mare de pe contact este acum film (2026-08-21)

`.reach__frame` held `livada-drum-*.webp`, marked in the markup as provisional. Client replaced it with `img/tractor-contact.mp4` — the tractor working between the rows.

- Same markup pattern as `.story__film` and `.hero__film`: `autoplay muted loop playsinline preload="metadata"`, an `aria-label` instead of `alt`, poster `tractor-contact-poster.webp` (frame 0, `cwebp -q 72`, 24 KB). The `::-webkit-media-controls` suppression is copied from despre so iOS does not draw a play badge over it.
- Source is **960×624 (20:13)**, the box stays **8:5**, so `object-fit: cover` trims about 4% off the top and bottom. `blob-f1` is already 8:5 — no mask regeneration.
- **Under-resolved on retina.** The box renders 896 px wide at a 1280 window, so a 2× screen wants ~1792 px and the source is 960. It will look soft. Ask the farm for a bigger export before launch; do not upscale.
- `livada-drum-720/1440/1600.webp` are now unused. Ask before deleting.

## Pagina de contact

Scaffold. Chrome and stylesheet only — the page itself is not designed and its content is not decided with the client.

What is already settled:

- **`<body class="page-inner">`** — the page has no hero, and `main.js` publishes `--p` (the header's fill, 0 to 1) only when it finds a `.hero`. Left unset, `--p` is 0 and the bar is cream text on cream paper. `.page-inner` pins `--p: 1`, so the bar is green from the first frame. Any future page without a hero needs the same class.
- **`--header-h`** is `calc(3rem + var(--space-xs) * 2)`, built from the round mark's real size and the bar's own padding, because the fixed header takes no space in flow and the first section would slide under it. Measured against the real bar at 1456px: both are 78px. Change either part and this has to follow.
- **Nav links are file-absolute** (`index.html#fructe`), not bare anchors — those sections do not exist on this page.
- **`main.js` is loaded unchanged.** Every job in it looks for its element first and exits when it is missing, so in practice only the side menu runs here. Checked, not assumed.
- The `<main>` holds one placeholder heading and paragraph. They are the right length for the slot and nothing more; replace them, do not build around them.

**All four Contact links now go to the page** (`href="contact.html"`) — previously the top bar, side menu, hero button, and footer nav all pointed at `#contact`, an `id` on `index.html`'s own footer, so clicking Contact scrolled to the bottom of the landing page. Nothing in CSS or `main.js` ever keyed off that `id`, checked before removing it.

Not written and not to be guessed: phone, email, address, opening hours. They are on the "Still open" list below. A form cannot be submitted from here (Cloudflare Pages, no server code) — it would have to post to a third-party endpoint.

## Lățimi — pagina de contact

Section 9 of `contact.css`. Nothing above section 9 changed except the road's own coordinates, which were refactored into four variables so one media query can move the whole drawing at once. `index.html` is untouched; `style.css` is untouched.

Three queries, each at a measured break, plus one for touch:

- **80em** — the corridor between the form and the map, the one the drawn road descends through, closes. Below the query the road moves to the left margin and the first screen stacks onto one column.
- **`pointer: coarse`** — fields are 45px tall and "Deschide traseul" 29px, both under the 44px finger threshold at any width.
- **85em** — the column grows to 86rem and the branches grow with `--lane`.
- **93em** — where the column actually reaches 86rem. The wider fields wait for it.

### The road is now written as four variables

`--road-left` / `--road-span` (horizontal) and `--road-y0` / `--road-yh` (vertical), all on `.contact`. The line, the six leaves and the orange dot are all positioned from that one band, so moving the band moves the whole drawing and nothing needs re-deriving. `--road-x` and `--road-y` on each leaf are now fractions of the band (0.47, not 47%). Default is the column and the full page height, so the wide layout is byte-for-byte what it was.

### Narrow: the road becomes a margin rule

- **A corridor, `clamp(2.25rem, 7vw, 9rem)`, is added to the text's left padding** and the road lives in it with its leaves. Costs about five characters a line at 320px — paid deliberately, same call as index's spine: the road is the page's idea, not a wide-screen extra. Without a corridor the line would not merely cross text, it would **vanish under the map box and the photo**, both of which have their own opaque background while the road sits at `z-index: -1`. That reads as a line broken into three pieces.
- **The road's box is stretched upward** (`--road-y0: -43.7%`, `--road-yh: 143%`). Two conditions fix those numbers, they are not eyeballed: the curve's first point (0.316 of the box) must land inside the top padding, and the apple, which is last (0.97), must land still inside the page — at 100% `overflow: clip` would cut it in half on the footer boundary. Without this the line started at the photo's bottom edge on a wide screen, but stacked that landed in the middle of the form.
- **All leaf angles become 90deg.** The band is narrow against a page several thousand pixels tall, so the curve's measured tangent is 88–90deg the whole way down. Each leaf's own angle offset is untouched, so they still alternate sides.
- **The photo's `scale(1.12)` grows from `transform-origin: left center`.** Centred, it pushed the photo over the corridor, and the photo is opaque, so it covered the line.
- **`.motif--branch-right` is hidden below 80em.** Stacked, the text column takes the whole free width, so there is no paper left on the right for a drawing, and any drawing there falls across the form's fields, which have their own background and cut it in two. The left branch keeps its size but its setback tightens, so only the far foliage shows, inside the corridor. If the right branch is wanted back on a tablet, its place is the map band, where the 30rem cap leaves free paper above about 640px.
- **`.place` gets a 30rem cap** so that when the form and the map stack (they do it themselves at about 700px of free width, no query) the map is not nearly twice as wide as the form.
- **The reach stacks with `display: block`**, title capped at 22ch to keep the two-line shape from the mockup. Side by side at 768 the text column was narrower than the title, and because the watercolour mask is stretched `100% 100%` over the frame, it thinned with it — that is what looked like the photo shredding.

### Wide: the width is held, exactly like the landing page

Client's call, after seeing a version that grew: **`--container` stays 78rem**. The column, the header and the footer all stop in the same place as on index, so the two pages match on a big monitor. An earlier version of this pass raised it to 86rem above 85em; it is gone, and with it the 93em query that widened the form fields. Do not bring either back without asking: the fields were paid for out of the road's corridor.

What still grows above 85em comes free from section 14 of `style.css`, and it is the same set index gets: the title, the section rhythm and `--lane`. So one thing was left to fix here, the branches.

- **The branches' setback is no longer a fraction of their width.** Their width grows with `--lane`, so a fixed fraction walked the drawing deeper over the title on every wider monitor. Written as "width minus 7.5rem" (14rem for the right one), the overlap is the same at any width, matching what the old fractions gave exactly at the 85em threshold, so the crossing is invisible.
- **`img/livada-drum-1600.webp` was added.** Even with the width held, the frame paints wider at 2560 than the old 1440 file (it also carries `--bleed` out to the glass and is then scaled 1.12), and the browser was upscaling the old file. The new frame is a centre-cropped still from the farm's drone footage, chosen by comparing candidate frames against the existing image. Encoded `cwebp -q 84 -m 6`. `sizes` is now `(min-width: 80em) 62vw, 95vw` — rewrite it if the corridor moves.

### The photo is the only thing that was not contained

Found after the client said the photo looked enormous next to everything else on a big screen. The frame's width is 61.5% of the column **plus `--bleed`**, and `--bleed` is the distance from the column out to the glass, so it grows with the window without limit. Holding `--container` did nothing about it — stacked, the photo took the whole column while the form and map were both capped at 30rem.

Two caps, and the numbers are picked so nothing changes at the widths the client already approved:

- **`margin-inline-end: calc(min(var(--bleed), 7rem) * -1)`** in section 3. Below about 1470px `--bleed` is smaller than 7rem, so up to there the photo still runs out past the glass exactly as the mockup has it. Above that it stops 7rem past the column with its painted edge showing.
- **`max-width: calc(34rem + var(--bleed))`** in the narrow block. Stacked, the photo is now one step wider than the blocks under it instead of three times wider. On a phone the cap never binds, because the column is narrower than 34rem anyway, so there the photo still runs into the glass and nothing changed.

`sizes` was rewritten to match, `(min-width: 80em) 58rem, (min-width: 48em) 42rem, 95vw`. The wide entry is a fixed length, not a `vw`, because with the bleed capped the painted width is nearly constant across the whole wide band. Rewrite it if either cap moves.

The one cost: between about 900 and 1280 there is now open paper to the right of the photo, where the right-hand branch used to be before it was hidden. If that reads as empty, the branch can come back at that width band over exactly that paper.

### The photo's gap above it, stacked

`margin-block-start: calc(var(--space-2xl) + 3.75%)`. The percentage is not decoration: `scale(1.12)` from the centre lifts the frame's painted top edge by 6% of the photo's **height**, the height is 0.625 of the width, and margin percentages resolve against the parent's width — so 3.75% of the width is exactly what the scale eats. Without it the gap shrank as the photo grew, which is why the photo looked stuck to the "E-MAIL" line. If the scale, the ratio or the margin base changes, this number has to be redone.

Measured at 320, 375, 768, 1248, 1279, 1280, 1359, 1360, 1440, 1920 and 2560: no horizontal overflow anywhere; the road's clearance to the nearest text or field holds at every narrow width and grows above 1360; no decorative drawing sits over text below 80em (the two branches still cross the title and the photo above it, as they always have); every `.reveal` block and the photo wipe still arrive after a full scroll at 375 and at 1920. Above 1280 the only changes from what the client already approved are the two branch setbacks and the new photo file.

## Banda de deschidere de pe despre (`.story`)

**Talpa și topirea, 2026-08-21.** Client flagged a flat cream stripe between the film and „Cum a prins rădăcini livada" — it read as a seam between two sections, not as one melting into the other. Two things were making it, and both were changed:

- `.story__fade` — the cream gradient was too strong through its middle (0.78 at 16%, 0.56 at 26%), so the film was washed out over the full 77 px band. Now only the bottom 5% is solid cream and the curve falls away fast (0.66 at 13%, 0.42 at 23%). The film reads almost to the boundary. Raise the middle values and the stripe comes back.
- `.roots` `padding-block-start` — was `--space-xl`, now `--space-m`. `.story` already carries its own `--story-foot` (fade + `--space-s`, 97 px at 1280), so the section rhythm was stacking on top of it: about **180 px of empty page** between the last hero line and the title. `--story-foot` itself was left alone — the invariant that it must stay taller than `--story-fade` is what keeps the last line of text out of the cream.

**Text contrast on the film — measured, do not "fix" it.** The `impeccable live` detector flags `.story__kicker` and `.story__lead` as low contrast. It is a false positive: the detector cannot composite a `<video>` frame, so it has no real background to measure. Measured properly — ten frames sampled across the 6.7 s loop, the brightest 10% of pixels inside each text box, composited through both wash gradients — the worst case at 1280 is:

| | current `--on-dark-soft` #F4EDDB | `--on-dark` #FAF9EF | `--bark` #493017 |
|---|---|---|---|
| `.story__kicker` (14 px) | **4.96** | 5.48 | 2.11 |
| `.story__lead` (18 px) | **6.58** | 7.27 | 1.59 |
| `.story__title` (62 px) | **4.84** | 5.35 | 2.16 |

The cream already clears 4.5:1 at its worst frame. Brown was tried at the client's request and is 2–4× worse: the wash sits at mid-luminance, so a dark warm text colour is the one thing that cannot work on it. Left unchanged.

## Politica de confidențialitate

`politica-de-confidentialitate.html` plus `css/politica-de-confidentialitate.css` and `js/politica.js`. **Read mode:** the visitor is here to understand something, so structure for comprehension first and keep the page quiet. The legal text is the client's, unchanged.

- **Title is `--step-4`, not `--step-5`.** Step 5 is the hero size for a page that sells. Ninety-six pixels of heading over a document nobody comes to admire is just shouting.
- **Section numbers hang in their own column.** `.privacy__section h2` is a two-column grid, `2.5rem 1fr`, `align-items: baseline`, with the number in `.privacy__num` at `--step-0`. Titles that wrap to two lines align on the letter, not under the digit, and the digits stay a scanning aid. Grid, **not** `position: absolute` — a number hung outside the column would leave the viewport on a phone, and no media query is written here.
- **Sticky contents column.** The document is about 4900 px. `.privacy__summary` carries `position: sticky` **itself**, as the flex item, plus `align-self: start`. Putting sticky on an inner wrapper does nothing: the parent box is exactly the child's height, so there is no room to slide, and it only looks like it works because the page is scrolling. `max-height` plus `overflow-y: auto` keeps it inside the window on short screens.
- `js/politica.js` marks the current section in the contents with `IntersectionObserver`, band `-25% 0px -55% 0px`. The `#id`s live on the `<h2>`, not the `<section>` (the section points at them with `aria-labelledby`), so the script climbs to `.privacy__section` before observing — observing the heading directly watches a 37 px sliver that mostly misses the band. Without the script the contents is still a complete list of links.
- **`--earth` (#C3A278) is 2.12:1 on `--paper`.** It is a drawn-rule colour, not a text colour. Both sets of numbers use `--ink-soft` (6.58). Do not put `--earth` back on anything a visitor reads.
- Body leading is 1.7, not `--leading-body` (1.6). Ten sections of legal prose are not one paragraph on the landing page.
- **Not verified:** the current-section highlight could not be exercised through the Chrome extension — `IntersectionObserver` does not deliver callbacks in that tab, and a plain observer with no margin returns zero entries there. It was confirmed by eye in a normal window instead.
- `.privacy__pending` is a live note to the site owner about the placeholder e-mail address. It is visible to visitors. Remove it with the placeholder.

## Still open

- Client has a list of landing-page changes — ask, don't guess.
- Motion timing never watched at full speed in a real window (only verified as DOM/CSS end states).
- Responsive pass done (see Lățimi); not yet opened on a real phone, only measured in-browser at 320/768/1280.
- Other pages: 3-4 planned. `contact.html` has its layout and its widths done (see „Lățimi — pagina de contact"); still needs polish in places, and none of it has been opened on a real phone — only measured in-browser.
- Placeholder policy: square-bracket placeholders banned; round numbers are the one exception (cifre, FAQ), both flagged for removal once real. Still owed by the farm:
  - phone + email — nothing on the site carries either yet. The real place for these is `contact.html`, not the footer.
  - real hectares/years/tonnage (removes `.brief__note`)
  - two quotes with names (brings back testimoniale)
  - FAQ answers in the farm's own words (removes `.faq__note`)
  - **harvest windows — CONFIRM.** Current dates (Mai-Iunie cireșe, Iunie-Iulie caise, August-Septembrie prune, August-Octombrie pere) are placeholders; PRODUCT.md says the real windows differ and that's a selling point. Also sets fruit order. In `.grove__season` and `.orchard__foot`.
  - second photograph per fruit (only `-b*` files change when real photos arrive)
  - a bigger cireșe original (current source is 640px wide, can't reach 2x)
  - fourth partner's name (`img/yellow-logo-transparent.svg`, alt is a placeholder)
- Deleted early on, recoverable from first commit: letterboxed video originals, unused webp srcset steps, alfa-slab-one font. Also recoverable from `121458f`: `center-background.png`/`center-background-1254.webp`.
- Unused since the `.fruit` row came out, not yet deleted: `cirese/caise/prune/pere-p320.webp`/`-p640.webp` and the older `-280`/`-560` set. Ask before deleting.
- Kept on purpose though unused: camera-original images in `img/` (source for exported webps), `salvage/` (old design, client wants it kept), `mockups/landing-layouts.html` (record of the layout decision).
- `fructe.html` is no longer referenced — nav's `#fructe` is now an in-page anchor. Whether a fruit page still gets built is open in PRODUCT.md.
- Image generation unavailable (account out of credits) — mockups are HTML wireframes, not renders.

## Lățimi — pagina despre

Section 9 of `despre.css`. Nothing above section 9 changed. `index.html` and `contact.html` are untouched.

Four queries plus one for touch, each at a measured break:

- **64em** — the moment block can't hold three columns; the text column hits its own 36ch max-width at the same point. The portrait band and the interview grid break there too, so all three stack at one query.
- **48em** — the two small interview cards stop fitting side by side.
- **30em** — last tightenings on a small phone.
- **`pointer: coarse`** — carousel dots are 10px drawn. Not a width problem.
- **85em** — big screens. `--lane` and the second type ramp already arrive from section 14 of `style.css`, which this page loads; only the drawings are written here.

Decisions worth not re-litigating:

- **`--container` stays 78rem above 85em**, unlike the contact page which grows to 86rem. The moment photos are 1200px files shown at 564px, so they are already close to their ceiling on a 2x screen; a wider column would soften them. The extra paper goes to the drawings instead, same call as index.
- **The photo bleeds to the glass when stacked.** Without it the photo loses the corridor *and* the page margin and ends up at about half the screen — the shrinking the client flagged. `overflow: clip` on `.roots` means the bleed adds no sideways scroll.
- **The corridor stops alternating sides below 64em**, even though it alternates on a wide screen. Stacked, there is no longer empty paper between one block's edge and the next, so a line that kept alternating would cross dozens of photographs and paragraphs. On one column the corridor stays left the whole way and the line descends it. The sway per block still alternates (`despre.js` does that on its own), so it is not a ruled line.
- **The drawings are thinned, not scaled, below 64em** — same call as index. Anything placed in a percentage was measured on a wide arrangement; stacked, the section is three times taller and those percentages land on text or in the middle of a photo. What stays is what bleeds past the window edge, plus two or three per section re-anchored from the section's own corners in rem. Everything still crossing text sits under the 0.34 opacity threshold section 7 sets for that.
- **Leaves are re-anchored from the middle of the page above 85em**, by the same recipe as index: `calc(50% - Nrem)` where **N = 42.5 − 0.85 × the old percentage**. Leaves already sitting at a negative percentage are left alone — they hug the window edge on purpose.
- **The branches grow by `--lane` instead of moving**, ceiling 64rem, the real width of `branch-1024.webp`. `.motif--talks-branch-c` is the one with a positive inset, so its offset grows with `--lane` too.

Measured after the pass at 320, 768, 1024, 1359, 1360, 1440, 1920 and 2560: no horizontal overflow anywhere, the drawn line hits zero text and zero photographs at every width, and nothing moves more than 4px across the 85em threshold. At 2560 every branch still crosses the column while bleeding past the window, so no cut edge shows.

**Still open on this page:** `about-owner-960.webp` is 960px square and the portrait now goes edge to edge below 64em, so a 3x phone at 430 CSS px wants about 1290px. `owner.webp` (2940×1658) is in the repo and has the pixels for a bigger square, but the existing crop is not centred and re-cutting it blind could take the top of his head off. Ask before regenerating.
