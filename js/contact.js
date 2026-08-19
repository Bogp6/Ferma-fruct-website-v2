/* ===========================================================================
   contact.js — numai pentru contact.html.

   De ce un fișier separat și nu încă o treabă în main.js: main.js și style.css
   împart același ?v= și se bat împreună (vezi DESIGN.md). O treabă nouă acolo
   ar fi însemnat schimbat și ?v=-ul lui index.html pentru o pagină care n-are
   nicio legătură cu el. Aici nu se atinge nimic din pagina principală.

   main.js se încarcă și el pe pagina asta, dar fiecare treabă din el își caută
   întâi elementul și iese dacă lipsește, deci de acolo rulează practic numai
   meniul lateral.

   Două lucruri se fac aici:
     1. sosirea la derulare — .reveal din style.css, pusă din JS ca pagina
        fără script să arate tot;
     2. desenarea drumului, o dată, la încărcare.
   =========================================================================== */

(function () {
    'use strict';

    var page = document.querySelector('.contact');

    if (!page) {
        return;
    }


    /* -----------------------------------------------------------------------
       1. SOSIREA LA DERULARE

       Fără GSAP aici: mișcarea e o singură tranziție CSS (.reveal → .is-in din
       style.css), iar observatorul doar pune clasele. Decalajul dintre
       elementele unui grup se scrie ca transition-delay, tot pe element.
       ----------------------------------------------------------------------- */

    var groups = [
        { selector: '.reach__eyebrow, .reach__title, .reach__lead, .line', stagger: 0.08 },
        { selector: '.write__title, .write__lead, .form__pair, .form > .field, .btn--solid', stagger: 0.06 },
        { selector: '.place__title, .place__map, .place__where, .place__route', stagger: 0.06 }
    ];

    /* 12% de jos: blocul a intrat bine în ecran înainte să pornească, în loc
       să se miște pe muchie. Nimic de aici nu stă la capătul paginii (urmează
       subsolul), deci nu e nevoie de al doilea observator ca în main.js. */
    var canWatch = 'IntersectionObserver' in window;

    var watcher = canWatch && new IntersectionObserver(function (entries, self) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
                return;
            }

            self.unobserve(entry.target);
            entry.target.classList.add('is-in');
        });
    }, { rootMargin: '0px 0px -12% 0px' });

    if (canWatch) {
        groups.forEach(function (group) {
            Array.prototype.forEach.call(
                document.querySelectorAll(group.selector),
                function (el, i) {
                    el.classList.add('reveal');
                    el.style.transitionDelay = (i * group.stagger).toFixed(2) + 's';
                    watcher.observe(el);
                }
            );
        });

        /* Fotografia nu urcă, se dezvelește — altă mișcare, deci alt
           observator și fără .reveal peste ea. */
        var frame = document.querySelector('.reach__frame');

        if (frame) {
            frame.classList.add('wipe');

            new IntersectionObserver(function (entries, self) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    self.unobserve(entry.target);
                    entry.target.classList.add('is-in');
                });
            }, { rootMargin: '0px 0px -10% 0px' }).observe(frame);
        }
    }


    /* -----------------------------------------------------------------------
       2. DRUMUL

       Se desenează o singură dată, la încărcare, nu la derulare: linia trece
       prin toată pagina, deci n-are un moment în care „intră în ecran".

       După load, nu la DOMContentLoaded: fonturile și fotografia mai mișcă
       înălțimea paginii, iar linia e desenată în procente din ea.

       Fără requestAnimationFrame: starea de plecare (linia ascunsă) e scrisă
       în CSS sub html:not(.no-js), deci există de la prima pictare și n-are
       nevoie de un cadru ca să se înregistreze. În plus, rAF e încetinit în
       filele din fundal și drumul ar fi rămas nedesenat acolo.
       ----------------------------------------------------------------------- */

    function drawRoad() {
        page.classList.add('is-drawn');
    }

    if (document.readyState === 'complete') {
        drawRoad();
    } else {
        window.addEventListener('load', drawRoad, { once: true });
    }

}());
