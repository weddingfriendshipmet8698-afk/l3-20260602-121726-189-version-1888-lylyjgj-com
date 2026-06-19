(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var toggle = $('[data-menu-toggle]');
        var nav = $('[data-main-nav]');

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = $('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = $all('[data-hero-slide]', hero);
        var dots = $all('[data-hero-dot]', hero);
        var index = 0;

        if (slides.length <= 1) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function yearMatches(year, filter) {
        if (!filter) {
            return true;
        }

        if (filter === '2025') {
            return year === 2025;
        }

        if (filter === '2024') {
            return year === 2024;
        }

        if (filter === '2020s') {
            return year >= 2020 && year <= 2029;
        }

        if (filter === '2010s') {
            return year >= 2010 && year <= 2019;
        }

        if (filter === 'older') {
            return year < 2010;
        }

        return true;
    }

    function setupFilters() {
        var panel = $('[data-filter-panel]');
        var grid = $('[data-card-grid]');

        if (!panel || !grid) {
            return;
        }

        var input = $('[data-filter-input]', panel);
        var yearFilter = $('[data-year-filter]', panel);
        var typeFilter = $('[data-type-filter]', panel);
        var categoryFilter = $('[data-category-filter]', panel);
        var sortSelect = $('[data-sort-select]', panel);
        var count = $('[data-result-count]', panel);
        var cards = $all('[data-movie-card]', grid);

        function cardText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-category'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.textContent
            ].join(' ').toLowerCase();
        }

        function applyFilters() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = yearFilter ? yearFilter.value : '';
            var typeValue = typeFilter ? typeFilter.value : '';
            var categoryValue = categoryFilter ? categoryFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var year = Number(card.getAttribute('data-year')) || 0;
                var type = card.getAttribute('data-type') || '';
                var category = card.getAttribute('data-category') || '';
                var match = true;

                if (keyword && cardText(card).indexOf(keyword) === -1) {
                    match = false;
                }

                if (!yearMatches(year, yearValue)) {
                    match = false;
                }

                if (typeValue && type.indexOf(typeValue) === -1) {
                    match = false;
                }

                if (categoryValue && category !== categoryValue) {
                    match = false;
                }

                card.style.display = match ? '' : 'none';

                if (match) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        function applySort() {
            var mode = sortSelect ? sortSelect.value : 'rank';
            var sorted = cards.slice().sort(function (a, b) {
                if (mode === 'year') {
                    return (Number(b.getAttribute('data-year')) || 0) - (Number(a.getAttribute('data-year')) || 0);
                }

                if (mode === 'title') {
                    return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                }

                return (Number(a.getAttribute('data-rank')) || 0) - (Number(b.getAttribute('data-rank')) || 0);
            });

            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        [input, yearFilter, typeFilter, categoryFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                applySort();
                applyFilters();
            });
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q && input) {
            input.value = q;
        }

        applySort();
        applyFilters();
    }

    function setupPlayer() {
        var button = $('[data-player-start]');
        var message = $('[data-player-message]');

        if (!button) {
            return;
        }

        var hlsInstance = null;

        function setMessage(text) {
            if (message) {
                message.textContent = text;
            }
        }

        function loadVideo(video) {
            var src = video.getAttribute('data-src');

            if (!src) {
                setMessage('未找到视频源。');
                return;
            }

            if (video.dataset.ready === '1') {
                video.play().catch(function () {
                    setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
                });
                return;
            }

            setMessage('正在加载视频源...');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                video.dataset.ready = '1';
                video.addEventListener('loadedmetadata', function () {
                    setMessage('视频已就绪。');
                    video.play().catch(function () {
                        setMessage('视频已就绪，请点击播放器播放。');
                    });
                }, { once: true });
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }

                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.dataset.ready = '1';
                    setMessage('视频已就绪。');
                    video.play().catch(function () {
                        setMessage('视频已就绪，请点击播放器播放。');
                    });
                });

                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage('视频加载失败，请刷新页面或稍后重试。');
                    }
                });
                return;
            }

            setMessage('当前浏览器不支持 HLS 播放，请更换浏览器。');
        }

        button.addEventListener('click', function () {
            var target = button.getAttribute('data-target') || '#main-player';
            var video = $(target);

            if (video) {
                loadVideo(video);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayer();
    });
}());
