function initMoviePlayer(streamUrl) {
  var video = document.getElementById('moviePlayer');
  var startButton = document.getElementById('playerStart');
  if (!video || !startButton || !streamUrl) {
    return;
  }
  var attached = false;
  var hls = null;
  var attachStream = function () {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  };
  var playVideo = function () {
    attachStream();
    startButton.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        startButton.classList.remove('is-hidden');
      });
    }
  };
  startButton.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (!attached || video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });
  video.addEventListener('playing', function () {
    startButton.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      startButton.classList.remove('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
