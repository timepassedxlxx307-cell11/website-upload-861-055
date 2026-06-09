(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function rootPath() {
    return document.body.getAttribute('data-root') || './';
  }

  function setMobileMenu() {
    var button = qs('.menu-toggle');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function setHero() {
    var hero = qs('.hero');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function autoplay() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        autoplay();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        autoplay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        autoplay();
      });
    }

    show(0);
    autoplay();
  }

  function setGlobalSearch() {
    if (!Array.isArray(window.MOVIE_INDEX) && typeof MOVIE_INDEX === 'undefined') {
      return;
    }
    var data = window.MOVIE_INDEX || MOVIE_INDEX;
    qsa('.global-search-input').forEach(function (input) {
      var box = input.parentElement.querySelector('.search-results');
      if (!box) {
        return;
      }

      function render() {
        var value = input.value.trim().toLowerCase();
        box.innerHTML = '';
        if (!value) {
          box.classList.remove('open');
          return;
        }
        var results = data.filter(function (item) {
          var text = [item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(' ')].join(' ').toLowerCase();
          return text.indexOf(value) !== -1;
        }).slice(0, 9);
        results.forEach(function (item) {
          var link = document.createElement('a');
          link.href = rootPath() + item.path;
          link.innerHTML = '<img src="' + rootPath() + item.cover + '" alt=""><span><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</small></span>';
          box.appendChild(link);
        });
        if (results.length === 0) {
          var empty = document.createElement('div');
          empty.className = 'search-empty';
          empty.textContent = '未找到匹配内容';
          box.appendChild(empty);
        }
        box.classList.add('open');
      }

      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          var first = box.querySelector('a');
          if (first) {
            window.location.href = first.href;
          }
        }
      });
      document.addEventListener('click', function (event) {
        if (!input.parentElement.contains(event.target)) {
          box.classList.remove('open');
        }
      });
    });
  }

  function setLocalFilter() {
    var input = qs('[data-local-search]');
    var select = qs('[data-local-select]');
    var chips = qsa('[data-filter-chip]');
    var cards = qsa('[data-filter-text]');
    var empty = qs('.empty-state');
    var activeChip = 'all';

    if (!cards.length) {
      return;
    }

    function apply() {
      var value = input ? input.value.trim().toLowerCase() : '';
      var selectValue = select ? select.value : 'all';
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        var okText = !value || text.indexOf(value) !== -1;
        var okSelect = selectValue === 'all' || text.indexOf(selectValue.toLowerCase()) !== -1;
        var okChip = activeChip === 'all' || text.indexOf(activeChip.toLowerCase()) !== -1;
        var show = okText && okSelect && okChip;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (select) {
      select.addEventListener('change', apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeChip = chip.getAttribute('data-filter-chip') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        apply();
      });
    });
    apply();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  setMobileMenu();
  setHero();
  setGlobalSearch();
  setLocalFilter();
})();
