(function () {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function initBackground() {
        const canvas = document.querySelector(".drawn-bg-canvas");
        if (!canvas || prefersReducedMotion) return;
        const ctx = canvas.getContext("2d");
        let width = 0;
        let height = 0;
        let points = [];
        let meteors = [];
        let nextMeteorAt = 0;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            const count = Math.min(width < 700 ? 34 : 64, Math.floor(width * height / 18000));
            points = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.18,
                vy: (Math.random() - 0.5) * 0.18,
                r: Math.random() * 1.4 + 0.6,
                a: Math.random() * 0.35 + 0.2
            }));
            meteors = [];
        }

        function spawnMeteor(now) {
            const compact = width < 700;
            meteors.push({
                x: width * (0.35 + Math.random() * 0.8),
                y: -30 - Math.random() * height * 0.2,
                vx: -(compact ? 9 : 11.5) - Math.random() * 4.5,
                vy: (compact ? 5.8 : 7.5) + Math.random() * 3.5,
                length: (compact ? 52 : 75) + Math.random() * 65,
                width: 0.8 + Math.random() * 1.1,
                alpha: 0.48 + Math.random() * 0.34
            });
            nextMeteorAt = now + 650 + Math.random() * 1000;
        }

        function drawMeteors(now, dark) {
            if (now >= nextMeteorAt && meteors.length < (width < 700 ? 3 : 5)) spawnMeteor(now);

            meteors.forEach((meteor) => {
                meteor.x += meteor.vx;
                meteor.y += meteor.vy;
                const speed = Math.hypot(meteor.vx, meteor.vy);
                const tailX = meteor.x - (meteor.vx / speed) * meteor.length;
                const tailY = meteor.y - (meteor.vy / speed) * meteor.length;
                const color = dark ? "176, 218, 255" : "91, 98, 178";
                const glow = dark ? "220, 242, 255" : "139, 111, 203";
                const gradient = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
                gradient.addColorStop(0, `rgba(${color}, 0)`);
                gradient.addColorStop(0.72, `rgba(${color}, ${meteor.alpha * 0.58})`);
                gradient.addColorStop(1, `rgba(${glow}, ${meteor.alpha})`);

                ctx.save();
                ctx.strokeStyle = gradient;
                ctx.lineCap = "round";
                ctx.lineWidth = meteor.width;
                ctx.shadowBlur = dark ? 9 : 5;
                ctx.shadowColor = `rgba(${glow}, ${meteor.alpha * 0.65})`;
                ctx.beginPath();
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(meteor.x, meteor.y);
                ctx.stroke();
                ctx.restore();
            });

            meteors = meteors.filter((meteor) => meteor.x > -meteor.length && meteor.y < height + meteor.length);
        }

        function tick(now) {
            ctx.clearRect(0, 0, width, height);
            const dark = document.documentElement.dataset.scheme === "dark";
            points.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                const star = dark ? "154, 184, 255" : "133, 119, 190";
                const line = dark ? "126, 200, 255" : "147, 155, 205";
                ctx.fillStyle = `rgba(${star}, ${dark ? p.a * 0.82 : p.a * 1.28})`;
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < points.length; j++) {
                    const q = points[j];
                    const dx = p.x - q.x;
                    const dy = p.y - q.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.strokeStyle = `rgba(${line}, ${(dark ? 0.1 : 0.16) * (1 - dist / 120)})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                }
            });
            drawMeteors(now, dark);
            requestAnimationFrame(tick);
        }

        resize();
        window.addEventListener("resize", resize, { passive: true });
        requestAnimationFrame(tick);
    }

    function initClickSpark() {
        if (prefersReducedMotion || window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
        document.addEventListener("click", (event) => {
            const spark = document.createElement("span");
            spark.className = "drawn-click-spark";
            spark.style.left = `${event.clientX}px`;
            spark.style.top = `${event.clientY}px`;
            document.body.appendChild(spark);
            window.setTimeout(() => spark.remove(), 620);
        }, { passive: true });
    }

    function initCursorGlow() {
        const glow = document.querySelector(".drawn-cursor-glow");
        if (!glow || window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
        let frame = 0;
        let x = 0;
        let y = 0;
        window.addEventListener("pointermove", (event) => {
            x = event.clientX;
            y = event.clientY;
            glow.classList.add("is-active");
            if (frame) return;
            frame = requestAnimationFrame(() => {
                glow.style.left = `${x}px`;
                glow.style.top = `${y}px`;
                frame = 0;
            });
        }, { passive: true });
    }

    function initBackToTop() {
        const button = document.querySelector(".drawn-back-to-top");
        if (!button) return;
        const update = () => button.classList.toggle("is-visible", window.scrollY > 420);
        button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
        window.addEventListener("scroll", update, { passive: true });
        update();
    }

    function initReadingProgress() {
        const bar = document.querySelector(".drawn-reading-progress");
        const article = document.querySelector(".main-article");
        if (!bar || !article) return;
        const update = () => {
            const rect = article.getBoundingClientRect();
            const total = article.offsetHeight - window.innerHeight;
            const read = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
            bar.style.transform = `scaleX(${read / Math.max(total, 1)})`;
        };
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update, { passive: true });
        update();
    }

    function initTocSpy() {
        const tocRoot = document.querySelector(".right-sidebar .widget--toc .toc-nav") || document.querySelector(".article-toc .toc-nav");
        const tocLinks = tocRoot ? Array.from(tocRoot.querySelectorAll("a")) : [];
        if (!tocLinks.length) return;
        const map = new Map();
        tocLinks.forEach((link) => {
            const id = decodeURIComponent(link.hash || "").replace("#", "");
            const heading = id ? document.getElementById(id) : null;
            if (heading) map.set(heading, link);
        });
        if (!map.size) return;
        let activeHeading = null;
        const observer = new IntersectionObserver((entries) => {
            let nextHeading = activeHeading;
            let bestTop = Number.POSITIVE_INFINITY;
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const top = Math.abs(entry.boundingClientRect.top);
                if (top < bestTop) {
                    bestTop = top;
                    nextHeading = entry.target;
                }
            });
            if (nextHeading && nextHeading !== activeHeading) {
                activeHeading = nextHeading;
                tocLinks.forEach((link) => link.classList.remove("is-active"));
                const link = map.get(activeHeading);
                if (link) {
                    link.classList.add("is-active");
                    link.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
                }
            }
        }, { rootMargin: "-18% 0px -70% 0px", threshold: 0.01 });
        map.forEach((_, heading) => observer.observe(heading));
    }

    function initColorSchemeLabel() {
        const label = document.querySelector("#dark-mode-toggle span");
        if (!label) return;
        const update = () => {
            label.textContent = document.documentElement.dataset.scheme === "dark" ? "暗色模式" : "浅色模式";
        };
        window.addEventListener("onColorSchemeChange", update);
        update();
    }

    function initSearchShortcut() {
        document.addEventListener("keydown", (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                window.location.href = "/search/";
            }
        });
    }

    function initSearchPagination() {
        const list = document.querySelector(".search-result--list");
        const nav = document.querySelector(".drawn-search-pagination");
        if (!list || !nav) return;
        const previous = nav.querySelector("[data-search-prev]");
        const next = nav.querySelector("[data-search-next]");
        const status = nav.querySelector("[data-search-page]");
        const pageSize = 10;
        let page = 1;

        const render = () => {
            const items = Array.from(list.children);
            const total = Math.max(1, Math.ceil(items.length / pageSize));
            page = Math.min(page, total);
            items.forEach((item, index) => {
                item.hidden = index < (page - 1) * pageSize || index >= page * pageSize;
            });
            nav.classList.toggle("hidden", items.length <= pageSize);
            status.textContent = `${page} / ${total}`;
            previous.disabled = page === 1;
            next.disabled = page === total;
        };

        previous.addEventListener("click", () => { page -= 1; render(); });
        next.addEventListener("click", () => { page += 1; render(); });
        new MutationObserver(() => { page = 1; render(); }).observe(list, { childList: true });
        render();
    }

    document.addEventListener("DOMContentLoaded", () => {
        initBackground();
        initClickSpark();
        initCursorGlow();
        initBackToTop();
        initReadingProgress();
        initTocSpy();
        initColorSchemeLabel();
        initSearchShortcut();
        initSearchPagination();
    });
})();
