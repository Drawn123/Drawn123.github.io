// One observer updates both desktop and mobile contents without scrolling the page.
export function setupScrollspy() {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".toc-nav a[href*='#']"));
    const groups = new Map<HTMLElement, HTMLAnchorElement[]>();
    links.forEach(link => {
        let id: string;
        try { id = decodeURIComponent(link.hash.slice(1)); } catch { return; }
        const heading = document.getElementById(id);
        if (heading) groups.set(heading, [...(groups.get(heading) || []), link]);
    });
    if (!groups.size) return;
    const headings = [...groups.keys()];
    let scheduled = false;
    const update = () => {
        scheduled = false;
        const top = window.innerHeight * 0.22;
        let active = headings[0];
        headings.forEach(heading => { if (heading.getBoundingClientRect().top <= top) active = heading; });
        links.forEach(link => { link.classList.remove("is-active"); link.removeAttribute("aria-current"); });
        (groups.get(active) || []).forEach(link => { link.classList.add("is-active"); link.setAttribute("aria-current", "location"); });
    };
    const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    update();
}
