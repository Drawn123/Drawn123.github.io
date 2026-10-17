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

    document.addEventListener("DOMContentLoaded", () => {
        initBackToTop();
        initReadingProgress();
        initColorSchemeLabel();
        initSearchShortcut();
    });
})();
