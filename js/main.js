/* ============================================================================
   Ferma Fruct Brabova — pagina principală

   Six jobs. Every one of them is optional: the page is complete, readable and
   navigable with this file removed. Nothing here creates content.

   The movement is one idea used everywhere: a card laid on a table. It arrives
   from slightly below, tilted a hair, and settles flat. Nothing fades in place,
   nothing slides in from the side.
   ============================================================================ */

(function () {
    'use strict';

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canWatch = 'IntersectionObserver' in window;
    var gsap = window.gsap;


    /* ---------------------------------------------------------------------
       1. THE FILM
       autoplay is a request, not a promise: a browser in a power-saving mode
       or with autoplay switched off will refuse it, and the refusal arrives as
       a rejected promise rather than an error. The poster staying up is the
       whole fallback — no video on this page ever grows controls, because both
       are wallpaper rather than something to watch.

       .film__video is skipped here: section 2 owns when it plays. Calling
       play() on it from this loop and pause() from there moments later rejects
       the in-flight promise. */

    Array.prototype.forEach.call(document.querySelectorAll('video[autoplay]'), function (video) {
        if (video.classList.contains('film__video')) {
            return;
        }

        var attempt = video.play();

        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {});
        }
    });


    /* ---------------------------------------------------------------------
       2. FILM BAND: play only on screen
       The second video autoplays and loops, which is motion that never runs
       out on its own — the one thing base.css cannot switch off for someone
       who has asked for less motion, since that setting reaches transitions
       and animations, not a decoder. It starts a screen's height before the
       band arrives, so it is already moving by the time it is looked at, and
       stops once the band has scrolled away, the tab is hidden, or the
       reduced-motion setting changes while the page is open. Pausing leaves
       the poster up, and the poster is the video's own first frame, so the
       band still reads as the band.
       --------------------------------------------------------------------- */

    var filmVideo = document.querySelector('.film__video');

    if (filmVideo) {
        var filmMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        var filmVisible = !canWatch;

        var syncFilmVideo = function () {
            if (filmMotionQuery.matches || !filmVisible || document.hidden) {
                filmVideo.pause();
                return;
            }

            if (!filmVideo.paused) {
                return;
            }

            var playing = filmVideo.play();

            /* A refusal arrives as a rejected promise; the poster staying up
               is the right outcome anyway, so there is nothing to do with
               it beyond stopping it reaching the console unhandled. */
            if (playing && typeof playing.catch === 'function') {
                playing.catch(function () {});
            }
        };

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

        /* addEventListener on a media query is the current form; addListener
           is kept as a fallback rather than assuming every engine has grown
           the new one. */
        if (typeof filmMotionQuery.addEventListener === 'function') {
            filmMotionQuery.addEventListener('change', syncFilmVideo);
        } else if (typeof filmMotionQuery.addListener === 'function') {
            filmMotionQuery.addListener(syncFilmVideo);
        }

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
       card in, and it has to run even for a visitor who has asked for less
       motion or whose browser cannot watch the scroll: the number is a fact,
       not a flourish, and it must never sit at zero for someone who is never
       going to see it move.
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

        if (reduced) {
            /* The finished numbers, immediately, and no reset: nothing here is
               allowed to move for someone who has asked it not to. */
            Array.prototype.forEach.call(figureNumbers, function (el) {
                var target = parseInt(el.getAttribute('data-count-to'), 10);
                el.textContent = isNaN(target) ? el.textContent : formatFigure(target);
            });
        } else if (canWatch) {
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


    if (reduced || !canWatch) {
        return;
    }


    /* ---------------------------------------------------------------------
       5. THE HERO SEQUENCE
       The one place GSAP earns its weight: five elements on one timeline with
       overlapping starts, which is fiddly and brittle written as five CSS
       delays. Runs once, on load.
       --------------------------------------------------------------------- */

    if (gsap) {
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
        gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.1 } })
            .from('.hero__mark', { y: 24, opacity: 0, scale: 0.92, duration: 1.3 })
            .from('.hero__title', { y: 28, opacity: 0 }, '-=0.95')
            .from('.hero__lead', { y: 20, opacity: 0 }, '-=0.9')
            .from('.hero__cta', { y: 18, opacity: 0 }, '-=0.85')
            .from('.hero__cue', { opacity: 0, duration: 0.8 }, '-=0.5');
    }


    /* ---------------------------------------------------------------------
       6. REVEAL ON SCROLL
       Blocks that arrive together are staggered so they land in reading order
       rather than all at once. Each is unobserved once it has arrived, so
       scrolling back up does not replay it.
       --------------------------------------------------------------------- */

    var groups = [
        { selector: '.brief__item', stagger: 0.08 },
        { selector: '.orchard__statement, .orchard__note', stagger: 0.1 },
        { selector: '.fruit', stagger: 0.09 },
        { selector: '.film__frame, .film__caption', stagger: 0.12 },
        { selector: '.partners__list li', stagger: 0.06 },
        { selector: '.site-footer__inner > *', stagger: 0.08 }
    ];

    var watcher = new IntersectionObserver(function (entries, self) {
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
    }, {
        /* 15% up from the bottom: the block has properly entered the screen
           before it starts moving, rather than animating off the edge. */
        rootMargin: '0px 0px -15% 0px'
    });

    groups.forEach(function (group) {
        Array.prototype.forEach.call(document.querySelectorAll(group.selector), function (el, i) {
            el.classList.add('reveal');
            /* Turns off the CSS transition: with GSAP writing an inline
               transform every frame, the transition would try to ease to each
               of those frames as well and the move smears. */
            if (gsap) {
                el.classList.add('reveal--js');
            }
            el.dataset.delay = (i * group.stagger).toFixed(2);
            watcher.observe(el);
        });
    });

}());
