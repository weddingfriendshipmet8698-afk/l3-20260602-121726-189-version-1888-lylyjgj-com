(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".js-menu-button");
    var panel = document.querySelector(".js-mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupGlobalSearch() {
    document.querySelectorAll(".js-global-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var target = form.getAttribute("data-target") || "movies.html";
        var value = input ? input.value.trim() : "";
        if (value) {
          window.location.href = target + "?q=" + encodeURIComponent(value);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function setupFilters() {
    var scope = document.querySelector(".js-filter-scope");
    if (!scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".js-movie-card"));
    var searchInput = scope.querySelector(".js-page-search");
    var categorySelect = scope.querySelector(".js-category-filter");
    var yearSelect = scope.querySelector(".js-year-filter");
    var resetButton = scope.querySelector(".js-filter-reset");
    var countNode = scope.querySelector(".js-result-count");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (searchInput && query) {
      searchInput.value = query;
    }

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function applyFilters() {
      var search = normalize(searchInput ? searchInput.value.trim() : "");
      var category = categorySelect ? categorySelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" "));
        var cardCategory = card.getAttribute("data-category") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matched = true;

        if (search && haystack.indexOf(search) === -1) {
          matched = false;
        }
        if (category && cardCategory !== category) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visible);
      }
    }

    [searchInput, categorySelect, yearSelect].forEach(function (node) {
      if (node) {
        node.addEventListener("input", applyFilters);
        node.addEventListener("change", applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        if (searchInput) {
          searchInput.value = "";
        }
        if (categorySelect) {
          categorySelect.value = "";
        }
        if (yearSelect) {
          yearSelect.value = "";
        }
        applyFilters();
      });
    }

    applyFilters();
  }

  window.setupVideoPlayer = function (source, playerId) {
    var player = document.getElementById(playerId);
    if (!player || !source) {
      return;
    }
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var initialized = false;
    var hls = null;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function playVideo() {
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    function attachSource() {
      if (initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        return;
      }
      video.src = source;
      video.load();
      playVideo();
    }

    function start() {
      hideOverlay();
      attachSource();
      if (initialized) {
        playVideo();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!initialized) {
        start();
      }
    });
    video.addEventListener("play", hideOverlay);
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMobileMenu();
    setupGlobalSearch();
    setupFilters();
  });
})();
