(function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobile = document.querySelector('.mobile-nav');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      var isHidden = mobile.hasAttribute('hidden');
      if (isHidden) {
        mobile.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        mobile.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var active = 0;
    var timer = null;
    var show = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };
    var start = function () {
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        clearInterval(timer);
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });
    if (slides.length > 1) {
      start();
    }
  }

  var filterInput = document.querySelector('[data-page-filter]');
  var filterGrid = document.querySelector('[data-filter-grid]');
  if (filterInput && filterGrid) {
    var items = Array.prototype.slice.call(filterGrid.children);
    filterInput.addEventListener('input', function () {
      var query = filterInput.value.trim().toLowerCase();
      items.forEach(function (item) {
        var text = (item.textContent + ' ' + Array.prototype.slice.call(item.attributes).map(function (attr) { return attr.value; }).join(' ')).toLowerCase();
        item.hidden = query && text.indexOf(query) === -1;
      });
    });
  }

  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchDefault = document.querySelector('[data-search-default]');
  var searchForm = document.querySelector('[data-search-form]');
  var renderSearch = function (query) {
    if (!searchResults || typeof movieCatalog === 'undefined') {
      return;
    }
    var value = (query || '').trim().toLowerCase();
    searchResults.innerHTML = '';
    if (!value) {
      if (searchDefault) {
        searchDefault.hidden = false;
      }
      return;
    }
    if (searchDefault) {
      searchDefault.hidden = true;
    }
    var matches = movieCatalog.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.category].join(' ').toLowerCase();
      return text.indexOf(value) !== -1;
    }).slice(0, 80);
    if (!matches.length) {
      searchResults.innerHTML = '<div class="search-empty">没有找到匹配影片，可以尝试更换关键词。</div>';
      return;
    }
    searchResults.innerHTML = matches.map(function (movie) {
      return '<article class="search-result-card"><a href="' + movie.url + '"><img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span><strong>' + escapeHtml(movie.title) + '</strong><em>' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.year) + '</em></span></a></article>';
    }).join('');
  };
  var escapeHtml = function (value) {
    return String(value).replace(/[&<>"]/g, function (item) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[item];
    });
  };
  if (searchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;
    renderSearch(initial);
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        renderSearch(searchInput.value);
      });
    }
  }
}());
