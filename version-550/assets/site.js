(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initMobileNav() {
        var button = $(".mobile-menu-button");
        var nav = $(".mobile-nav");
        if (!button || !nav) {
            return;
        }

        button.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("open");
            button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function initFilters() {
        var form = $("[data-filter-form]");
        if (!form) {
            return;
        }

        var cards = $all(".movie-card");
        var countNode = $("[data-result-count]");
        var controls = $all("input, select", form);

        function readValue(selector) {
            var node = $(selector, form);
            return normalize(node ? node.value : "");
        }

        function matches(card, query, category, type, region, year) {
            var haystack = normalize([
                card.dataset.title,
                card.dataset.category,
                card.dataset.type,
                card.dataset.region,
                card.dataset.year,
                card.dataset.keywords,
                card.textContent
            ].join(" "));

            if (query && haystack.indexOf(query) === -1) {
                return false;
            }
            if (category && normalize(card.dataset.category) !== category) {
                return false;
            }
            if (type && normalize(card.dataset.type).indexOf(type) === -1) {
                return false;
            }
            if (region && normalize(card.dataset.region).indexOf(region) === -1) {
                return false;
            }
            if (year && normalize(card.dataset.year).indexOf(year) === -1) {
                return false;
            }
            return true;
        }

        function update() {
            var query = readValue(".js-search");
            var category = readValue(".js-category");
            var type = readValue(".js-type");
            var region = readValue(".js-region");
            var year = readValue(".js-year");
            var visible = 0;

            cards.forEach(function (card) {
                var ok = matches(card, query, category, type, region, year);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = String(visible);
            }
        }

        controls.forEach(function (control) {
            control.addEventListener("input", update);
            control.addEventListener("change", update);
        });

        form.addEventListener("reset", function () {
            window.setTimeout(update, 0);
        });

        update();
    }

    function initPlayers() {
        $all(".js-player").forEach(function (shell) {
            var video = $("video", shell);
            var button = $(".player-overlay", shell);
            var hlsInstance = null;

            if (!video || !button) {
                return;
            }

            function attachSource() {
                var source = video.dataset.src;
                if (!source || video.dataset.ready === "true") {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }

                video.dataset.ready = "true";
            }

            button.addEventListener("click", function () {
                attachSource();
                shell.classList.add("is-playing");
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        shell.classList.remove("is-playing");
                    });
                }
            });

            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });

            video.addEventListener("error", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileNav();
        initFilters();
        initPlayers();
    });
})();
