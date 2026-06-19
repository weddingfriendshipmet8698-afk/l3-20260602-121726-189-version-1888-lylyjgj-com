function initMenu() {
  var button = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', function () {
    nav.classList.toggle('open');
  });
}

function initHero() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (!slides.length) {
    return;
  }
  var active = 0;
  function show(index) {
    active = index;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === active);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === active);
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      show(index);
    });
  });
  window.setInterval(function () {
    show((active + 1) % slides.length);
  }, 5200);
}

function setupFilter() {
  var panel = document.querySelector('[data-filter-panel]');
  if (!panel) {
    return;
  }
  var input = panel.querySelector('[data-search-input]');
  var category = panel.querySelector('[data-category-select]');
  var year = panel.querySelector('[data-year-select]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  function matchYear(cardYear, chosen) {
    var y = parseInt(cardYear || '0', 10);
    if (!chosen) {
      return true;
    }
    if (chosen === 'older') {
      return y < 2000;
    }
    if (chosen === '2010') {
      return y >= 2010 && y <= 2019;
    }
    if (chosen === '2000') {
      return y >= 2000 && y <= 2009;
    }
    return String(y) === chosen;
  }
  function filter() {
    var q = (input && input.value ? input.value : '').trim().toLowerCase();
    var c = category && category.value ? category.value : '';
    var y = year && year.value ? year.value : '';
    cards.forEach(function (card) {
      var haystack = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.category].join(' ').toLowerCase();
      var okText = !q || haystack.indexOf(q) !== -1;
      var okCategory = !c || card.dataset.category === c;
      var okYear = matchYear(card.dataset.year, y);
      card.classList.toggle('is-hidden', !(okText && okCategory && okYear));
    });
  }
  if (input) {
    input.addEventListener('input', filter);
  }
  if (category) {
    category.addEventListener('change', filter);
  }
  if (year) {
    year.addEventListener('change', filter);
  }
  filter();
}

function loadQueryToSearch() {
  var input = document.querySelector('[data-search-input]');
  if (!input) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q) {
    input.value = q;
    setupFilter();
  }
}

function initStaticPlayer(videoId, buttonId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  if (!video || !button || !source) {
    return;
  }
  var ready = false;
  var hlsInstance = null;
  function attach() {
    if (ready) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
    ready = true;
  }
  function play() {
    attach();
    button.classList.add('is-hidden');
    video.controls = true;
    var request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(function () {});
    }
  }
  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      play();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
