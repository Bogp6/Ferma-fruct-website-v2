/* ============================================================================
   Ferma Fruct Brabova — pagina principală

   Nine jobs. Every one of them is optional: the page is complete, readable
   and navigable with this file removed. Nothing here creates content. The side
   menu (job 9) is the one that needs saying twice: without this file the button
   that opens it is hidden by CSS and the plain row of links takes its place, so
   nothing on the page becomes unreachable.

   The movement is one idea used everywhere: a card laid on a table. It arrives
   from slightly below, tilted a hair, and settles flat. Nothing fades in place,
   nothing slides in from the side. The fruit photographs are the one exception
   and they say so in job 7: they do not arrive, they are uncovered.
   ============================================================================ */

(function () {
    'use strict';

    var canWatch = 'IntersectionObserver' in window;
    var gsap = window.gsap;


    /* ---------------------------------------------------------------------
       1. THE HERO FILM
       iOS Low Power Mode can refuse muted autoplay on a cold page load. The
       refusal cannot be bypassed without a real visitor gesture, so the hero
       retries on the first touch, pointer press or key press. The listeners
       are removed as soon as playback begins and never exist on devices where
       the first autoplay request succeeds.

       .film__video is skipped here: section 2 owns when it plays. Calling
       play() on it from this job and pause() from there moments later rejects
       the in-flight promise. */

    var heroVideo = document.querySelector('.hero__film');

    if (heroVideo) {
        var heroUnlockArmed = false;
        var heroUnlockEvents = ['pointerdown', 'touchstart', 'keydown'];

        var disarmHeroVideo = function () {
            if (!heroUnlockArmed) {
                return;
            }

            heroUnlockArmed = false;
            heroUnlockEvents.forEach(function (type) {
                document.removeEventListener(type, unlockHeroVideo, true);
            });
        };

        var armHeroVideo = function () {
            if (heroUnlockArmed || !heroVideo.paused) {
                return;
            }

            heroUnlockArmed = true;
            heroUnlockEvents.forEach(function (type) {
                document.addEventListener(type, unlockHeroVideo, {
                    capture: true,
                    passive: type !== 'keydown'
                });
            });
        };

        var playHeroVideo = function (fromGesture) {
            if (document.hidden || !heroVideo.paused) {
                return;
            }

            /* Safari is strict about these being properties as well as HTML
               attributes when play() is retried after a rejected autoplay. */
            heroVideo.muted = true;
            heroVideo.defaultMuted = true;
            heroVideo.playsInline = true;
            if (fromGesture !== true) {
                armHeroVideo();
            }

            var attempt = heroVideo.play();

            if (attempt && typeof attempt.then === 'function') {
                attempt.then(disarmHeroVideo).catch(armHeroVideo);
            }
        };

        function unlockHeroVideo() {
            disarmHeroVideo();
            playHeroVideo(true);
        }

        heroVideo.addEventListener('playing', disarmHeroVideo);
        window.addEventListener('pageshow', playHeroVideo);
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) {
                playHeroVideo();
            }
        });

        playHeroVideo();
    }


    /* ---------------------------------------------------------------------
       2. FILM BAND: play only on screen
       The second video autoplays and loops. It starts a screen's height before
       the band arrives, so it is already moving by the time it is looked at,
       and stops once the band has scrolled away or the tab is hidden. Pausing
       leaves the poster up, and the poster is the video's own first frame, so
       the band still reads as the band.
       --------------------------------------------------------------------- */

    var filmVideo = document.querySelector('.film__video');

    if (filmVideo) {
        var filmPlay = document.querySelector('.film__play');
        var filmVisible = !canWatch;

        var showFilmPlay = function () {
            if (filmPlay && filmVisible && !document.hidden) {
                filmPlay.hidden = false;
            }
        };

        var hideFilmPlay = function () {
            if (filmPlay) {
                filmPlay.hidden = true;
            }
        };

        var syncFilmVideo = function () {
            if (!filmVisible || document.hidden) {
                filmVideo.pause();
                hideFilmPlay();
                return;
            }

            if (!filmVideo.paused) {
                hideFilmPlay();
                return;
            }

            var playing = filmVideo.play();

            if (playing && typeof playing.catch === 'function') {
                playing.then(hideFilmPlay).catch(showFilmPlay);
            }
        };

        if (filmPlay) {
            filmPlay.addEventListener('click', function () {
                var playing = filmVideo.play();

                if (playing && typeof playing.catch === 'function') {
                    playing.then(hideFilmPlay).catch(showFilmPlay);
                }
            });
        }

        filmVideo.addEventListener('playing', hideFilmPlay);

        if (canWatch) {
            new IntersectionObserver(function (entries) {
                filmVisible = entries[0].isIntersecting;
                syncFilmVideo();
            }, {
                /* Starts and stops a screen's height early, so the decoder is
                   already warm by the time the band is looked at. */
                rootMargin: '100% 0px'
            }).observe(filmVideo);
        }

        syncFilmVideo();

        /* A browser stops a video in a tab you have switched away from, and
           coming back does not always start it again on its own. */
        document.addEventListener('visibilitychange', syncFilmVideo);
    }


    /* ---------------------------------------------------------------------
       3. CIFRE: the count
       The three numbers count up together once the band arrives, and drop back
       to zero once it has left the screen, so the count plays again every time
       the visitor comes back to it. Its own watcher rather than the shared one
       further down, because it needs to touch the digits and not just fade the
       card in. The number is a fact, not a flourish, and must never sit at zero
       in a browser that cannot watch the scroll.
       --------------------------------------------------------------------- */

    var figuresBand = document.querySelector('.brief');

    if (figuresBand) {
        var figureNumbers = figuresBand.querySelectorAll('.brief__number');
        /* One entry per number, holding whichever of the two is outstanding:
           the stagger timer before it starts, or the frame request while it
           runs. Both have to be cancellable, or a reset mid-count leaves an
           older count still writing digits over the new one. */
        var figureJobs = [];

        var formatFigure = function (value) {
            /* Romanian groups thousands with a full stop, so 1200 has to read
               1.200. Named explicitly rather than left to the visitor's
               browser: the page is in Romanian whoever is reading it. */
            return value.toLocaleString('ro-RO');
        };

        var stopFigures = function () {
            figureJobs.forEach(function (job) {
                window.clearTimeout(job.timer);
                window.cancelAnimationFrame(job.frame);
            });
            figureJobs = [];
        };

        var countUpFigures = function () {
            stopFigures();

            Array.prototype.forEach.call(figureNumbers, function (el, i) {
                var target = parseInt(el.getAttribute('data-count-to'), 10);

                if (isNaN(target)) {
                    return;
                }

                el.textContent = '0';

                var job = { timer: 0, frame: 0 };
                figureJobs.push(job);

                /* Staggered so each number starts as its own column would
                   finish rising in the reveal beside it. */
                job.timer = window.setTimeout(function () {
                    var duration = 1400;
                    var start = null;

                    function frame(now) {
                        if (start === null) {
                            start = now;
                        }

                        var progress = Math.min((now - start) / duration, 1);

                        /* Most of the distance is covered early and the last
                           stretch settles, the same shape as --ease-out. A
                           straight count reads mechanical. */
                        var eased = 1 - Math.pow(1 - progress, 4);

                        el.textContent = formatFigure(Math.round(target * eased));

                        if (progress < 1) {
                            job.frame = window.requestAnimationFrame(frame);
                        }
                    }

                    job.frame = window.requestAnimationFrame(frame);
                }, i * 90);
            });
        };

        var resetFigures = function () {
            stopFigures();
            Array.prototype.forEach.call(figureNumbers, function (el) {
                el.textContent = '0';
            });
        };

        if (canWatch) {
            /* Stays observing rather than disconnecting after the first run:
               leaving is what arms the next count. */
            new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) {
                    countUpFigures();
                } else {
                    resetFigures();
                }
            }, {
                /* Fires once the top of the band has risen a fifth of the way
                   up the screen, measured against the window rather than as a
                   visibility fraction: a band taller than the window may
                   never cross a fraction threshold and would sit at zero for
                   good. */
                rootMargin: '0px 0px -20% 0px'
            }).observe(figuresBand);
        } else {
            countUpFigures();
        }
    }


    /* ---------------------------------------------------------------------
       4. HEADER GROUND
       The forest green fills the bar as the hero leaves, tracking the scroll
       exactly rather than snapping at one point. This is the one place on the page
       that genuinely has to read the scroll position, because it is a
       quantity following the thumb rather than a state change with a
       trigger. It publishes one number, --p, from 0 at the top to exactly 1
       when the last pixel of the hero leaves, and the header's ground and the
       hero's own words are both written in CSS in terms of it, so the two
       always agree. Read inside requestAnimationFrame, so the work happens
       once per painted frame however many scroll events fire, from a passive
       listener so it can never hold up the scroll. The hero's height is
       measured on resize rather than per frame, because asking an element for
       its size mid-scroll forces a re-layout.
       --------------------------------------------------------------------- */

    var header = document.querySelector('.site-header');
    var hero = document.querySelector('.hero');

    if (header && hero) {
        var distance = 1;
        var queued = false;
        var lastPublished = -1;

        var measure = function () {
            /* The travel is the full height of the hero: at the end of it the
               hero is entirely above the top of the screen, which is when the
               fill has to be complete. */
            distance = Math.max(hero.offsetHeight, 1);
            publish();
        };

        var publish = function () {
            var p = Math.min(Math.max(window.scrollY / distance, 0), 1);

            /* Rounded before it is written. The colour mix and the shadow's
               alpha are recomputed whenever this property changes, and past
               three decimals nobody can see the difference. */
            p = Math.round(p * 1000) / 1000;

            if (p !== lastPublished) {
                document.documentElement.style.setProperty('--p', String(p));
                lastPublished = p;
            }

            queued = false;
        };

        var onScroll = function () {
            if (!queued) {
                queued = true;
                window.requestAnimationFrame(publish);
            }
        };

        measure();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', measure);
    }


    /* ---------------------------------------------------------------------
       DERIVA DESENELOR DE FUNDAL, REZERVA
       Mișcarea se face în style.css, pe un parcurs de derulare. Acolo stă pe
       firul de compoziție al browserului, și pe iPhone asta e diferența dintre
       lin și târât: pozițiile scrise de aici rămân în urma derulării cu inerție
       și frunzele înoată pe lângă pagină. Deci JS nu preia decât dacă trebuie.

       Când preia, verifică întâi. Am întrebat de două ori browserul dacă știe
       să facă mișcarea, și de două ori a răspuns da fără să o facă: Safari
       accepta parcursul dar lăsa durata pe 0s, iar pe un calculator cu Windows
       și Chrome și Firefox spuneau da și stăteau. Așa că nu se mai întreabă
       nimeni nimic: după încărcare ne uităm unde sunt frunzele față de unde ar
       trebui să fie, și numai dacă nu se potrivesc preia JS.

       --drift e scris in rem si NU e inregistrat cu @property, deci
       getPropertyValue intoarce jetonul brut ("2.75rem"), nu pixeli. parseFloat
       pe el dadea 2.75 in loc de 44: frunzele se mișcau trei pixeli, adica
       deloc. Sonda rezolva lungimea prin layout, deci merge si daca --drift
       ajunge px, em sau calc().
       --------------------------------------------------------------------- */

    var motifs = document.querySelectorAll('.motif');

    if (motifs.length) {
        var probe = document.createElement('div');
        probe.setAttribute('aria-hidden', 'true');
        probe.style.cssText = 'position:absolute;left:-9999px;top:0;height:0;visibility:hidden;pointer-events:none';
        document.body.appendChild(probe);

        var toPx = function (value) {
            if (!value) {
                return 0;
            }
            probe.style.width = value;
            return parseFloat(getComputedStyle(probe).width) || 0;
        };

        var motifStates = Array.prototype.map.call(motifs, function (el) {
            var state = {
                el: el,
                shift: 0,
                travel: toPx(getComputedStyle(el).getPropertyValue('--drift').trim()) || 48,
                /* Toate pornesc în lucru, ca prima așezare să fie corectă peste
                   tot. Observatorul le scoate imediat pe cele de sub ecran. Cu
                   `false` aici, desenele de sus rămâneau o clipă nemișcate și
                   apoi săreau, la fiecare încărcare. */
                near: true
            };

            /* Legătura înapoi de la element la starea lui, pentru observator.
               Căutarea în listă la fiecare intrare ar fi 89 de comparații. */
            el.motifState = state;

            return state;
        });
        var motifFrame = 0;

        var updateMotifs = function () {
            var viewport = window.innerHeight || document.documentElement.clientHeight;
            var next = [];

            /* Toate măsurătorile înaintea tuturor scrierilor. Amestecate, fiecare
               scriere ar invalida stilul și citirea următoare ar cere din nou
               așezarea paginii. */
            motifStates.forEach(function (state) {
                if (!state.near) {
                    return;
                }

                var rect = state.el.getBoundingClientRect();

                /* Desenele stinse de o interogare de lățime măsoară zero pe
                   ambele laturi. Pe telefon și pe tabletă sunt zeci, și fără
                   ieșirea asta primeau un translate nou la fiecare cadru. */
                if (!rect.width && !rect.height) {
                    return;
                }

                var top = rect.top - state.shift;
                var progress = Math.min(Math.max((viewport - top) / (viewport + rect.height), 0), 1);

                next.push({
                    state: state,
                    shift: state.travel * (1 - progress * 2)
                });
            });

            next.forEach(function (item) {
                item.state.shift = item.shift;
                item.state.el.style.translate = '0 ' + item.shift.toFixed(2) + 'px';
            });

            motifFrame = 0;
        };

        var queueMotifs = function () {
            if (!motifFrame) {
                motifFrame = window.requestAnimationFrame(updateMotifs);
            }
        };

        var takeOverDrift = function () {
            /* Oprește animația din CSS. Fără asta ea ar bate stilul inline
               scris mai sus și frunza ar rămâne tot pe loc. */
            document.documentElement.classList.add('motif-drift-js');

            if (canWatch) {
                /* Cadrul atinge numai desenele de pe ecran. Sunt 89 pe pagina
                   principală și rareori un sfert sub ochi deodată. Marginea le
                   prinde înainte să intre, ca să fie deja pe poziția potrivită
                   când apar, nu să sară la prima mișcare. */
                var motifWatcher = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        entry.target.motifState.near = entry.isIntersecting;
                    });

                    queueMotifs();
                }, {
                    rootMargin: '25% 0px'
                });

                motifStates.forEach(function (state) {
                    motifWatcher.observe(state.el);
                });
            }

            updateMotifs();
            window.addEventListener('scroll', queueMotifs, { passive: true });
            window.addEventListener('resize', queueMotifs);
        };


        /* Cât s-a mutat frunza acum, în pixeli, oricine ar fi scris mutarea. */
        var shiftOf = function (el) {
            var written = getComputedStyle(el).translate;

            if (!written || written === 'none') {
                return 0;
            }

            var parts = written.split(' ');

            return parseFloat(parts.length > 1 ? parts[1] : '0') || 0;
        };

        /* SE MIȘCĂ SAU NU
           Întrebarea e chiar asta, pusă direct, pentru că fiecare test mai
           deștept a picat pe câte un caz:

           - „unde ar trebui să fie frunza" cere refacerea intervalului `cover`,
             iar desenele au `rotate`, care schimbă chenarul măsurat. Pagina de
             contact ieșea stricată fiind sănătoasă.
           - „stă înțepenită la un capăt" prinde animația cu durata 0, dar nu și
             una care se aplică o dată, la o valoare oarecare de la mijloc, și
             pe urmă nu mai e împinsă niciodată. Exact asta se întâmplă pe
             calculatorul cu Windows, și trecea drept sănătoasă.

           Deci: alegem câteva frunze care sunt chiar acum pe ecran, deci în
           plin drum, le ținem minte poziția, și după o derulare adevărată ne
           uităm dacă s-a schimbat vreuna. Numai cele de pe ecran, altfel am
           întreba una care stă cuminte la capăt fiindcă încă n-a intrat. Și
           destulă derulare: pe telefon deriva e de o jumătate de rem întinsă
           pe două ecrane, deci la o mișcare scurtă schimbarea reală e sub un
           pixel și n-ar dovedi nimic. La 400 de pixeli derulați e limpede. */
        var DRIFT_PROOF_SCROLL = 200;

        var scrollNow = function () {
            return window.scrollY || window.pageYOffset || 0;
        };

        var pickWitnesses = function () {
            var viewport = window.innerHeight || document.documentElement.clientHeight;
            var picked = [];

            for (var i = 0; i < motifStates.length && picked.length < 6; i++) {
                var state = motifStates[i];
                var rect = state.el.getBoundingClientRect();

                if (!rect.width && !rect.height) {
                    continue;
                }

                if (rect.bottom < 0 || rect.top > viewport) {
                    continue;
                }

                picked.push({ el: state.el, was: shiftOf(state.el) });
            }

            return picked;
        };

        /* O frunză aflată chiar acum între capete, nu la +drift sau -drift.
           O animație cu durata zero nu produce niciodată așa ceva: își aruncă
           frunza dintr-un capăt în celălalt și atât. */
        var seesMiddle = function () {
            var viewport = window.innerHeight || document.documentElement.clientHeight;
            var looked = 0;

            for (var i = 0; i < motifStates.length && looked < 12; i++) {
                var state = motifStates[i];
                var rect = state.el.getBoundingClientRect();

                if ((!rect.width && !rect.height) || rect.bottom < 0 || rect.top > viewport) {
                    continue;
                }

                looked++;

                var written = getComputedStyle(state.el).translate;

                if (!written || written === 'none') {
                    continue;
                }

                if (Math.abs(Math.abs(shiftOf(state.el)) - state.travel) >
                        state.travel * 0.15) {
                    return true;
                }
            }

            return false;
        };

        /* Se cer amândouă, pentru că fiecare singură lasă o portiță:
             - numai „s-a schimbat ceva" trece o animație cu durata zero, care
               chiar schimbă valoarea, sărind între capete;
             - numai „stă la mijloc" trece o animație înghețată la o valoare
               oarecare, cum se întâmplă pe calculatorul cu Windows.
           O mișcare sănătoasă le arată pe amândouă în prima rundă. */
        var sawMiddle = false;
        var sawChange = false;
        var rounds = 0;
        var witnesses = null;
        var witnessedAt = 0;

        var settleDrift = function () {
            if (!sawMiddle && seesMiddle()) {
                sawMiddle = true;
            }

            if (!witnesses || !witnesses.length) {
                witnesses = pickWitnesses();
                witnessedAt = scrollNow();
                return;
            }

            if (Math.abs(scrollNow() - witnessedAt) < DRIFT_PROOF_SCROLL) {
                return;
            }

            witnesses.forEach(function (witness) {
                if (Math.abs(shiftOf(witness.el) - witness.was) > 1) {
                    sawChange = true;
                }
            });

            rounds++;
            witnesses = null;

            if (sawMiddle && sawChange) {
                window.removeEventListener('scroll', onDriftCheck);
                rememberVerdict(false);
                return;
            }

            if (rounds >= 4) {
                window.removeEventListener('scroll', onDriftCheck);
                rememberVerdict(true);
                takeOverDrift();
            }
        };

        var driftCheckedAt = 0;
        var driftRolled = 0;
        var driftLastY = 0;

        function onDriftCheck() {
            /* Măsurat în pixeli derulați, nu în timp. Cu un prag de timp, o
               aruncătură rapidă de deget trecea toată pagina în vreo secundă și
               apuca doar câteva verificări: nu se aduna nimic de spus și
               mișcarea moartă scăpa nedescoperită. Pe derulare pragul se ține
               după deget, oricât de repede merge.

               Marginea de timp rămâne, mică, doar cât să nu ajungă verificarea
               la fiecare cadru: citește stiluri calculate, și tocmai asta ar
               face zgâlțâiala pe care o caută. */
            var now = scrollNow();

            driftRolled += Math.abs(now - driftLastY);
            driftLastY = now;

            if (driftRolled < 150) {
                return;
            }

            var stamp = Date.now();

            if (stamp - driftCheckedAt < 60) {
                return;
            }

            driftRolled = 0;
            driftCheckedAt = stamp;
            settleDrift();
        }

        /* Verdictul se ține minte cât ține vizita. Pagina de contact are opt
           desene în total și rareori mai mult de unul pe ecran deodată, deci
           acolo verificarea rămâne fără subiect și nu se pronunță. Pagina
           principală are 89 și se pronunță în câteva sute de pixeli. Odată aflat
           răspunsul pe orice pagină, îl folosesc toate celelalte: e o însușire a
           browserului, nu a paginii. */
        var DRIFT_MEMORY = 'motif-drift-css-dead';

        var rememberVerdict = function (dead) {
            try {
                window.sessionStorage.setItem(DRIFT_MEMORY, dead ? '1' : '0');
            } catch (e) {
                /* Navigare privată sau memorie plină: se verifică din nou. */
            }
        };

        var recalledVerdict = function () {
            try {
                return window.sessionStorage.getItem(DRIFT_MEMORY);
            } catch (e) {
                return null;
            }
        };

        var cssMightDrift = !!(window.CSS && typeof window.CSS.supports === 'function' &&
            window.CSS.supports('animation-timeline: view()') &&
            window.CSS.supports('animation-duration: auto'));

        var recalled = recalledVerdict();

        if (!cssMightDrift || recalled === '1') {
            takeOverDrift();
        } else if (recalled !== '0') {
            var startDriftCheck = function () {
                driftLastY = scrollNow();
                settleDrift();
                window.addEventListener('scroll', onDriftCheck, { passive: true });
            };

            if (document.readyState === 'complete') {
                startDriftCheck();
            } else {
                window.addEventListener('load', startDriftCheck);
            }
        }
    }


    if (!canWatch) {
        return;
    }


    /* ---------------------------------------------------------------------
       5. THE HERO SEQUENCE
       The one place GSAP earns its weight: five elements on one timeline with
       overlapping starts, which is fiddly and brittle written as five CSS
       delays. Runs once, on load.
       --------------------------------------------------------------------- */

    /* Only index.html has a hero. Without the element check the timeline is
       still built on despre.html, contact.html and the privacy page, and GSAP
       logs nine "target not found" warnings on every load of each. */
    if (gsap && document.querySelector('.hero__mark')) {
        /* Not started until the tab is actually on screen. A page opened in a
           background tab has its animation frames suspended, so a timeline
           begun there freezes part-way and the visitor arrives at a half-faded
           hero that never finishes. */
        if (document.hidden) {
            document.addEventListener('visibilitychange', function once() {
                if (document.hidden) {
                    return;
                }
                document.removeEventListener('visibilitychange', once);
                playHero();
            });
        } else {
            playHero();
        }
    }

    function playHero() {
        var heroParts = ['.hero__mark', '.hero__title', '.hero__lead', '.hero__cta'];

        gsap.timeline({
            defaults: { ease: 'expo.out', duration: 1.1 },
            onComplete: function () {
                gsap.set(heroParts, { clearProps: 'transform' });
            }
        })
            /* Keep every part visible from first paint. A throttled first
               animation frame may delay the settling motion, but it must
               never leave the hero as an empty photograph. */
            .from('.hero__mark', { y: 24, scale: 0.92, duration: 1.3 })
            .from('.hero__title', { y: 28 }, '-=0.95')
            .from('.hero__lead', { y: 20 }, '-=0.9')
            .from('.hero__cta', { y: 18 }, '-=0.85');
    }


    /* ---------------------------------------------------------------------
       6. REVEAL ON SCROLL
       Blocks that arrive together are staggered so they land in reading order
       rather than all at once. Each is unobserved once it has arrived, so
       scrolling back up does not replay it.
       --------------------------------------------------------------------- */

    var groups = [
        { selector: '.brief__item', stagger: 0.08 },
        { selector: '.orchard__statement, .orchard__note, .orchard__catalog', stagger: 0.1 },
        /* within: numărătoarea pentru decalaj repornește în fiecare bloc de
           fruct. Fără el, indicii ar curge peste toate cele patru blocuri și
           ultimul paragraf ar aștepta aproape o secundă înainte să pornească. */
        { within: '.grove', selector: '.grove__head, .grove__intro, .grove__detail', stagger: 0.08 },
        { selector: '.film__frame, .film__caption', stagger: 0.12 },
        { selector: '.faq__head, .faq__item', stagger: 0.07 },
        /* Subsolul, inclusiv siglele: un singur grup, ordinea din pagină.
           Ca grupuri separate, rândul cu sigle și datele fermei porneau în
           același moment și se citeau ca două sosiri suprapuse.

           atBottom: fără marginea de 15% de jos. Rândul cu sigle este ultimul
           lucru din pagină și stă chiar în banda aceea; cu marginea pusă, nu
           intră niciodată în zona urmărită și rămâne invizibil oricât s-ar
           derula. Orice bloc lipit de capătul paginii are nevoie de asta. */
        {
            selector: '.site-footer__inner > *, .partners__label, .partners__item, .site-footer__base > *, .site-footer__legal',
            stagger: 0.08,
            atBottom: true
        }
    ];

    function makeWatcher(rootMargin) {
        return new IntersectionObserver(function (entries, self) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }

                var el = entry.target;
                self.unobserve(el);

                if (gsap) {
                    gsap.to(el, {
                        y: 0,
                        rotate: 0,
                        opacity: 1,
                        duration: 1.1,
                        ease: 'expo.out',
                        delay: Number(el.dataset.delay || 0),
                        onComplete: function () {
                            /* .is-in must land before the inline transform goes.
                               Clearing it on its own drops the block back to
                               .reveal's offset and tilt. */
                            el.classList.add('is-in');
                            gsap.set(el, { clearProps: 'transform,opacity' });
                        }
                    });
                } else {
                    /* No GSAP: the CSS transition on .reveal does the same move. */
                    el.classList.add('is-in');
                }
            });
        }, { rootMargin: rootMargin });
    }

    /* 15% up from the bottom: the block has properly entered the screen before
       it starts moving, rather than animating off the edge. */
    var watcher = makeWatcher('0px 0px -15% 0px');
    var watcherAtBottom = makeWatcher('0px');

    groups.forEach(function (group) {
        var observer = group.atBottom ? watcherAtBottom : watcher;

        var arm = function (root) {
            Array.prototype.forEach.call(root.querySelectorAll(group.selector), function (el, i) {
                el.classList.add('reveal');
                /* Turns off the CSS transition: with GSAP writing an inline
                   transform every frame, the transition would try to ease to each
                   of those frames as well and the move smears. */
                if (gsap) {
                    el.classList.add('reveal--js');
                }
                el.dataset.delay = (i * group.stagger).toFixed(2);
                observer.observe(el);
            });
        };

        if (group.within) {
            Array.prototype.forEach.call(document.querySelectorAll(group.within), arm);
        } else {
            arm(document);
        }
    });


    /* ---------------------------------------------------------------------
       7. FOTOGRAFIILE FRUCTELOR
       Fiecare fotografie se descoperă de jos în sus, în propria formă de
       frunză. Mișcarea este un singur clip-path în CSS; aici se pune doar
       clasa care o pornește.

       Nu intră în grupurile de mai sus fiindcă nu este aceeași sosire: acolo
       blocul urcă și se așază, aici imaginea se dezvelește pe loc. Un element
       cu amândouă ar face două mișcări deodată.

       Cele două fotografii ale unui fruct pornesc la distanță de o jumătate de
       secundă, în ordinea din pagină, așa încât ochiul să fie plimbat pe
       diagonala blocului — adică exact pe direcția în care este așezat.

       .wipe este pusă numai de aici, deci fără script fotografia este
       întreagă de la prima pictare. */

    var frameWatcher = new IntersectionObserver(function (entries, self) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
                return;
            }

            self.unobserve(entry.target);
            entry.target.classList.add('is-in');
        });
    }, { rootMargin: '0px 0px -12% 0px' });

    Array.prototype.forEach.call(document.querySelectorAll('.grove'), function (grove) {
        Array.prototype.forEach.call(grove.querySelectorAll('.grove__frame'), function (frame, i) {
            frame.classList.add('wipe');
            frame.style.transitionDelay = (i * 0.5) + 's';
            frameWatcher.observe(frame);
        });
    });


    /* ---------------------------------------------------------------------
       8. LINIA SECȚIUNII
       O singură trăsătură desenată, din capul cireșelor până sub pere. Nu este
       chenarul niciunei liste: un chenar e drept, iar aici linia trebuie să
       șerpuiască.

       Are două purtări, după bloc:
       - pe margine (cireșe, pere) merge lipită de calendar și îi poartă
         bulinele, cu o legănare mică, numai în afară, ca să nu intre în text;
       - la mijloc (caise, prune) se desprinde de calendar și se leagănă lat
         stânga-dreapta pe coridorul de padding lăsat anume pentru ea, iar
         bulinele urmăresc fiecare oprire a liniei.

       De ce cod și nu CSS: nicio regulă nu poate ști pe ce x iese o coloană
       flexibilă, nici cât de lat e coridorul după ce s-au așezat toate. Se
       măsoară, se scrie o cale, gata — nimic citit la scroll, nicio buclă.

       Toată calea este un singur spline Catmull-Rom prin punctele de mai jos,
       deci trece prin fiecare punct exact și nu are colțuri nicăieri: de asta
       se citește ca o trăsătură de mână și nu ca niște arce lipite cap la cap.

       .has-spine, pusă numai de aici, e ce stinge chenarul drept și cârligele
       lui. Fără script rămân patru calendare drepte, întregi. */

    var groves = document.querySelector('.orchard__groves');
    var rails = groves ? Array.prototype.slice.call(groves.querySelectorAll('.grove__rail')) : [];

    if (groves && rails.length > 1) {
        var NS = 'http://www.w3.org/2000/svg';
        var spine = document.createElementNS(NS, 'svg');
        var spinePath = document.createElementNS(NS, 'path');
        var spineHead = document.createElementNS(NS, 'circle');
        var spineFoot = document.createElementNS(NS, 'circle');

        /* Cât se abate linia de la coloana ei, ca fracțiune din legănarea
           maximă. Pozitiv înseamnă spre text, negativ dinspre el.
           Pe margine sunt cinci trepte fiindcă acolo punctele sunt chiar
           bulinele: patru etape plus cele două capete. */
        var SWAY_EDGE = [0, -0.42, -1, -0.68, -0.24, 0];
        var SWAY_MID = [0, 0.9, -0.55, 0.9, -0.45, 0];
        /* Legănarea de pe margine, în pixeli. Peste vreo 18 bulina se rupe de
           rândul ei de text și nu se mai citește ca semnul lui. */
        var SWAY_EDGE_PX = 16;
        /* Cât din coridor ia legănarea din mijloc spre text. Restul până la
           text este garda care o ține să nu-l atingă. */
        var SWAY_MID_KEEP = 0.82;
        /* Spre partea cealaltă nu mai există coridor, ci numai golul dintre
           coloanele blocului: legănarea ia din el tot în afară de garda asta.
           Constantă ar fi mers până la prima lățime de fereastră la care golul
           iese mai mic decât ea, și de acolo linia ar fi trecut peste proză. */
        var SWAY_MID_GUARD = 18;

        /* Latura chenarului se citește o singură dată, ÎNAINTE ca .has-spine
           să-l stingă — pe urmă nu mai are de unde fi citită. */
        var plots = rails.map(function (rail) {
            return {
                rail: rail,
                grove: rail.closest('.grove'),
                mid: rail.closest('.grove').classList.contains('grove--mid'),
                /* Chenarul pe stânga înseamnă text la dreapta lui. */
                toward: parseFloat(getComputedStyle(rail).borderLeftWidth) > 0 ? 1 : -1,
                stages: Array.prototype.slice.call(rail.querySelectorAll('.grove__stage'))
            };
        });

        spine.setAttribute('class', 'orchard__spine');
        spine.setAttribute('aria-hidden', 'true');
        spineHead.setAttribute('r', 3.5);
        spineFoot.setAttribute('r', 3.5);
        spine.appendChild(spinePath);
        spine.appendChild(spineHead);
        spine.appendChild(spineFoot);

        /* Catmull-Rom prin puncte, scris în cubice Bézier. Direcția mânerului
           într-un punct este cea dintre vecinii lui; LUNGIMEA lui însă se ia
           din segmentul pe care îl deservește, nu din distanța dintre vecini.

           Asta e tot ce contează aici: punctele nu sunt la distanțe egale —
           între prima lună și capul blocului sunt 25 de pixeli, între blocuri
           sunt aproape 800 — iar forma clasică, cu mânerul luat din vecini,
           scotea o buclă la fiecare punct înghesuit și arunca traversarea
           dintre blocuri cu 130 de pixeli în afara paginii. Cu lungimea legată
           de segment linia nu poate depăși punctul următor. */
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
                /* O treime din segment: forma obișnuită pentru o cubică care
                   trebuie să treacă drept printre două puncte. */
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

        /* Traversarea dintre două blocuri, ca puncte pe o cubică cu mânerele pe
           verticală: pleacă din coloana de sus pe direcția ei, se răsucește la
           mijloc și sosește pe coloana de jos tot pe direcția ei.

           **Golul are 218 pixeli pe verticală, iar traversarea cea mare are 767
           pe orizontală.** Aici e tot cazul: pe un dreptunghi atât de culcat,
           orice curbă cu mânere scurte iese două colțuri strânse cu o diagonală
           trasă cu rigla între ele — exact ce a arătat clientul. Prima variantă
           mai și ținea x-ul un sfert de gol la fiecare capăt, ceea ce lungea
           dreapta aceea și mai mult.

           Leacul sunt mânere LUNGI: aproape tot golul pe verticală (0.98 și
           0.88), plus a zecea parte din traversare pe orizontală. Verticala
           lungă ține plecarea aproape la fel de dreaptă ca linia calendarului,
           iar lungimea face ca întoarcerea să se întindă pe toată lățimea: nu
           mai rămâne nicio porțiune dreaptă, ci un singur S care se abate cam
           50 de pixeli de fiecare parte a coardei.

           Mânerele sunt inegale fiindcă un S simetric se citește desenat de
           mașină. DRIFT împinge mijlocul într-o parte, alternând de la o
           traversare la alta, ca cele trei să nu iasă la fel. */
        var CROSS_LEAD = 0.98;
        var CROSS_LAND = 0.88;
        var CROSS_BEND = 0.1;
        var CROSS_STOP = [0.14, 0.29, 0.43, 0.57, 0.71, 0.86];
        var CROSS_DRIFT = 0.03;

        var crossing = function (from, to, turn) {
            var span = to.y - from.y;
            var reach = (to.x - from.x) * CROSS_BEND;
            var c1 = { x: from.x + reach, y: from.y + span * CROSS_LEAD };
            var c2 = { x: to.x - reach, y: to.y - span * CROSS_LAND };
            var drift = (to.x - from.x) * CROSS_DRIFT * (turn % 2 ? -1 : 1);

            return CROSS_STOP.map(function (t) {
                var u = 1 - t;
                var w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];

                return {
                    x: w[0] * from.x + w[1] * c1.x + w[2] * c2.x + w[3] * to.x +
                        /* Abaterea se stinge la capete, altfel ar rupe direcția
                           cu care linia intră în calendarul următor. */
                        drift * Math.sin(Math.PI * t),
                    y: w[0] * from.y + w[1] * c1.y + w[2] * c2.y + w[3] * to.y
                };
            });
        };

        var drawSpine = function () {
            var box = groves.getBoundingClientRect();
            var rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
            var pts = [];

            plots.forEach(function (plot, n) {
                /* Sub 64em blocul se așază pe o coloană și calendarul ia toată
                   lățimea: coridorul din mijloc nu mai există, deci nici
                   purtarea de bloc-din-mijloc. Toate patru se poartă atunci ca
                   blocurile de pe margine — linia stă lipită de chenarul lor și
                   le poartă bulinele. Perechea în CSS este în secțiunea 13. */
                var mid = plot.mid && wide.matches;
                var r = plot.rail.getBoundingClientRect();
                var railStyle = getComputedStyle(plot.rail);
                var pad = parseFloat(railStyle.paddingInlineEnd) ||
                    parseFloat(railStyle.paddingInlineStart);
                /* Golul dintre coloanele blocului: tot ce are linia la
                   dispoziție de partea dinspre care s-a dus textul. */
                var room = Math.max(
                    parseFloat(getComputedStyle(plot.rail.parentNode).columnGap) - SWAY_MID_GUARD,
                    0
                );
                /* Coloana liniei: latura dinspre care s-a dus textul. */
                var base = (plot.toward > 0 ? r.left : r.right) - box.left;
                /* Pe ce înălțime coboară linia în dreptul acestui fruct.
                   Pe ecran lat este chiar calendarul: el este o coloană
                   întinsă pe tot blocul (align-self: stretch), deci linia
                   merge de-a lungul întregului fruct.
                   Pe o coloană calendarul este numai ultimul rând al blocului,
                   așa că înălțimea se ia de la bloc — altfel drumul de la un
                   calendar la următorul ar trece drept prin fotografiile și
                   proza fructului dintre ele. Latura rămâne cea a chenarului,
                   deci linia coboară prin culoarul deschis în CSS. */
                var run = wide.matches ? r : plot.grove.getBoundingClientRect();
                var top = run.top - box.top;
                var height = run.height;
                var sway = mid ? SWAY_MID : SWAY_EDGE;
                var i;

                /* Golul de deasupra blocului. */
                if (n > 0) {
                    pts = pts.concat(crossing(
                        pts[pts.length - 1],
                        { x: base, y: top },
                        n
                    ));
                }

                for (i = 0; i < sway.length; i += 1) {
                    var off = sway[i] >= 0
                        ? sway[i] * (mid ? pad * SWAY_MID_KEEP : SWAY_EDGE_PX)
                        : sway[i] * (mid ? room : SWAY_EDGE_PX);
                    var stage = plot.stages[i - 1];
                    var y;

                    if (!stage) {
                        y = top + height * (i === 0 ? 0 : 1);
                    } else {
                        /* Centrul bulinei: 0.35em de la marginea etapei (CSS),
                           jumătate din cei 0.5rem ai ei și bordura de 1px. */
                        var s = stage.getBoundingClientRect();
                        y = s.top - box.top +
                            parseFloat(getComputedStyle(stage).fontSize) * 0.35 + rem * 0.25 + 1;
                    }

                    pts.push({ x: base + plot.toward * off, y: y });

                    /* Bulina se mută cu linia, ca să rămână pe ea. Semnul
                       păstrează direcția abaterii: linia din mijloc se poate
                       legăna pe ambele laturi ale coloanei. */
                    if (stage) {
                        stage.style.setProperty('--dot-shift',
                            (plot.toward * off) + 'px');
                    }
                }
            });

            spine.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
            spinePath.setAttribute('d', through(pts));
            spineHead.setAttribute('cx', pts[0].x);
            spineHead.setAttribute('cy', pts[0].y);
            spineFoot.setAttribute('cx', pts[pts.length - 1].x);
            spineFoot.setAttribute('cy', pts[pts.length - 1].y);
        };

        /* Linia se desenează la ORICE lățime: este desenul care ține secțiunea
           laolaltă, nu un ornament de ecran lat. Ce se schimbă sub 64em este
           numai purtarea blocurilor din mijloc, mai sus în drawSpine. Aceeași
           lățime scrisă în CSS — dacă se schimbă acolo, se schimbă și aici. */
        var wide = window.matchMedia('(min-width: 64em)');
        var applySpine = function () {
            drawSpine();
        };

        groves.appendChild(spine);
        groves.classList.add('has-spine');
        drawSpine();

        /* Fonturile și imaginile sosite după prima pictare schimbă înălțimile,
           deci calea se rescrie odată cu cutia. Fără ResizeObserver rămâne
           evenimentul de redimensionare, care prinde cazul obișnuit. */
        if ('ResizeObserver' in window) {
            var watcher = new ResizeObserver(applySpine);
            watcher.observe(groves);
            rails.forEach(function (rail) {
                watcher.observe(rail);
            });
        } else {
            window.addEventListener('resize', applySpine);
        }

        /* Ascultat direct pe interogarea de lățime, nu numai prin
           ResizeObserver: trecerea peste 64em se poate întâmpla fără ca vreuna
           din cutiile urmărite să-și schimbe dimensiunea, iar atunci linia ar
           rămâne desenată peste aranjamentul pe o coloană. */
        if (typeof wide.addEventListener === 'function') {
            wide.addEventListener('change', applySpine);
        } else if (typeof wide.addListener === 'function') {
            wide.addListener(applySpine);
        }

        window.addEventListener('load', applySpine);
    }


    /* ---------------------------------------------------------------------
       9. MENIUL LATERAL
       Numai sub 64em; peste, CSS-ul îl scoate din pagină cu display: none și
       codul de aici nu are ce deschide.

       inert pe panoul închis, nu numai visibility: hidden — un panou tras în
       afara ecranului rămâne altfel tabulabil, iar cursorul de tastatură ar
       pleca în el fără ca nimic să se miște pe ecran.

       Fără fișierul acesta butonul nu apare deloc (clasa no-js din <head>), deci
       nu rămâne niciun buton care să nu facă nimic.
       --------------------------------------------------------------------- */

    var drawer = document.querySelector('.drawer');
    var burger = document.querySelector('.burger');

    if (drawer && burger) {
        var panel = drawer.querySelector('.drawer__panel');
        var narrow = window.matchMedia('(max-width: 63.99em)');
        var root = document.documentElement;

        /* Tot ce nu este panoul. Deschis, blocul acesta primește inert, deci
           tabularea nu poate ieși din panou pe la capătul lui — asta ține locul
           unei capcane de focus scrise de mână, care ar fi fost treizeci de
           rânduri pentru același rezultat. */
        var behind = Array.prototype.filter.call(document.body.children, function (el) {
            return el !== drawer && el.tagName !== 'SCRIPT';
        });

        var setOpen = function (open) {
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
            drawer.classList.toggle('is-open', open);

            if (open) {
                drawer.removeAttribute('inert');
            } else {
                drawer.setAttribute('inert', '');
            }

            behind.forEach(function (el) {
                if (open) {
                    el.setAttribute('inert', '');
                } else {
                    el.removeAttribute('inert');
                }
            });

            /* Bara de derulare dispare odată cu derularea, iar pagina de sub
               panou ar sări cu lățimea ei. Se pune înapoi ca padding. Pe un
               telefon bara este suprapusă, deci diferența iese 0 și nu se
               schimbă nimic. */
            if (open) {
                var bar = window.innerWidth - root.clientWidth;
                root.style.paddingInlineEnd = bar > 0 ? bar + 'px' : '';
                root.classList.add('is-locked');
            } else {
                root.classList.remove('is-locked');
                root.style.paddingInlineEnd = '';
            }
        };

        var open = function () {
            setOpen(true);
            /* Prima oprire din panou, ca tastatura să intre în el imediat. */
            var first = panel.querySelector('.drawer__close');
            if (first) {
                first.focus();
            }
        };

        var close = function (returnFocus) {
            setOpen(false);
            if (returnFocus) {
                burger.focus();
            }
        };

        burger.addEventListener('click', function () {
            if (drawer.classList.contains('is-open')) {
                close(true);
            } else {
                open();
            }
        });

        Array.prototype.forEach.call(drawer.querySelectorAll('[data-drawer-close]'), function (el) {
            el.addEventListener('click', function () {
                close(true);
            });
        });

        /* Ancorele duc în aceeași pagină: panoul trebuie să plece de peste
           destinația spre care tocmai a trimis. Fără returnFocus — cursorul
           merge la ancoră, nu înapoi la buton. */
        Array.prototype.forEach.call(drawer.querySelectorAll('.drawer__link'), function (link) {
            link.addEventListener('click', function () {
                close(false);
            });
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
                close(true);
            }
        });

        /* Ținut deschis peste 64em, panoul dispare din ecran (display: none) dar
           pagina ar rămâne blocată la derulare. */
        var onWidth = function () {
            if (!narrow.matches && drawer.classList.contains('is-open')) {
                close(false);
            }
        };

        if (typeof narrow.addEventListener === 'function') {
            narrow.addEventListener('change', onWidth);
        } else if (typeof narrow.addListener === 'function') {
            narrow.addListener(onWidth);
        }

        setOpen(false);
    }


}());
