/* ===========================================================================
   contact.js — numai pentru contact.html.

   De ce un fișier separat și nu încă o treabă în main.js: main.js și style.css
   împart același ?v= și se bat împreună (vezi DESIGN.md). O treabă nouă acolo
   ar fi însemnat schimbat și ?v=-ul lui index.html pentru o pagină care n-are
   nicio legătură cu el. Aici nu se atinge nimic din pagina principală.

   main.js se încarcă și el pe pagina asta, dar fiecare treabă din el își caută
   întâi elementul și iese dacă lipsește, deci de acolo rulează practic numai
   meniul lateral.

   Trei lucruri se fac aici:
     1. sosirea la derulare — .reveal din style.css, pusă din JS ca pagina
        fără script să arate tot;
     2. desenarea drumului, o dată, la încărcare;
     3. trimiterea formularului fără să se schimbe pagina.
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

       Două cadre sunt intenționate: primul lasă browserul să picteze starea de
       plecare ascunsă, al doilea pornește tranziția. Fără cadrul pictat între
       ele, unele aparate aplică ambele stări înainte de prima imagine și linia
       apare întreagă, fără coborâre.
       ----------------------------------------------------------------------- */

    function drawRoad() {
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                page.classList.add('is-drawn');
            });
        });
    }

    if (document.readyState === 'complete') {
        drawRoad();
    } else {
        window.addEventListener('load', drawRoad, { once: true });
    }


    /* -----------------------------------------------------------------------
       3. TRIMITEREA FORMULARULUI

       Fără asta formularul tot merge: postează normal către Web3Forms și
       browserul ajunge pe pagina de confirmare a serviciului. Treaba de aici
       ține omul pe pagină și îi spune ce s-a întâmplat, atât.

       Antetul Accept: application/json e ce face diferența — fără el serviciul
       răspunde cu o redirectare, nu cu un răspuns pe care să-l putem citi.

       Câmpurile NU se golesc după trimitere decât dacă a reușit: dacă a picat
       rețeaua, omul își găsește mesajul întreg și mai încearcă o dată.
       ----------------------------------------------------------------------- */

    var form = page.querySelector('.form');
    var status = form && form.querySelector('.form__status');

    /* fetch lipsește pe browsere vechi; acolo se lasă trimiterea normală. */
    if (form && status && window.fetch) {

        var button = form.querySelector('button[type="submit"]');
        var buttonLabel = button ? button.textContent : '';

        function say(text, kind) {
            status.textContent = text;
            status.classList.toggle('form__status--ok', kind === 'ok');
            status.classList.toggle('form__status--bad', kind === 'bad');
        }

        function unlock() {
            if (button) {
                button.disabled = false;
                button.textContent = buttonLabel;
            }
        }

        /* Subiectul e câmpul opțional al formularului și tot el e linia de
           subiect a e-mailului care ajunge la fermă. Lăsat gol, mesajul ar
           ateriza fără subiect în inbox, așa că i se pune unul înainte de
           trimitere. Se scrie în câmp, nu în corpul cererii, ca omul să vadă
           ce a plecat dacă trimiterea pică și mai încearcă o dată. */
        var subject = form.querySelector('[name="subject"]');

        form.addEventListener('submit', function (event) {
            /* Verificarea nativă a câmpurilor obligatorii se face înainte de
               submit, deci aici formularul e deja valid. */
            event.preventDefault();

            if (subject && !subject.value.trim()) {
                subject.value = 'Mesaj de pe site';
            }

            if (button) {
                button.disabled = true;
                button.textContent = 'Se trimite…';
            }

            say('', null);

            fetch(form.action, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: new FormData(form)
            }).then(function (response) {
                return response.json();
            }).then(function (result) {
                if (result && result.success) {
                    form.reset();
                    say('Mesajul a plecat. Îți răspundem cât putem de repede.', 'ok');
                } else {
                    say('Mesajul nu a plecat. Încearcă din nou sau sună-ne.', 'bad');
                }
            }).catch(function () {
                say('Mesajul nu a plecat. Verifică legătura la internet și încearcă din nou.', 'bad');
            }).then(unlock);
        });
    }

}());
