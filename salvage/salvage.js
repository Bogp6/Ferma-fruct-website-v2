/* ============================================================================
   SALVAGE — kept from the previous project at Bogdan's request.

   Bogdan liked the navbar in the old build and wants it within easy reach
   here, so the script that drives it is parked in this file rather than lost
   in git history. NOTHING HERE IS LIVE. index.html does not load it.

   To use: copy this into js/main.js, or add
   <script src="salvage/salvage.js" defer></script> before </body>.

   This is the navbar's half of the old main.js only. The parts that drove the
   figures, the statement, the film and the counting numbers are not here,
   because those sections are not being carried over.
   ============================================================================ */

(function () {
    'use strict';

    /* THE HEADER FILL. The one thing on the page that genuinely has to read
       the scroll position, because it is a quantity tracking the thumb rather
       than a state change with a trigger.

       It publishes one number, --p, from 0 at the top of the page to exactly 1
       when the last pixel of the hero has left the screen. Everything the bar
       does is written in CSS in terms of that number, so this file never
       touches a colour or a style: add a new element that reads --p and it
       joins in without a line changing here.

       Read inside requestAnimationFrame, so the work happens once per painted
       frame however many scroll events fire, from a passive listener so it can
       never hold up the scroll. The height is measured on resize rather than
       every frame, because asking an element for its size mid-scroll forces
       the browser to redo layout. */

    var header = document.querySelector('.site-header');
    var hero = document.querySelector('.hero');

    /* Both have to exist. Dropping the header in without a .hero on the page
       would divide by a height of zero, so the guard is not decoration: if
       there is no hero to scroll past, pick a different element to measure. */
    if (!header || !hero) {
        return;
    }

    var distance = 1;
    var queued = false;
    var lastPublished = -1;

    function measure() {
        /* The travel is the full height of the hero: at the end of it the hero
           is entirely above the top of the screen, which is when the fill has
           to be complete. Never let this reach 0. */
        distance = Math.max(hero.offsetHeight, 1);
        publish();
    }

    function publish() {
        var p = Math.min(Math.max(window.scrollY / distance, 0), 1);

        /* Rounded before it is written. The colour mixes and the gradient stop
           are recomputed every time this property changes, and past three
           decimals nobody can see the difference. */
        p = Math.round(p * 1000) / 1000;

        /* Written on the root element, not on the bar: in the old build the
           hero read the same number to clear its words out of the bar's way,
           and the two had to agree. Keep it on the root for the same reason. */
        if (p !== lastPublished) {
            document.documentElement.style.setProperty('--p', String(p));
            lastPublished = p;
        }

        queued = false;
    }

    function onScroll() {
        if (!queued) {
            queued = true;
            window.requestAnimationFrame(publish);
        }
    }

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);

    /* Deliberately not switched off under prefers-reduced-motion. --p is a
       position, not a motion: it describes where the page already is, and
       freezing it would leave the bar transparent over cream text. The old
       build made the same call. */
}());
