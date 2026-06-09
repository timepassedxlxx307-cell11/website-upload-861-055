(function () {
  const body = document.body;
  const base = body ? body.getAttribute("data-base") || "./" : "./";
  const toggle = document.querySelector(".nav-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (toggle && mobilePanel) {
    toggle.addEventListener("click", function () {
      const open = mobilePanel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("image-hidden");
    });
  });

  document.querySelectorAll("[data-site-search]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const input = form.querySelector("input[name='q']");
      const query = input ? input.value.trim() : "";
      const target = base + "search.html" + (query ? "?q=" + encodeURIComponent(query) : "");
      window.location.href = target;
    });
  });

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let activeIndex = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 6200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      const index = Number(dot.getAttribute("data-hero-dot"));
      showSlide(index);
      if (timer) {
        window.clearInterval(timer);
        startHero();
      }
    });
  });

  startHero();

  const searchInput = document.getElementById("pageSearch");
  const yearFilter = document.getElementById("yearFilter");
  const typeFilter = document.getElementById("typeFilter");
  const catalog = document.querySelector("[data-catalog]");
  const emptyState = document.querySelector("[data-empty-state]");

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function applyFilters() {
    if (!catalog) {
      return;
    }
    const cards = Array.from(catalog.children);
    const query = normalize(searchInput ? searchInput.value : "");
    const year = yearFilter ? yearFilter.value : "";
    const type = typeFilter ? typeFilter.value : "";
    let visible = 0;

    cards.forEach(function (card) {
      const blob = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type"),
        card.getAttribute("data-region"),
        card.getAttribute("data-tags")
      ].join(" "));
      const yearOk = !year || card.getAttribute("data-year") === year;
      const typeOk = !type || card.getAttribute("data-type") === type;
      const queryOk = !query || blob.indexOf(query) !== -1;
      const match = yearOk && typeOk && queryOk;
      card.style.display = match ? "" : "none";
      if (match) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  if (searchInput || yearFilter || typeFilter) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    if (searchInput && query) {
      searchInput.value = query;
    }
    [searchInput, yearFilter, typeFilter].forEach(function (element) {
      if (element) {
        element.addEventListener("input", applyFilters);
        element.addEventListener("change", applyFilters);
      }
    });
    applyFilters();
  }
})();
