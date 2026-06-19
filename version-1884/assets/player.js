function initMoviePlayer(src) {
  var video = document.getElementById("movie-player");
  var overlay = document.getElementById("play-overlay");
  var message = document.getElementById("player-message");
  var attached = false;
  var hls = null;

  function showMessage(text) {
    if (!message) {
      return;
    }
    message.textContent = text;
    message.classList.add("is-visible");
  }

  function attach() {
    if (attached || !video) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage("视频加载暂时异常，请稍后重试");
        }
      });
    } else {
      showMessage("当前设备暂不支持该视频播放");
    }
  }

  function start() {
    attach();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (video) {
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {});
      }
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        start();
      }
    });
  }
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
