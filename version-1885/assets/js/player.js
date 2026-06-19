(function () {
  var configElement = document.getElementById('movieConfig');
  var video = document.getElementById('movieVideo');
  var overlay = document.getElementById('playerOverlay');

  if (!configElement || !video || !overlay) {
    return;
  }

  var config = JSON.parse(configElement.textContent || '{}');
  var stream = config.stream || '';
  var poster = config.poster || '';
  var attached = false;
  var hlsInstance = null;

  if (poster) {
    video.setAttribute('poster', poster);
  }

  function attachStream() {
    if (attached || !stream) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = stream;
  }

  function playMovie() {
    attachStream();
    overlay.classList.add('is-hidden');
    var playTask = video.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', playMovie);

  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
