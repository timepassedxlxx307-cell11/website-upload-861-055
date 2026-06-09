(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle("active", itemIndex === activeSlide);
        });
        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle("active", itemIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var searchInput = document.querySelector("[data-search-input]");
    var categorySelect = document.querySelector("[data-category-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var resultCount = document.querySelector("[data-result-count]");

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var keyword = normalize(searchInput ? searchInput.value : "");
        var category = categorySelect ? categorySelect.value : "";
        var shown = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-category"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region")
            ].join(" "));
            var categoryMatched = !category || card.getAttribute("data-category") === category;
            var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
            var visible = categoryMatched && keywordMatched;

            card.classList.toggle("hidden-card", !visible);
            if (visible) {
                shown += 1;
            }
        });

        if (resultCount) {
            resultCount.textContent = String(shown);
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterCards);
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", filterCards);
    }

    filterCards();
})();

function startMoviePlayer(videoUrl) {
    var video = document.getElementById("movie-player");
    var layer = document.getElementById("play-layer");

    if (!video || !videoUrl) {
        return;
    }

    var prepared = false;

    function prepare() {
        if (prepared) {
            return;
        }

        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
        } else {
            video.src = videoUrl;
        }
    }

    function play() {
        prepare();

        if (layer) {
            layer.classList.add("hidden");
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (layer) {
        layer.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        } else {
            video.pause();
        }
    });

    video.addEventListener("play", function () {
        if (layer) {
            layer.classList.add("hidden");
        }
    });
}
