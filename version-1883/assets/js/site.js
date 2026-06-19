(function () {
    var mobileToggle = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        var showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5200);
        }
    }

    document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-card-search]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
        var empty = scope.querySelector('[data-empty-state]');
        var activeFilter = 'all';

        var applyFilters = function () {
            var query = input ? input.value.trim().toLowerCase() : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var filter = (card.getAttribute('data-filter') || '').toLowerCase();
                var queryMatch = !query || text.indexOf(query) !== -1;
                var filterMatch = activeFilter === 'all' || filter.indexOf(activeFilter) !== -1;
                var visible = queryMatch && filterMatch;

                card.style.display = visible ? '' : 'none';
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visibleCount === 0);
            }
        };

        if (input) {
            input.addEventListener('input', applyFilters);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeFilter = (chip.getAttribute('data-filter-value') || 'all').toLowerCase();
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                applyFilters();
            });
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var trigger = player.querySelector('[data-play-trigger]');
        var stream = video ? video.getAttribute('data-stream') : '';
        var ready = false;
        var hlsInstance = null;

        var prepare = function () {
            if (!video || !stream || ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }

            ready = true;
        };

        var start = function () {
            prepare();
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
            if (video) {
                var playTask = video.play();
                if (playTask && playTask.catch) {
                    playTask.catch(function () {});
                }
            }
        };

        if (trigger) {
            trigger.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                if (trigger) {
                    trigger.classList.add('is-hidden');
                }
            });
            video.addEventListener('error', function () {
                if (hlsInstance && hlsInstance.destroy) {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();
