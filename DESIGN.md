# Design — Ferma Fruct Brabova

Written from the built page, not a plan. Code wins if they disagree.

Scope: `index.html` only.

## Idea

Cream ground, photos are the colour. Green appears three times: hero wash, header fill after scroll, subsol. Four fruits run in calendar order (cireșe, caise, prune, pere) — not to be re-sorted without checking PRODUCT.md, which says this farm's actual harvest windows differ from the placeholder ones now on the page (see Still open).

`.ticket` component (label/hole/perforation) is gone, not recoverable — rebuild from scratch if wanted back.

## Section order

Hero → banda cu cifre → declarație + fruits → video → parteneri → FAQ → subsol.

Chosen from three wireframes in `mockups/landing-layouts.html` (client picked C, "Benzi", then swapped parteneri/cifre order). Not to be re-litigated without asking.

Parteneri sits after the fruit section — proof after product, not before. FAQ sits between parteneri and subsol, last thing before the page ends; wording is provisional, remove `.faq__note` once the farm confirms real answers.

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
| `--sand` | `#D8CFBD` | plates (stat band, parteneri) |

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
- `.fruit` — four large photographic plates, two across, in picking order. Rebuilt 2026-08-15 from a reference the client sent (webflow-path-two.webflow.io). The plate is dark and desaturated at rest and comes up to full colour under the pointer, with a ring that trails the cursor and says "Vezi".
  - `--wash` `#1F150B` is declared on `.fruit`, not in `tokens.css`. It is the only dark colour on the site and it exists only inside this card. The `rgba(31, 21, 11, …)` in `.fruit__frame::after` is the same colour written out and must move with it.
  - Two layers over the photo. `::before` is the wash that lifts on hover, `0.68` to `0.14`; `::after` is a permanent bottom scrim so the name survives once the wash has gone. Both carry an explicit `z-index`: they are siblings of the ring and the caption, and DOM order alone would paint `::after` over both.
  - The wash on its own was not enough — a bright photo (caise) stayed lively under it while a dark one (prune) went flat, so the four woke up at four different rates. `filter: saturate()` on the photo is what evens them.
  - The ring sits at the centre of the plate and is moved from there by `--rx` / `--ry`, which `main.js` writes as **offsets in pixels from that centre**, not absolute coordinates. That is what makes the no-script and keyboard-focus resting position the middle of the card. The trailing lag is the 620ms transform transition, not a rAF loop; pointermove only writes two custom properties.
  - Touch pointers are skipped in the JS: on a phone `pointermove` fires once on tap and would park the ring off centre with no hover to correct it.
  - The click ring is an animation on `.fruit__ring::after`, started by `.is-pressed` on pointerdown and removed on `animationend` — removing the class is what lets a second click replay it. `animationend` from a pseudo-element reports against its own element, which is why the listener is on the ring.
  - Grid is `repeat(2, minmax(0, 1fr))`, declared not auto-fit: auto-fit drops a known set of 4 to 3 columns at this container width and strands one.
  - The note sits **under** the plate on paper, not on the photograph. Over an image this size the wash would have to stay dark to keep small text legible, and staying dark is the one thing the card must not do on hover.
  - Photos re-exported 2026-08-15 as 4:3 centre crops at card width (`*-w640/-w1086/-w1180.webp`). **Cireșe is the exception:** its only source is 640px wide, so that card has no 2x file and will be soft on a retina screen. A bigger cireșe photo is owed by the farm. The old `*-280/-560.webp` files are now unused.
  - Every card links to `fructe.html`, **which does not exist**. Client chose to point at the future page. Build it or blank the hrefs before launch.

- `.film__frame` — height not aspect-ratio (Chrome shrinks width if both are set). Excluded from the reveal tilt (rotated video reads as crooked).
- `.site-header__inner` — `1fr auto 1fr`, not space-between (unequal end widths push the nav off centre).
- `.partners__logo` — all four SVGs are inlined in `index.html` with `fill`/`stroke` changed to `currentColor`, so `.partners__logo`'s `color` recolours them and hover flips them to `--forest`. A linked SVG can't be recoloured from CSS, which is why they're inline. Whatever was white inside a mark carries `style="fill:var(--sand)"` so it stays knocked out.
  - Markup is `<svg role="img" aria-label="...">`, not `<img>` — keep the label or the partner is unnamed to a screen reader.
  - Do not switch back to `mask-image` + `--logo-src`: that version didn't render in Firefox.
  - Check any edit to these four blocks in Firefox, not only Chrome — a malformed self-closing tag (`/ style="..."` instead of `style="..."/`) rendered fine in Chrome but swallowed its siblings in Firefox, leaving one logo an empty ring.
  - All four source files are square-ish canvases with inset artwork — check `viewBox` before swapping one. Fourth logo carries `transform: scale(1.3)`, an optical correction for its small artwork; re-measure when the real 4th partner's file arrives.
  - Big Family Market's wordmark is set in `<text>` with Arial (from the supplied artwork) — renders slightly differently without Arial installed. `overused-font=arial` is suppressed in `.impeccable/config.json` for this reason; it's a vendor logo, not a site typeface.
- `.faq` — native `<details>`, no JS. Rows are the only place `--sand-soft` is a surface, not a hairline; flat, no border, no hover/open colour change (both were tried, read as damage). Answer hangs off the same green-upright device as the fruit months; bottom padding lives on `.faq__body`, not `.faq__a`, so the rule doesn't run into empty space on a closed row.

## Motion

One idea: a card laid on a table — arrives low, tilted, settles flat. Video frame is the one exception (no tilt). The fruit plates keep the tilt — they are literally cards. Their hover behaviour is separate from the arrival and is described under `.fruit`.

GSAP core runs the hero as one timeline. Scroll arrivals are IntersectionObserver + GSAP tween, one stagger group per section. Header fill is the one exception to IntersectionObserver: reads `scrollY` in `requestAnimationFrame`, publishes `--p` (0 to 1) that both header and hero read in CSS.

`.film__video` plays only on-screen, tab visible, reduced-motion off, synced live. `.brief` numbers count on arrival, reset on leaving, with reduced-motion and no-IntersectionObserver fallbacks (never stuck at zero).

Can't judge in a headless/hidden Chrome tab — rendering throttles there and IntersectionObserver never fires. Judge in a real window.

`.reveal` is added only by JS, never in HTML — script-less page shows everything. Two traps already sprung: GSAP must add `.is-in` before clearing its inline transform (order matters, or it snaps back to the offset). `.reveal--js` turns off the CSS transition while GSAP owns the frame — without it the two fight.

## Four bugs already fixed — don't reintroduce

1. `preload="none"` + `autoplay` together silently does nothing in several browsers. Both videos use `preload="metadata"`. Neither ever gets `controls`.
2. `min-height: 100svh` on the hero without subtracting padding (content-box adds it on top) — the two padding values in `.hero` must stay in step.
3. Hero timeline started in a background tab freezes mid-fade — now waits for `visibilitychange`.
4. Source video was letterboxed (1920x1248 containing a 1920x1080 picture). Cropped with `ffmpeg -vf crop=1920:1080:0:72`. Check new footage with `cropdetect` first.

## Viewing it

`file://` breaks video and Chrome tooling. Serve it:

```
python3 -m http.server 8811
```

Hard-refresh after CSS edits — stale stylesheets have caused false reads before.

## Still open

- Client has a list of landing-page changes — ask, don't guess.
- Motion timing never watched at full speed in a real window (only verified as DOM/CSS end states).
- Responsive pass hasn't happened — no media queries yet, on purpose.
- Other pages: 3-4 planned, not started.
- Placeholder policy: square-bracket placeholders banned; obvious round numbers are the one exception (cifre, FAQ), both flagged with a note to remove once real. Still owed by the farm:
  - phone + email (markup parked in an index.html comment — until then Contact links go nowhere)
  - real hectares/years/tonnage (removes `.brief__note`)
  - two quotes with names (brings back testimoniale)
  - FAQ answers in the farm's own words (removes `.faq__note`)
  - **harvest windows — CONFIRM.** Current dates (Mai-Iunie cireșe, Iunie-Iulie caise, August-Septembrie prune, August-Octombrie pere) are generic placeholders. PRODUCT.md says this farm's actual harvest differs from the usual window and that's a real selling point — check before launch. Also sets fruit order.
  - fourth partner's name (`img/yellow-logo-transparent.svg`, alt is a placeholder)
- Deleted 2026-08-15, recoverable from first commit: letterboxed video originals, unused webp srcset steps, alfa-slab-one font.
- Kept on purpose though unused: camera-original images in `img/` (source for exported webps, needed for the responsive pass), `salvage/` (old design, client wants it kept), `mockups/landing-layouts.html` (record of the layout decision).
- Image generation unavailable (account out of credits) — mockups are HTML wireframes, not renders.
