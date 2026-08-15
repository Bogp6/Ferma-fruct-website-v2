# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Hand-written static HTML, CSS, and vanilla JavaScript, no build step. CSS load
order is normalize.css, tokens.css, base.css, style.css. GSAP is available
locally at `js/gsap.min.js`. Hosted on Cloudflare Pages; no server-side code, so
any form must post to a third-party endpoint. Site language is Romanian
(`lang="ro"`); an English version is anticipated but does not exist.

## Users

There is no single target visitor. The likeliest one is a wholesale client who
has already eaten the fruit and looks the farm up afterwards to see who grew it.
Others arrive the same way: someone who heard the name, someone checking the
farm is real. In every case the visitor is looking, not buying.

## Product Purpose

Ferma Fruct Brabova is a fruit farm in Brabova, Dolj county, Romania. The site is
a presentation site. It exists so that anyone who looks the farm up comes away
with a strong impression of it. There is no shop, no cart, no prices, no
ordering. Success is: the site looks good, the farm reads as real and serious,
and the visitor who wants more detail can get in touch.

## Positioning

Four fruits, grown well: cireșe, pere, prune, caise (cherries, pears, plums,
apricots).

The claim the farm makes about them is taste. People describe the fruit as
tasting the way fruit tasted when they were children — a nostalgic taste, not an
industrial one. The harvest season runs slightly differently from the usual
window for these fruits, which is a factual point of difference and not a
marketing line.

## Operating Context

The visitor is almost always arriving cold, often from a phone, often after
someone mentioned the farm or after eating the fruit. They spend a short time and
form a judgement from the pictures and the feel of the page more than from
reading. Nothing on the site is a transaction; the single outward action
available is contacting the farm.

## Capabilities and Constraints

- The only interactive capability offered to a visitor is "contact us". No
  buying, no accounts, no availability lookup.
- Contact detail delivery method is undecided: a visible phone number, a form
  posting to a third-party endpoint, or both.
- **Undecided:** whether the site ends up with three pages or four. The client's
  position is "four to three", leaning on whether Fructe earns its own page.
  Not to be decided by anyone but the client.
- **Current scope: the landing page only.** The client asked explicitly that no
  other page be started until `index.html` is finished. The landing page's
  components were chosen by the client and are listed in DESIGN.md; the nav
  currently points at in-page anchors and will need rewriting when real pages
  exist.
- Structured data in `index.html` is a `Farm` LocalBusiness block with TODO
  fields. Any field still TODO at launch gets deleted, never guessed.

## Brand Commitments

- Name: **Ferma Fruct Brabova**. The wordmark treatment carried over from the
  previous build is "Ferma Fruct" with both F letters given their own styling
  (see `salvage/salvage.html`).
- The user has a logo file to supply.
- The user asked to carry over the navbar and the button from the previous
  project; both are parked in `salvage/` with their CSS and JavaScript. Carrying
  them over is a preference, not a rule — they are available, not mandatory.
- Copy is Romanian. Real Romanian copy from the old site exists in
  `salvage/salvage.html` and may be reused.

## Evidence on Hand

- Hero photograph, already converted to webp at four widths in `img/`
  (640, 960, 1280, 1677), showing an orchard with a dirt track leading to the
  farm hall. Real photo of the farm.
- The user has more material to supply on request: further photos, video, a
  logo, phone number, and address.
- **Not yet in the repository:** everything in the line above. Until those files
  arrive, every phone number, address, opening time, price, year, quantity, and
  quote on the page stays an obvious placeholder. There are no testimonials, no
  certifications, and no figures on hand; none may be invented.

## Product Principles

1. **Impression over information.** The visitor is judging, not researching. The
   page earns its keep with how it looks and feels, not with how much it says.
2. **Four fruits, named.** Cireșe, pere, prune, caise are the substance of the
   farm and the spine of the site's content.
3. **Taste is the argument.** Nostalgia and remembered flavour, plus the
   off-window harvest, are the honest differences. Everything else is decoration.
4. **One outward action.** Contact is the only thing the visitor can do. Nothing
   else competes with it.
5. **No invented facts.** No numbers, no reviews, no claims the farm has not
   given us. A placeholder is always better than a plausible lie.

## Accessibility & Inclusion

No product-specific requirement established beyond the house baseline: body text
contrast at least 4.5 to 1, a visible focus outline on every interactive
element, and a keyboard tab-through that works.
