(function () {
    document.addEventListener("DOMContentLoaded", () => {
        const panel = document.querySelector("[data-recent-panel]");
        if (panel) {
            const filters = panel.querySelector("[data-recent-filters]");
            const more = panel.querySelector("[data-recent-more]");
            const articles = Array.from(panel.querySelectorAll("[data-recent-list] > article"));
            const pageSize = Number(panel.dataset.pageSize);
            let section = "all";
            let limit = pageSize;
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
                limit = pageSize;
                filters.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
                render();
            });
            more.addEventListener("click", () => { limit += pageSize; render(); });
            render();
        }

        const directory = document.querySelector("[data-tag-directory]");
        if (directory) {
            const input = directory.querySelector("[data-tag-filter]");
            const sort = directory.querySelector("[data-tag-sort]");
            const status = directory.querySelector("[data-tag-status]");
            const groups = Array.from(directory.querySelectorAll("[data-tag-group]"), group => {
                const list = group.querySelector("[data-tag-list]");
                return { group, list, items: Array.from(list.children), total: group.querySelector("[data-tag-total]"), wasOpen: false };
            });
            directory.querySelector("[data-tag-tools]").hidden = false;
            let searching = false;
            const filterGroups = () => {
                const keyword = input.value.trim().toLocaleLowerCase();
                const matches = new Set();
                for (const entry of groups) {
                    const { group, items, total } = entry;
                    let count = 0;
                    for (const item of items) {
                        const name = item.dataset.tagName;
                        item.hidden = !name.toLocaleLowerCase().includes(keyword);
                        if (!item.hidden) {
                            matches.add(name);
                            count++;
                        }
                    }
                    total.textContent = `${count} 个标签`;
                    group.hidden = count === 0;
                    if (keyword) {
                        if (!searching) entry.wasOpen = group.open;
                        group.open = count > 0;
                    } else if (searching) {
                        group.open = entry.wasOpen;
                    }
                }
                searching = Boolean(keyword);
                status.hidden = !searching;
                status.textContent = matches.size ? `找到 ${matches.size} 个标签` : "没有找到匹配的标签，试试其他关键词。";
            };
            const sortGroups = () => {
                for (const { list, items } of groups) {
                    items.sort((a, b) => {
                        const byName = a.dataset.tagName.localeCompare(b.dataset.tagName, "zh-CN");
                        return sort.value === "name" ? byName : Number(b.dataset.tagCount) - Number(a.dataset.tagCount) || byName;
                    });
                    list.append(...items);
                }
            };
            input.addEventListener("input", filterGroups);
            sort.addEventListener("change", sortGroups);
            sortGroups();
            filterGroups();
        }
    });
})();
