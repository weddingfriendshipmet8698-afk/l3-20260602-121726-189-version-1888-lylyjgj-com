(function () {
  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function $all(selector, parent) {
    return Array.prototype.slice.call(
      (parent || document).querySelectorAll(selector),
    );
  }

  function initMobileMenu() {
    var button = $("[data-menu-toggle]");
    var nav = $("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      button.textContent = nav.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    var hero = $("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = $all("[data-hero-slide]", hero);
    var dots = $all("[data-hero-dot]", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = $("[data-filter-panel]");

    if (!panel) {
      return;
    }

    var keywordInput = $("[data-filter-keyword]", panel);
    var categorySelect = $("[data-filter-category]", panel);
    var yearSelect = $("[data-filter-year]", panel);
    var empty = $("[data-empty-result]", panel);
    var cards = $all("[data-movie-card]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (keywordInput && initialQuery) {
      keywordInput.value = initialQuery;
    }

    function includes(value, needle) {
      return (
        String(value || "")
          .toLowerCase()
          .indexOf(needle) !== -1
      );
    }

    function yearMatches(cardYear, selectedYear) {
      if (!selectedYear) {
        return true;
      }

      var parsed = parseInt(cardYear, 10);

      if (selectedYear === "older") {
        return parsed && parsed < 2020;
      }

      return String(cardYear) === selectedYear;
    }

    function applyFilters() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      var category = categorySelect ? categorySelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.category,
        ]
          .join(" ")
          .toLowerCase();
        var matched = true;

        if (keyword && !includes(haystack, keyword)) {
          matched = false;
        }

        if (category && card.dataset.category !== category) {
          matched = false;
        }

        if (!yearMatches(card.dataset.year, year)) {
          matched = false;
        }

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keywordInput, categorySelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }

  window.initMoviePlayer = function (streamUrl) {
    var player = $("[data-player]");

    if (!player) {
      return;
    }

    var video = $("video", player);
    var overlay = $(".player-overlay", player);
    var triggers = $all("[data-play-trigger]", player);
    var hls = null;
    var ready = false;

    function prepare() {
      if (ready || !video) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
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

      video.src = streamUrl;
    }

    function start() {
      prepare();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var playRequest = video.play();

      if (playRequest && playRequest.catch) {
        playRequest.catch(function () {});
      }
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", start);
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHero();
    initFilters();
  });
})();
