import createElement from './createElement';

interface pageData {
    section?: string,
    tags?: string[],
    categories?: string[],
    platform?: string[],
    problem_id?: string,
    knowledge_id?: string,
    title: string,
    date: string,
    permalink: string,
    content: string,
    image?: string,
    preview: string,
    matchCount: number
}

interface match {
    start: number,
    end: number
}

/**
 * Escape HTML tags as HTML entities
 * Edited from:
 * @link https://stackoverflow.com/a/5499821
 */
const tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '…': '&hellip;'
};

function replaceTag(tag: string) {
    return (tagsToReplace as Record<string, string>)[tag] || tag;
}

function replaceHTMLEnt(str: string) {
    return str.replace(/[&<>"]/g, replaceTag);
}

function escapeRegExp(string: string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

class Search {
    private data: pageData[];
    private form: HTMLFormElement;
    private input: HTMLInputElement;
    private list: HTMLDivElement;
    private resultTitle: HTMLHeadElement;
    private resultTitleTemplate: string;
    private container: HTMLDivElement;
    private filters: Record<string, HTMLSelectElement>;
    private results: pageData[] = [];
    private page = 1;
    private pageSize = 10;
    private requestId = 0;

    constructor({ form, input, list, resultTitle, resultTitleTemplate }: {
        form: HTMLFormElement,
        input: HTMLInputElement,
        list: HTMLDivElement,
        resultTitle: HTMLHeadingElement,
        resultTitleTemplate: string
    }) {
        this.form = form;
        this.input = input;
        this.list = list;
        this.resultTitle = resultTitle;
        this.resultTitleTemplate = resultTitleTemplate;
        this.container = list.parentElement as HTMLDivElement;

        this.filters = Object.fromEntries(['section', 'platform', 'tag'].map(name => [
            name, document.querySelector(`[data-search-${name}]`) as HTMLSelectElement
        ]));
        this.initialize();
    }

    private async initialize() {
        try {
            const data = await this.getData();
            for (const name of ['platform', 'tag']) {
                const values = new Set<string>();
                data.forEach(item => (name === 'tag' ? item.tags || [] : item.platform || []).forEach(value => values.add(value)));
                Array.from(values).sort((a, b) => a.localeCompare(b, 'zh-CN')).forEach(value => {
                    this.filters[name].add(new Option(value, value));
                });
            }
            Object.values(this.filters).forEach(select => select.disabled = false);
            (document.querySelector('[data-search-reset]') as HTMLButtonElement).disabled = false;
            this.bindQueryStringChange();
            this.bindSearchForm();
            document.querySelector('[data-search-prev]')?.addEventListener('click', () => { this.page--; this.renderResults(); });
            document.querySelector('[data-search-next]')?.addEventListener('click', () => { this.page++; this.renderResults(); });
            await this.handleQueryString();
        }
        catch (error) {
            this.container.classList.remove('hidden');
            this.resultTitle.innerText = '搜索数据加载失败，请刷新页面重试。';
            console.error(error);
        }
    }

    /**
     * Processes search matches
     * @param str original text
     * @param matches array of matches
     * @param ellipsis whether to add ellipsis to the end of each match
     * @param charLimit max length of preview string
     * @param offset how many characters before and after the match to include in preview
     * @returns preview string
     */
    private static processMatches(str: string, matches: match[], ellipsis: boolean = true, charLimit = 140, offset = 20): string {
        matches.sort((a, b) => {
            return a.start - b.start;
        });

        let i = 0,
            lastIndex = 0,
            charCount = 0;

        const resultArray: string[] = [];

        while (i < matches.length) {
            const item = matches[i];

            /// item.start >= lastIndex (equal only for the first iteration)
            /// because of the while loop that comes after, iterating over variable j

            if (ellipsis && item.start - offset > lastIndex) {
                resultArray.push(`${replaceHTMLEnt(str.substring(lastIndex, lastIndex + offset))} [...] `);
                resultArray.push(`${replaceHTMLEnt(str.substring(item.start - offset, item.start))}`);
                charCount += offset * 2;
            }
            else {
                /// If the match is too close to the end of last match, don't add ellipsis
                resultArray.push(replaceHTMLEnt(str.substring(lastIndex, item.start)));
                charCount += item.start - lastIndex;
            }

            let j = i + 1,
                end = item.end;

            /// Include as many matches as possible
            /// [item.start, end] is the range of the match
            while (j < matches.length && matches[j].start <= end) {
                end = Math.max(matches[j].end, end);
                ++j;
            }

            resultArray.push(`<mark>${replaceHTMLEnt(str.substring(item.start, end))}</mark>`);
            charCount += end - item.start;

            i = j;
            lastIndex = end;

            if (ellipsis && charCount > charLimit) break;
        }

        /// Add the rest of the string
        if (lastIndex < str.length) {
            let end = str.length;
            if (ellipsis) end = Math.min(end, lastIndex + offset);

            resultArray.push(`${replaceHTMLEnt(str.substring(lastIndex, end))}`);

            if (ellipsis && end != str.length) {
                resultArray.push(` [...]`);
            }
        }

        return resultArray.join('');
    }

    private async searchKeywords(keywords: string[]) {
        const rawData = await this.getData();
        const results: pageData[] = [];

        const terms = keywords.filter(value => value.trim() !== '').map(escapeRegExp);
        const regex = terms.length ? new RegExp(terms.join('|'), 'gi') : null;

        const section = this.filters.section.value;
        const platform = this.filters.platform.value;
        const tag = this.filters.tag.value;
        for (const item of rawData) {
            if (section && item.section !== section) continue;
            if (platform && !(item.platform || []).includes(platform)) continue;
            if (tag && !(item.tags || []).includes(tag)) continue;
            const titleMatches: match[] = [],
                contentMatches: match[] = [];

            let result = {
                ...item,
                title: replaceHTMLEnt(item.title),
                preview: '',
                matchCount: 0
            }

            const contentMatchAll = regex ? item.content.matchAll(regex) : [];
            for (const match of Array.from(contentMatchAll)) {
                contentMatches.push({
                    start: match.index,
                    end: match.index + match[0].length
                });
            }

            const titleMatchAll = regex ? item.title.matchAll(regex) : [];
            for (const match of Array.from(titleMatchAll)) {
                titleMatches.push({
                    start: match.index,
                    end: match.index + match[0].length
                });
            }

            if (titleMatches.length > 0) result.title = Search.processMatches(item.title, titleMatches, false);
            if (contentMatches.length > 0) {
                result.preview = Search.processMatches(result.content, contentMatches);
            }
            else {
                /// If there are no matches in the content, use the first 140 characters as preview
                result.preview = replaceHTMLEnt(result.content.substring(0, 140));
            }

            const metadata = [...(item.tags || []), ...(item.categories || []), ...(item.platform || []), item.problem_id || "", item.knowledge_id || ""].join(" ");
            const metadataMatches = regex ? Array.from(metadata.matchAll(regex)) : [];
            result.matchCount = titleMatches.length * 3 + contentMatches.length + metadataMatches.length * 2;
            if (!regex || result.matchCount > 0) results.push(result);
        }

        /// Result with more matches appears first
        return results.sort((a, b) => {
            return b.matchCount - a.matchCount || b.date.localeCompare(a.date);
        });
    }

    private async doSearch(keywords: string[]) {
        const startTime = performance.now();
        const requestId = ++this.requestId;

        const results = await this.searchKeywords(keywords);
        if (requestId !== this.requestId) return;
        this.results = results;
        this.page = 1;
        this.renderResults();

        const endTime = performance.now();

        this.resultTitle.innerText = this.generateResultTitle(results.length, ((endTime - startTime) / 1000).toPrecision(1));

        this.container?.classList.remove('hidden');
    }

    private renderResults() {
        const pages = Math.max(1, Math.ceil(this.results.length / this.pageSize));
        this.page = Math.min(pages, Math.max(1, this.page));
        this.list.innerHTML = '';
        for (const item of this.results.slice((this.page - 1) * this.pageSize, this.page * this.pageSize)) {
            this.list.append(Search.render(item));
        }
        document.querySelector('[data-search-empty]')?.toggleAttribute('hidden', this.results.length > 0);
        document.querySelector('.drawn-search-pagination')?.classList.toggle('hidden', pages <= 1);
        const status = document.querySelector('[data-search-page]');
        if (status) status.textContent = `${this.page} / ${pages}`;
        (document.querySelector('[data-search-prev]') as HTMLButtonElement).disabled = this.page === 1;
        (document.querySelector('[data-search-next]') as HTMLButtonElement).disabled = this.page === pages;
    }

    private generateResultTitle(resultLen: number, time: string) {
        return this.resultTitleTemplate.replace("#PAGES_COUNT", resultLen.toString()).replace("#TIME_SECONDS", time);
    }

    public async getData() {
        if (!this.data) {
            /// Not fetched yet
            const jsonURL = this.form.dataset.json as string;
            this.data = await fetch(jsonURL).then(res => res.json());
            const parser = new DOMParser();

            for (const item of this.data) {
                item.content = parser.parseFromString(item.content, 'text/html').body.innerText;
            }
        }

        return this.data;
    }

    private bindSearchForm() {
        const eventHandler = (e: Event) => {
            e.preventDefault();
            if ((e as InputEvent).isComposing) return;
            const keywords = this.input.value.trim();

            this.updateQueryString(keywords);
            this.doSearch(keywords.split(/\s+/));
        }

        this.form.addEventListener('submit', eventHandler);
        Object.values(this.filters).forEach(select => select.addEventListener('change', eventHandler));
        document.querySelector('[data-search-reset]')?.addEventListener('click', event => {
            this.input.value = '';
            Object.values(this.filters).forEach(select => select.value = '');
            eventHandler(event);
        });
        this.input.addEventListener('input', eventHandler);
        this.input.addEventListener('compositionend', eventHandler);
    }

    private bindQueryStringChange() {
        window.addEventListener('popstate', (e) => {
            this.handleQueryString()
        })
    }

    private async handleQueryString() {
        const pageURL = new URL(window.location.toString());
        const keywords = pageURL.searchParams.get('keyword') || '';
        this.input.value = keywords;
        for (const [name, select] of Object.entries(this.filters)) {
            const value = pageURL.searchParams.get(name) || '';
            // Preserve an unknown value so an old shared link yields zero results instead of all articles.
            if (value && !Array.from(select.options).some(option => option.value === value)) {
                select.add(new Option(value, value));
            }
            select.value = value;
        }
        await this.doSearch(keywords.split(/\s+/));
    }

    private updateQueryString(keywords: string) {
        const pageURL = new URL(window.location.toString());
        const values = { keyword: keywords, ...Object.fromEntries(Object.entries(this.filters).map(([name, select]) => [name, select.value])) };
        for (const [name, value] of Object.entries(values)) {
            if (value) pageURL.searchParams.set(name, value);
            else pageURL.searchParams.delete(name);
        }
        window.history.replaceState('', '', pageURL.toString());
    }

    public static render(item: pageData) {
        const metadata = document.createElement('div');
        metadata.className = 'drawn-search-meta';
        const labels = [
            ...(item.platform || []).map(platform => `平台 / ${platform}`),
            ...(item.problem_id ? [`题号 / ${item.problem_id}`] : []),
            ...(item.tags || [])
        ];
        for (const label of labels) {
            const span = document.createElement('span');
            span.textContent = label;
            metadata.append(span);
        }
        return (
            <article>
                <a href={item.permalink}>
                    <div class="article-details">
                        <h2 class="article-title" dangerouslySetInnerHTML={{ __html: item.title }}></h2>
                        <section class="article-preview" dangerouslySetInnerHTML={{ __html: item.preview }}></section>
                        {metadata}
                    </div>
                    {item.image &&
                        <div class="article-image">
                            <img src={item.image} loading="lazy" />
                        </div>
                    }
                </a>
            </article>
        );
    }
}

declare global {
    interface Window {
        searchResultTitleTemplate: string;
    }
}

window.addEventListener('load', () => {
    setTimeout(function () {
        const searchForm = document.querySelector('.search-form') as HTMLFormElement,
            searchInput = searchForm?.querySelector('input') as HTMLInputElement,
            searchResultList = document.querySelector('.search-result--list') as HTMLDivElement,
            searchResultTitle = document.querySelector('.search-result--title') as HTMLHeadingElement;

        if (!searchForm || !searchInput || !searchResultList || !searchResultTitle) return;

        new Search({
            form: searchForm,
            input: searchInput,
            list: searchResultList,
            resultTitle: searchResultTitle,
            resultTitleTemplate: window.searchResultTitleTemplate
        });
    }, 0);
})

export default Search;
