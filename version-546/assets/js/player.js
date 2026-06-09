(function () {
  var shell = document.querySelector('.player-shell');
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-play-button]');
  var status = document.querySelector('[data-player-status]');
  var hlsInstance = null;

  if (!shell || !video || !button) {
    return;
  }

  function setStatus(text) {
    if (status) {
      status.textContent = text;
    }
  }

  function start() {
    var url = button.getAttribute('data-stream') || video.getAttribute('data-stream');
    if (!url) {
      setStatus('播放源暂不可用');
      return;
    }

    shell.classList.add('is-playing');
    setStatus('正在准备播放');

    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }

    if (window.Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      hlsInstance.on(Hls.Events.ERROR, function () {
        setStatus('播放连接中');
      });
    } else {
      video.src = url;
      playVideo();
    }
  }

  function playVideo() {
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.then(function () {
        setStatus('正在播放');
      }).catch(function () {
        setStatus('点击视频继续播放');
      });
    } else {
      setStatus('正在播放');
    }
  }

  button.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      if (video.src || hlsInstance) {
        playVideo();
      } else {
        start();
      }
    } else {
      video.pause();
    }
  });
})();
