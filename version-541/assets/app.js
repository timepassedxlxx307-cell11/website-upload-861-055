(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initMenu();
        initHero();
        initFilter();
        initPlayers();
    });

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".site-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function initFilter() {
        var input = document.querySelector("[data-filter-input]");
        var region = document.querySelector("[data-filter-region]");
        var year = document.querySelector("[data-filter-year]");
        var items = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
        if (!input || !items.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (initial) {
            input.value = initial;
        }
        function valueOf(el) {
            return el ? String(el.value || "").trim().toLowerCase() : "";
        }
        function apply() {
            var q = valueOf(input);
            var selectedRegion = valueOf(region);
            var selectedYear = valueOf(year);
            items.forEach(function (item) {
                var haystack = [
                    item.getAttribute("data-title"),
                    item.getAttribute("data-region"),
                    item.getAttribute("data-year"),
                    item.getAttribute("data-genre")
                ].join(" ").toLowerCase();
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (selectedRegion && String(item.getAttribute("data-region") || "").toLowerCase().indexOf(selectedRegion) === -1) {
                    ok = false;
                }
                if (selectedYear && String(item.getAttribute("data-year") || "").toLowerCase() !== selectedYear) {
                    ok = false;
                }
                item.classList.toggle("hidden-by-filter", !ok);
            });
        }
        input.addEventListener("input", apply);
        if (region) {
            region.addEventListener("change", apply);
        }
        if (year) {
            year.addEventListener("change", apply);
        }
        apply();
    }

    function initPlayers() {
        var blocks = Array.prototype.slice.call(document.querySelectorAll(".player-block"));
        blocks.forEach(function (block) {
            var video = block.querySelector("video");
            var mask = block.querySelector(".player-mask");
            var trigger = block.querySelector(".play-trigger");
            var url = block.getAttribute("data-play-url");
            var loaded = false;
            var hls = null;
            if (!video || !url) {
                return;
            }
            function bind() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }
            }
            function start() {
                bind();
                if (mask) {
                    mask.classList.add("is-hidden");
                }
                video.setAttribute("controls", "controls");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }
            if (trigger) {
                trigger.addEventListener("click", start);
            }
            if (mask) {
                mask.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (!loaded) {
                    start();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }
}());
