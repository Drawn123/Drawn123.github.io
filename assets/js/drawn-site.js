(function () {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function initBackToTop() {
        const button = document.querySelector(".drawn-back-to-top");
        if (!button) return;
        const update = () => button.classList.toggle("is-visible", window.scrollY > 420);
        button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" }));
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
                window.location.href = document.querySelector("[data-site-search]")?.getAttribute("href") || "/search/";
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
        initBackToTop();
        initReadingProgress();
        initColorSchemeLabel();
        initSearchShortcut();
        initSearchPagination();
    });
})();
