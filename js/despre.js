/* ===========================================================================
   despre.js — numai pentru despre.html.

   De ce un fișier separat și nu încă o treabă în main.js: main.js și style.css
   împart același ?v= și se bat împreună (vezi DESIGN.md). O treabă nouă acolo
   ar fi însemnat schimbat și ?v=-ul lui index.html pentru o pagină care n-are
   nicio legătură cu el.

   main.js se încarcă și el aici, dar fiecare treabă din el își caută întâi
   elementul și iese dacă lipsește, deci de acolo rulează practic numai meniul
   lateral și deriva desenelor de fundal.

   Cinci treburi:
     1. filmul de sus — repornirea după un refuz de autoplay;
     2. sosirea la derulare;
     3. linia desenată prin mijlocul celor trei momente;
     4. caruselul — butoane, buline, filmul din el;
     5. interviurile — iframe-ul YouTube pus abia la apăsare.
   =========================================================================== */

(function () {
    'use strict';

    var SVG_NS = 'http://www.w3.org/2000/svg';


    /* -----------------------------------------------------------------------
       1. FILMUL DE SUS

       Filmul merge în buclă (loop e pe element) și nu are nicio comandă: e
       fundal, nu un player. Ce rămâne aici e numai recuperarea după un refuz
       de autoplay — pe iPhone în mod de consum redus browserul respinge
       redarea la încărcare și refuzul nu poate fi ocolit fără un gest adevărat
       al vizitatorului. Ascultătorii de gest se scot singuri la prima pornire
       reușită, ca pagina să nu rămână cu ei agățați degeaba.
       ----------------------------------------------------------------------- */

    var film = document.querySelector('.story__film');

    if (film) {
        var gestures = ['pointerdown', 'touchstart', 'keydown'];

        var dropGestures = function () {
            gestures.forEach(function (type) {
                document.removeEventListener(type, retry);
            });
        };

        /* muted/playsinline rescrise pe element înainte de fiecare încercare:
           iOS le pierde după unele reveniri în filă și atunci play() e respins
           ca redare cu sunet pornit fără gest. */
        var start = function () {
            film.muted = true;
            film.defaultMuted = true;
            film.playsInline = true;

            var attempt = film.play();

            if (attempt && typeof attempt.catch === 'function') {
                /* Înghițit dinadins: dacă browserul refuză, filmul rămâne pe
                   poster și încercăm din nou la primul gest. */
                attempt.catch(function () {});
            }
        };

        var retry = function () {
            if (film.paused) {
                start();
            }
        };

        film.addEventListener('play', dropGestures);

        gestures.forEach(function (type) {
            document.addEventListener(type, retry, { passive: true });
        });

        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) {
                retry();
            }
        });

        window.addEventListener('pageshow', retry);
    }


    /* -----------------------------------------------------------------------
       2. SOSIREA LA DERULARE

       Fără GSAP: mișcarea e o singură tranziție CSS (.reveal → .is-in din
       style.css), iar observatorul doar pune clasele. .reveal se adaugă numai
       de aici, niciodată în HTML, ca o pagină fără script să arate tot.
       ----------------------------------------------------------------------- */

    var canWatch = 'IntersectionObserver' in window;

    if (canWatch) {
        var groups = [
            { selector: '.roots__title', stagger: 0 },
            /* within: indexul decalajului repornește în fiecare bloc, altfel
               al treilea rând din blocul trei ar aștepta o secundă întreagă. */
            { selector: '.stage__year, .stage__name, .stage__body', within: '.stage', stagger: 0.07 },
            { selector: '.keeper__title, .keeper__body, .keeper__seal', stagger: 0.07 },
            { selector: '.talks__title, .talks__lead', stagger: 0.07 },
            { selector: '.talk', stagger: 0.08 }
        ];

        var watcher = new IntersectionObserver(function (entries, self) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }

                self.unobserve(entry.target);
                entry.target.classList.add('is-in');
            });
        }, { rootMargin: '0px 0px -12% 0px' });

        var arm = function (group, root) {
            Array.prototype.forEach.call(root.querySelectorAll(group.selector), function (el, i) {
                el.classList.add('reveal');
                el.style.transitionDelay = (i * group.stagger).toFixed(2) + 's';
                watcher.observe(el);
            });
        };

        groups.forEach(function (group) {
            if (group.within) {
                Array.prototype.forEach.call(document.querySelectorAll(group.within), function (root) {
                    arm(group, root);
                });
                return;
            }

            arm(group, document);
        });

        /* Fotografiile nu urcă, se dezvelesc de jos în sus — altă mișcare,
           deci alt observator și fără .reveal peste ele. */
        var wiper = new IntersectionObserver(function (entries, self) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }

                self.unobserve(entry.target);
                entry.target.classList.add('is-in');
            });
        }, { rootMargin: '0px 0px -10% 0px' });

        Array.prototype.forEach.call(
            document.querySelectorAll('.stage__frame, .keeper__frame'),
            function (frame) {
                frame.classList.add('wipe');
                wiper.observe(frame);
            }
        );
    }


    /* -----------------------------------------------------------------------
       3. LINIA DIN MIJLOC

       Un singur spline Catmull-Rom prin punctele de mai jos, deci trece exact
       prin fiecare bulină și n-are colțuri nicăieri: de asta se citește ca o
       trăsătură de mână și nu ca niște arce lipite cap la cap.

       Punctele sunt luate din desenele din culoar (.stage__sign), nu din
       blocuri: culoarul e singura fâșie de hârtie liberă pe toată înălțimea
       secțiunii, iar bulina trebuie să cadă în el, lângă desen.

       Nu se citește nimic la derulare: se măsoară o dată, se scrie o cale,
       gata. Se redesenează numai când se schimbă înălțimile.
       ----------------------------------------------------------------------- */

    var list = document.querySelector('.roots__list');
    var stages = list ? Array.prototype.slice.call(list.querySelectorAll('.stage')) : [];

    if (list && stages.length > 1) {
        var spine = document.createElementNS(SVG_NS, 'svg');
        var spinePath = document.createElementNS(SVG_NS, 'path');

        spine.setAttribute('class', 'roots__spine');
        spine.setAttribute('aria-hidden', 'true');
        spine.appendChild(spinePath);
        list.insertBefore(spine, list.firstChild);

        /* Cât se abate linia de la mijlocul culoarului, cel mult. Peste vreo 60
           de pixeli bulina se rupe de blocul ei și nu se mai citește ca semnul
           lui. Garda e hârtia lăsată liberă între linie și cel mai apropiat
           text sau fotografie. */
        var SWAY_CAP = 60;
        var SWAY_GUARD = 14;

        /* Catmull-Rom prin puncte, scris în cubice Bézier. Direcția mânerului
           într-un punct e cea dintre vecinii lui; LUNGIMEA însă se ia din
           segmentul pe care îl deservește, nu din distanța dintre vecini.

           Asta e tot ce contează: punctele nu sunt la distanțe egale, iar forma
           clasică (mânerul din vecini) scoate o buclă la fiecare punct
           înghesuit. Cu lungimea legată de segment linia nu poate depăși
           punctul următor. Aceeași alegere ca la coloana din index — nu o
           „simplifica" înapoi la manual. */
        var through = function (pts) {
            var r = function (n) { return Math.round(n * 100) / 100; };
            var aim = function (dx, dy, len) {
                var m = Math.sqrt(dx * dx + dy * dy) || 1;
                return { x: dx / m * len, y: dy / m * len };
            };
            var d = 'M' + r(pts[0].x) + ' ' + r(pts[0].y);
            var i;

            for (i = 0; i < pts.length - 1; i += 1) {
                var p0 = pts[i - 1] || pts[i];
                var p1 = pts[i];
                var p2 = pts[i + 1];
                var p3 = pts[i + 2] || pts[i + 1];
                var reach = Math.sqrt(
                    (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y)
                ) / 3;
                var out = aim(p2.x - p0.x, p2.y - p0.y, reach);
                var into = aim(p3.x - p1.x, p3.y - p1.y, reach);

                d += 'C' + r(p1.x + out.x) + ' ' + r(p1.y + out.y) +
                    ' ' + r(p2.x - into.x) + ' ' + r(p2.y - into.y) +
                    ' ' + r(p2.x) + ' ' + r(p2.y);
            }

            return d;
        };

        var circle = function (x, y, radius, cls) {
            var c = document.createElementNS(SVG_NS, 'circle');
            c.setAttribute('cx', Math.round(x * 100) / 100);
            c.setAttribute('cy', Math.round(y * 100) / 100);
            c.setAttribute('r', radius);
            c.setAttribute('class', cls);
            return c;
        };

        var drawSpine = function () {
            var box = list.getBoundingClientRect();

            var nodes = stages.map(function (stage, i) {
                var sign = stage.querySelector('.stage__sign');
                var tell = stage.querySelector('.stage__tell');
                var frame = stage.querySelector('.stage__frame');

                if (!sign || !tell || !frame) {
                    return null;
                }

                var s = sign.getBoundingClientRect();
                var a = tell.getBoundingClientRect();
                var b = frame.getBoundingClientRect();
                /* Care coloană e vizual în stânga se citește din poziția reală,
                   nu din DOM: blocul din mijloc e întors cu row-reverse. */
                var left = a.left < b.left ? a : b;
                var right = a.left < b.left ? b : a;

                /* Hârtia liberă de fiecare parte a desenului din culoar. */
                var room = Math.min(s.left - left.right, right.left - s.right);
                var sway = Math.min(s.width / 2 + Math.max(0, room - SWAY_GUARD) / 2, SWAY_CAP);

                /* Blocurile alternează stânga-dreapta, deci și abaterea:
                   așa iese o singură împletire pe toată secțiunea. */
                var dir = i % 2 === 0 ? 1 : -1;

                return {
                    x: s.left + s.width / 2 - box.left + dir * sway,
                    y: s.top + s.height / 2 - box.top,
                    lane: s.left + s.width / 2 - box.left
                };
            }).filter(Boolean);

            if (nodes.length < 2) {
                return;
            }

            var first = nodes[0];
            var last = nodes[nodes.length - 1];

            /* Capetele pleacă și sosesc pe mijlocul culoarului: linia intră în
               secțiune dreaptă și abia pe urmă se abate spre primul bloc. */
            var pts = [{ x: first.lane, y: 0 }]
                .concat(nodes.map(function (n) { return { x: n.x, y: n.y }; }))
                .concat([{ x: last.lane, y: box.height }]);

            spinePath.setAttribute('d', through(pts));

            /* Bulinele se refac de fiecare dată: numărul lor nu se schimbă, dar
               poziția da, iar de șters e o singură buclă. */
            Array.prototype.forEach.call(
                spine.querySelectorAll('circle'),
                function (c) { c.remove(); }
            );

            spine.appendChild(circle(pts[0].x, pts[0].y, 3, 'roots__cap'));

            nodes.forEach(function (n) {
                spine.appendChild(circle(n.x, n.y, 7, 'roots__node'));
                spine.appendChild(circle(n.x, n.y, 2.6, 'roots__dot'));
            });

            spine.appendChild(circle(last.lane, box.height, 3, 'roots__cap'));
        };

        /* După load, nu la DOMContentLoaded: fonturile și fotografiile mai mută
           înălțimile, iar linia e desenată din ele. */
        if (document.readyState === 'complete') {
            drawSpine();
        } else {
            window.addEventListener('load', drawSpine);
        }

        if ('ResizeObserver' in window) {
            var watchSize = new ResizeObserver(function () { drawSpine(); });
            watchSize.observe(list);
            stages.forEach(function (stage) { watchSize.observe(stage); });
        } else {
            window.addEventListener('resize', drawSpine);
        }
    }


    /* -----------------------------------------------------------------------
       4. CARUSELUL

       Derularea e nativă: scroll-snap face lipirea, degetul și tastatura merg
       fără noi. De aici se adaugă doar comenzile — și se adaugă DE AICI tocmai
       ca o pagină fără script să nu arate butoane care nu fac nimic.
       ----------------------------------------------------------------------- */

    var track = document.querySelector('.reel__track');
    var slides = track ? Array.prototype.slice.call(track.querySelectorAll('.reel__slide')) : [];

    if (track && slides.length > 1) {
        var stage = track.parentNode;
        var reelVideo = track.querySelector('.reel__video');
        var current = 0;

        var icon = function (d) {
            var svg = document.createElementNS(SVG_NS, 'svg');
            var path = document.createElementNS(SVG_NS, 'path');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('focusable', 'false');
            svg.setAttribute('aria-hidden', 'true');
            path.setAttribute('d', d);
            svg.appendChild(path);
            return svg;
        };

        var button = function (cls, text, d) {
            var b = document.createElement('button');
            var hidden = document.createElement('span');
            b.type = 'button';
            b.className = 'reel__nav ' + cls;
            hidden.className = 'visually-hidden';
            hidden.textContent = text;
            b.appendChild(hidden);
            b.appendChild(icon(d));
            return b;
        };

        var prev = button('reel__nav--prev', 'Fotografia dinainte', 'M15 5l-7 7 7 7');
        var next = button('reel__nav--next', 'Fotografia următoare', 'M9 5l7 7-7 7');

        stage.appendChild(prev);
        stage.appendChild(next);

        var dotList = document.createElement('div');
        dotList.className = 'reel__dots';
        dotList.setAttribute('role', 'tablist');
        dotList.setAttribute('aria-label', 'Alege fotografia');

        var dots = slides.map(function (slide, i) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'reel__dot';
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', 'Fotografia ' + (i + 1) + ' din ' + slides.length);
            dot.addEventListener('click', function () { goTo(i); });
            dotList.appendChild(dot);
            return dot;
        });

        stage.parentNode.insertBefore(dotList, stage.nextSibling);

        /* Ținta e mijlocul benzii, nu marginea ei: diapozitivul din față e
           centrat, iar paddingul benzii e scris din aceeași lățime. */
        function goTo(i) {
            var slide = slides[Math.max(0, Math.min(i, slides.length - 1))];
            track.scrollTo({
                left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
                behavior: 'smooth'
            });
        }

        prev.addEventListener('click', function () { goTo(current - 1); });
        next.addEventListener('click', function () { goTo(current + 1); });

        /* Filmul din carusel rulează numai când e diapozitivul din față ȘI fila
           e vizibilă — altfel ar consuma bandă și baterie nevăzut. */
        var syncVideo = function () {
            if (!reelVideo) {
                return;
            }

            var shouldPlay = !document.hidden &&
                slides[current] === reelVideo.closest('.reel__slide');

            if (shouldPlay && reelVideo.paused) {
                reelVideo.muted = true;
                reelVideo.playsInline = true;

                var attempt = reelVideo.play();

                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () { /* refuzat: rămâne posterul */ });
                }
            } else if (!shouldPlay && !reelVideo.paused) {
                reelVideo.pause();
            }
        };

        var mark = function () {
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-current', i === current);
            });

            dots.forEach(function (dot, i) {
                dot.setAttribute('aria-current', i === current ? 'true' : 'false');
                dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
            });

            /* Ascuns, nu dezactivat: un buton gri de la prima pictare se
               citește ca o comandă stricată, nu ca „ești la prima fotografie". */
            prev.hidden = current === 0;
            next.hidden = current === slides.length - 1;

            syncVideo();
        };

        /* Care diapozitiv e în față se citește din derulare, nu se ține minte:
           degetul și rotița mută banda fără să treacă prin butoanele noastre. */
        var pending = 0;

        var readScroll = function () {
            var middle = track.scrollLeft + track.clientWidth / 2;
            var best = 0;
            var bestGap = Infinity;

            slides.forEach(function (slide, i) {
                var gap = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - middle);

                if (gap < bestGap) {
                    bestGap = gap;
                    best = i;
                }
            });

            if (best !== current) {
                current = best;
                mark();
            }
        };

        track.addEventListener('scroll', function () {
            if (pending) {
                return;
            }

            pending = requestAnimationFrame(function () {
                pending = 0;
                readScroll();
            });
        }, { passive: true });

        document.addEventListener('visibilitychange', syncVideo);

        track.classList.add('is-live');
        mark();
    }


    /* -----------------------------------------------------------------------
       5. INTERVIURILE

       Cartonașul rămâne o fotografie locală până la apăsare; iframe-ul se pune
       abia atunci, deci pagina nu cere nimic de pe alt server dacă vizitatorul
       nu deschide niciun clip.

       Cât timp data-yt e „TODO" nu se pune niciun buton: CSS-ul stinge insigna
       și arată eticheta „Link în curând". Se trec codurile reale în HTML și
       cartonașele se aprind singure.
       ----------------------------------------------------------------------- */

    Array.prototype.forEach.call(document.querySelectorAll('.talk'), function (talk) {
        var id = (talk.getAttribute('data-yt') || '').trim();

        /* Un cod YouTube are exact 11 caractere din alfabetul de mai jos.
           „TODO" nu trece testul, deci un cartonaș necompletat rămâne inert. */
        if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
            return;
        }

        var frame = talk.querySelector('.talk__frame');
        var poster = talk.querySelector('.talk__poster');
        var caption = talk.querySelector('.talk__caption');

        if (!frame || !poster) {
            return;
        }

        var title = caption ? caption.textContent.trim() : 'interviu';
        var open = document.createElement('button');
        open.type = 'button';
        open.className = 'talk__open';
        /* Butonul e transparent peste toată fotografia, deci n-are text pe
           ecran; numele lui trăiește în aria-label, pentru cititorul de ecran. */
        open.setAttribute('aria-label', 'Redă: ' + title);

        /* Înaintea insignei în DOM: CSS-ul o aprinde cu selectorul de frate
           (.talk__open:hover ~ .talk__badge). */
        poster.insertAdjacentElement('afterend', open);

        open.addEventListener('click', function () {
            var player = document.createElement('iframe');
            /* nocookie: YouTube nu scrie cookie-uri de urmărire până când
               vizitatorul chiar pornește clipul. */
            player.src = 'https://www.youtube-nocookie.com/embed/' + id +
                '?autoplay=1&rel=0&modestbranding=1';
            player.title = title;
            player.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
            player.setAttribute('allowfullscreen', '');
            player.loading = 'lazy';

            frame.replaceChildren(player);
        });
    });

}());
