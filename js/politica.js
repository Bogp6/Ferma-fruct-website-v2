/* Politica de confidențialitate: evidențiază în cuprins secțiunea în care se
   află cititorul.

   Fără scriptul acesta pagina e întreagă — cuprinsul rămâne o listă de
   legături obișnuită. Nimic de aici nu mută și nu ascunde conținut. */
(function () {
    'use strict';

    var links = Array.prototype.slice.call(
        document.querySelectorAll('.privacy__toc-link')
    );

    if (!links.length || !('IntersectionObserver' in window)) {
        return;
    }

    /* Perechea legătură-secțiune se citește o dată din DOM. O legătură al
       cărei #id nu există în pagină este aruncată aici, nu la fiecare cadru.

       ID-urile stau pe <h2>, nu pe <section> (secțiunea le folosește prin
       aria-labelledby). Se urcă deci la .privacy__section: urmărit direct,
       titlul e o fâșie de ~37px care abia atinge banda de observare, așa că
       de cele mai multe ori nu era marcat nimic. */
    var pairs = links.reduce(function (list, link) {
        var target = document.getElementById(
            decodeURIComponent(link.getAttribute('href').slice(1))
        );
        var section = target && target.closest('.privacy__section');

        if (section) {
            list.push({ item: link.closest('.privacy__toc-item'), section: section });
        }

        return list;
    }, []);

    if (!pairs.length) {
        return;
    }

    var visible = [];

    var mark = function () {
        /* Cea mai de sus secțiune vizibilă câștigă. Cu mai multe pe ecran
           deodată, „ultima intrată" ar sări înapoi la derulare în sus. */
        var current = null;

        pairs.forEach(function (pair) {
            if (visible.indexOf(pair.section) === -1) {
                return;
            }

            if (!current || pair.section.offsetTop < current.section.offsetTop) {
                current = pair;
            }
        });

        pairs.forEach(function (pair) {
            pair.item.classList.toggle('is-current', pair === current);
        });
    };

    /* Banda de observare începe sub antetul fix și se oprește pe la jumătatea
       ecranului: secțiunea marcată e cea pe care o citește, nu cea care abia
       a intrat cu un rând în josul ferestrei. Se schimbă înălțimea antetului,
       se schimbă și -25% de aici. */
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            var at = visible.indexOf(entry.target);

            if (entry.isIntersecting && at === -1) {
                visible.push(entry.target);
            } else if (!entry.isIntersecting && at !== -1) {
                visible.splice(at, 1);
            }
        });

        mark();
    }, { rootMargin: '-25% 0px -55% 0px' });

    pairs.forEach(function (pair) {
        observer.observe(pair.section);
    });
}());
