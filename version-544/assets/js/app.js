document.addEventListener("DOMContentLoaded", function () {
  initMenu();
  initHero();
  initLocalFilters();
  initGlobalSearch();
  initPlayers();
});

function initMenu() {
  var button = document.querySelector("[data-menu-button]");
  if (!button) {
    return;
  }
  button.addEventListener("click", function () {
    document.body.classList.toggle("menu-open");
  });
  document.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      document.body.classList.remove("menu-open");
    });
  });
}

function initHero() {
  var root = document.querySelector("[data-hero]");
  if (!root) {
    return;
  }
  var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
  var index = 0;
  var timer = null;

  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      show(dotIndex);
      start();
    });
  });

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  show(0);
  start();
}

function initLocalFilters() {
  document.querySelectorAll("[data-local-filter]").forEach(function (panel) {
    var target = document.querySelector(panel.getAttribute("data-local-filter"));
    if (!target) {
      return;
    }
    var keyword = panel.querySelector("[data-filter-keyword]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));

    function apply() {
      var keyValue = keyword ? keyword.value.trim().toLowerCase() : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      cards.forEach(function (card) {
        var content = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var matchKeyword = !keyValue || content.indexOf(keyValue) !== -1;
        var matchType = !typeValue || (card.getAttribute("data-type") || "").indexOf(typeValue) !== -1;
        var matchYear = !yearValue || (card.getAttribute("data-year") || "").indexOf(yearValue) !== -1;
        card.classList.toggle("hidden-by-filter", !(matchKeyword && matchType && matchYear));
      });
    }

    [keyword, type, year].forEach(function (field) {
      if (field) {
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      }
    });
  });
}

function initGlobalSearch() {
  var panel = document.querySelector("[data-global-search]");
  var results = document.querySelector("[data-search-results]");
  if (!panel || !results || !window.MOVIE_INDEX) {
    return;
  }
  var form = panel.querySelector("form");
  var input = panel.querySelector("input");

  function createCard(item) {
    return [
      '<article class="movie-card compact">',
      '<a class="movie-poster" href="./' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">',
      '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="poster-play">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
      '<h2><a href="./' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '</div>',
      '</article>'
    ].join("");
  }

  function runSearch(event) {
    if (event) {
      event.preventDefault();
    }
    var keyword = input.value.trim().toLowerCase();
    if (!keyword) {
      results.innerHTML = "";
      return;
    }
    var matched = window.MOVIE_INDEX.filter(function (item) {
      return [item.title, item.region, item.year, item.type, item.genre, item.tags, item.category].join(" ").toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 24);
    if (!matched.length) {
      results.innerHTML = '<div class="empty-state">没有找到匹配影片，换个关键词试试。</div>';
      return;
    }
    results.innerHTML = '<div class="movie-grid small-grid">' + matched.map(createCard).join("") + '</div>';
  }

  form.addEventListener("submit", runSearch);
  input.addEventListener("input", function () {
    if (input.value.trim().length >= 2) {
      runSearch();
    }
    if (!input.value.trim()) {
      results.innerHTML = "";
    }
  });
}

function initPlayers() {
  document.querySelectorAll("[data-player]").forEach(function (box) {
    var button = box.querySelector("[data-play-button]");
    var video = box.querySelector("video");
    if (!button || !video) {
      return;
    }
    var stream = button.getAttribute("data-stream");
    var hlsInstance = null;

    function bindStream() {
      if (!stream || video.getAttribute("data-ready") === "1") {
        return;
      }
      video.setAttribute("data-ready", "1");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      bindStream();
      button.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.getAttribute("data-ready") !== "1") {
        play();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
        hlsInstance.stopLoad();
      }
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
