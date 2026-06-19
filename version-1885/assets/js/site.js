(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (menuButton && panel) {
    menuButton.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
  }

  var filterInput = document.querySelector('.filter-input');
  var filterYear = document.querySelector('.filter-year');
  var filterType = document.querySelector('.filter-type');
  var clearFilter = document.querySelector('.clear-filter');
  var items = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && filterInput && !filterInput.value) {
      filterInput.value = q;
    }
  }

  function applyFilter() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterYear ? filterYear.value : '';
    var type = filterType ? filterType.value : '';

    items.forEach(function (item) {
      var search = (item.getAttribute('data-search') || '').toLowerCase();
      var itemYear = item.getAttribute('data-year') || '';
      var itemType = item.getAttribute('data-type') || '';
      var matchedKeyword = !keyword || search.indexOf(keyword) !== -1;
      var matchedYear = !year || itemYear === year;
      var matchedType = !type || itemType === type;
      item.classList.toggle('is-filter-hidden', !(matchedKeyword && matchedYear && matchedType));
    });
  }

  readQuery();

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }
  if (filterYear) {
    filterYear.addEventListener('change', applyFilter);
  }
  if (filterType) {
    filterType.addEventListener('change', applyFilter);
  }
  if (clearFilter) {
    clearFilter.addEventListener('click', function () {
      if (filterInput) {
        filterInput.value = '';
      }
      if (filterYear) {
        filterYear.value = '';
      }
      if (filterType) {
        filterType.value = '';
      }
      applyFilter();
    });
  }

  applyFilter();
})();
