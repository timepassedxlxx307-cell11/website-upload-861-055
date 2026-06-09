(function () {
    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.mobile-nav');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = menu.hasAttribute('hidden');
            if (open) {
                menu.removeAttribute('hidden');
                document.body.classList.add('menu-open');
            } else {
                menu.setAttribute('hidden', '');
                document.body.classList.remove('menu-open');
            }
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    function setupHeader() {
        var header = document.getElementById('siteHeader');
        if (!header) {
            return;
        }
        function sync() {
            if (window.scrollY > 12) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        }
        sync();
        window.addEventListener('scroll', sync, { passive: true });
    }

    function makeHit(movie) {
        var a = document.createElement('a');
        a.className = 'search-hit';
        a.href = movie.url;
        var img = document.createElement('img');
        img.src = movie.cover;
        img.alt = movie.title;
        img.loading = 'lazy';
        var copy = document.createElement('span');
        var strong = document.createElement('strong');
        strong.textContent = movie.title;
        var small = document.createElement('small');
        small.textContent = movie.meta;
        copy.appendChild(strong);
        copy.appendChild(small);
        a.appendChild(img);
        a.appendChild(copy);
        return a;
    }

    function setupSearch() {
        var data = window.SEARCH_MOVIES || [];
        qsa('.site-search').forEach(function (input) {
            var panel = input.parentElement.querySelector('.search-panel');
            if (!panel) {
                return;
            }
            function render() {
                var value = input.value.trim().toLowerCase();
                panel.innerHTML = '';
                if (!value) {
                    panel.setAttribute('hidden', '');
                    return;
                }
                var results = data.filter(function (movie) {
                    return movie.text.toLowerCase().indexOf(value) !== -1;
                }).slice(0, 9);
                if (!results.length) {
                    var empty = document.createElement('div');
                    empty.className = 'search-hit';
                    empty.textContent = '没有找到相关影片';
                    panel.appendChild(empty);
                } else {
                    results.forEach(function (movie) {
                        panel.appendChild(makeHit(movie));
                    });
                }
                panel.removeAttribute('hidden');
            }
            input.addEventListener('input', render);
            input.addEventListener('focus', render);
            document.addEventListener('click', function (event) {
                if (!input.parentElement.contains(event.target)) {
                    panel.setAttribute('hidden', '');
                }
            });
        });
    }

    function setupHero() {
        var slider = document.querySelector('.hero-slider');
        if (!slider) {
            return;
        }
        var slides = qsa('.hero-slide', slider);
        var dots = qsa('.hero-dot', slider);
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        start();
    }

    function setupLocalFilters() {
        var panel = document.querySelector('.filter-panel');
        if (!panel) {
            return;
        }
        var targetId = panel.getAttribute('data-filter-scope');
        var target = targetId ? document.getElementById(targetId) : document;
        var controls = qsa('.local-filter', panel);
        var cards = qsa('.movie-card', target);
        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }
        function apply() {
            var filters = {};
            controls.forEach(function (control) {
                filters[control.getAttribute('data-field')] = normalize(control.value);
            });
            cards.forEach(function (card) {
                var visible = true;
                Object.keys(filters).forEach(function (field) {
                    var needle = filters[field];
                    if (!needle) {
                        return;
                    }
                    var haystack = normalize(card.getAttribute('data-' + field));
                    if (haystack.indexOf(needle) === -1) {
                        visible = false;
                    }
                });
                card.classList.toggle('is-hidden', !visible);
            });
        }
        controls.forEach(function (control) {
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });
    }

    window.initPlayer = function (source) {
        var video = document.getElementById('moviePlayer');
        var button = document.getElementById('playBtn');
        if (!video || !button || !source) {
            return;
        }
        var hls = null;
        var ready = false;
        function prepare() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ maxBufferLength: 24 });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            prepare();
            button.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }
        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!ready || video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            button.classList.remove('is-hidden');
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupHeader();
        setupMenu();
        setupSearch();
        setupHero();
        setupLocalFilters();
    });
}());
