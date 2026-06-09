(function () {
  var header = document.querySelector('[data-site-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  function onScroll() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('active');
      document.body.classList.toggle('menu-open', mobilePanel.classList.contains('active'));
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function renderSearch(input, panel) {
    var keyword = normalize(input.value);
    var list = window.SITE_MOVIES || [];
    if (!keyword) {
      panel.classList.remove('active');
      panel.innerHTML = '';
      return;
    }
    var matches = list.filter(function (item) {
      return normalize(item.text).indexOf(keyword) !== -1;
    }).slice(0, 8);
    if (!matches.length) {
      panel.classList.add('active');
      panel.innerHTML = '<a href="categories.html"><strong>查看全部分类</strong><span>换个关键词继续浏览高清大片合集</span></a>';
      return;
    }
    panel.classList.add('active');
    panel.innerHTML = matches.map(function (item) {
      return '<a href="' + item.href + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.desc) + '</span></a>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.querySelectorAll('[data-site-search]').forEach(function (input) {
    var wrapper = input.closest('.header-search, .mobile-search');
    var panel = wrapper ? wrapper.querySelector('[data-search-panel]') : null;
    if (!panel) {
      return;
    }
    input.addEventListener('input', function () {
      renderSearch(input, panel);
    });
    input.addEventListener('focus', function () {
      renderSearch(input, panel);
    });
    input.addEventListener('blur', function () {
      window.setTimeout(function () {
        panel.classList.remove('active');
      }, 160);
    });
  });

  document.querySelectorAll('[data-filter-input]').forEach(function (input) {
    var section = input.closest('section') || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]'));
    input.addEventListener('input', function () {
      var keyword = normalize(input.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
      });
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      startHero();
    });
  });

  startHero();
})();

function initMoviePlayer(streamUrl) {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-play-overlay]');
  var hlsInstance = null;
  var loaded = false;

  if (!video || !streamUrl) {
    return;
  }

  function loadStream() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    video.setAttribute('controls', 'controls');
  }

  function startPlayback() {
    loadStream();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (!loaded) {
      startPlayback();
      return;
    }
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
