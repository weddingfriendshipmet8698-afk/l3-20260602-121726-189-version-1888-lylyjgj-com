(function () {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  if (slides.length > 1) {
    var active = 0;
    var show = function (index) {
      active = index;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === active);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    setInterval(function () {
      show((active + 1) % slides.length);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));
  searchInputs.forEach(function (input) {
    var scope = document.querySelector(input.getAttribute("data-card-search"));
    if (!scope) {
      return;
    }
    var select = document.querySelector(input.getAttribute("data-year-select") || "");
    var empty = document.querySelector(input.getAttribute("data-empty") || "");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
    var update = function () {
      var q = input.value.trim().toLowerCase();
      var year = select ? select.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var keys = (card.getAttribute("data-keywords") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var match = (!q || keys.indexOf(q) !== -1) && (!year || cardYear === year);
        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };
    input.addEventListener("input", update);
    if (select) {
      select.addEventListener("change", update);
    }
  });
})();
