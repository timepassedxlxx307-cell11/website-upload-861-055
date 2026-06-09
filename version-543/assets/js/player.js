function initMoviePlayer(source) {
  const video = document.getElementById("moviePlayer");
  const gate = document.getElementById("playGate");
  let hls = null;
  let loaded = false;
  let waitingForManifest = false;

  if (!video || !gate || !source) {
    return;
  }

  function hideGate() {
    gate.classList.add("is-hidden");
  }

  function loadSource(onReady) {
    if (loaded) {
      onReady();
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.load();
      onReady();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      waitingForManifest = true;
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        waitingForManifest = false;
        onReady();
      });
      hls.on(window.Hls.Events.ERROR, function () {
        if (waitingForManifest) {
          video.src = source;
          video.load();
          waitingForManifest = false;
          onReady();
        }
      });
      return;
    }

    video.src = source;
    video.load();
    onReady();
  }

  function playMovie() {
    hideGate();
    loadSource(function () {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          gate.classList.remove("is-hidden");
        });
      }
    });
  }

  gate.addEventListener("click", playMovie);

  video.addEventListener("click", function () {
    if (video.paused) {
      playMovie();
    }
  });

  video.addEventListener("play", hideGate);

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
