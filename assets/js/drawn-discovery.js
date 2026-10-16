(function () {
    document.addEventListener("DOMContentLoaded", () => {
        const panel = document.querySelector("[data-recent-panel]");
        if (panel) {
            const filters = panel.querySelector("[data-recent-filters]");
            const more = panel.querySelector("[data-recent-more]");
            const articles = Array.from(panel.querySelectorAll("[data-recent-list] > article"));
            let section = "all";
            let limit = 6;
            const render = () => {
                let count = 0;
                articles.forEach(article => {
                    const match = section === "all" || article.dataset.section === section;
                    article.hidden = !match || count >= limit;
                    if (match) count += 1;
                });
                more.hidden = count <= limit;
            };
            filters.hidden = false;
            filters.addEventListener("click", event => {
                const button = event.target.closest("button[data-section]");
                if (!button) return;
                section = button.dataset.section;
                limit = 6;
                filters.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
                render();
            });
            more.addEventListener("click", () => { limit += 6; render(); });
            render();
        }

        const directory = document.querySelector("[data-tag-directory]");
        if (directory) {
            const input = directory.querySelector("[data-tag-filter]");
            const sort = directory.querySelector("[data-tag-sort]");
            const list = directory.querySelector("[data-tag-list]");
            const items = Array.from(list.children);
            directory.querySelector("[data-tag-tools]").hidden = false;
            const render = () => {
                const keyword = input.value.trim().toLocaleLowerCase();
                items.sort((a, b) => sort.value === "name"
                    ? a.dataset.tagName.localeCompare(b.dataset.tagName, "zh-CN")
                    : Number(b.dataset.tagCount) - Number(a.dataset.tagCount) || a.dataset.tagName.localeCompare(b.dataset.tagName, "zh-CN"));
                let count = 0;
                items.forEach(item => {
                    item.hidden = !item.dataset.tagName.toLocaleLowerCase().includes(keyword);
                    if (!item.hidden) count += 1;
                    list.appendChild(item);
                });
                directory.querySelector("[data-tag-status]").textContent = count ? `显示 ${count} / ${items.length} 个标签` : "没有找到匹配的标签，试试其他关键词。";
            };
            input.addEventListener("input", render);
            sort.addEventListener("change", render);
            render();
        }
    });
})();
