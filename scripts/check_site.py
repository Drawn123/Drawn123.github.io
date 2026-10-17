"""Check rendered internal links, anchors, article IDs and preserved routes.

Usage: python scripts/check_site.py --site work/build
Build into a clean destination before running this check.
"""
import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.links = []
        self.ids = set()
        self.category_links = []
        self._article_depth = 0
        self._in_category_header = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "article":
            if self._article_depth or "main-article" in attrs.get("class", "").split():
                self._article_depth += 1
        if tag == "header" and self._article_depth and "article-category" in attrs.get("class", "").split():
            self._in_category_header = True
        if tag == "a" and self._in_category_header and attrs.get("href"):
            self.category_links.append(attrs["href"])
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        for key in ("href", "src"):
            if attrs.get(key):
                self.links.append(attrs[key])
        if tag == "meta" and attrs.get("http-equiv", "").lower() == "refresh":
            match = re.search(r"url=(.+)", attrs.get("content", ""), re.I)
            if match:
                self.links.append(match[1])

    def handle_endtag(self, tag):
        if tag == "header":
            self._in_category_header = False
        if tag == "article" and self._article_depth:
            self._article_depth -= 1
            if not self._article_depth:
                self._in_category_header = False


def check(site, baseline):
    pages = {}
    for file in site.rglob("*.html"):
        rel = file.relative_to(site).as_posix()
        pages[rel] = Page(file.read_text(encoding="utf-8"))
    errors = set()

    def destination(path):
        path = unquote(path).lstrip("/")
        if not path or path.endswith("/"):
            path += "index.html"
        elif not Path(path).suffix:
            path += "/index.html"
        return path

    for name, page in pages.items():
        origin = "/" + name.removesuffix("index.html") if name.endswith("index.html") else "/" + name
        for link in page.links:
            parsed = urlsplit(link)
            if parsed.scheme and parsed.scheme not in ("http", "https"):
                continue
            if parsed.netloc and parsed.netloc.lower() != "drawn123.github.io":
                continue
            target = urlsplit(urljoin("https://drawn123.github.io" + origin, link))
            rel = destination(target.path)
            if not (site / rel).is_file():
                errors.add(f"{name}: missing target {link}")
            elif target.fragment and rel in pages and unquote(target.fragment) not in pages[rel].ids:
                errors.add(f"{name}: missing anchor {link}")

    search_index = site / "search/index.json"
    if search_index.is_file():
        for article in json.loads(search_index.read_text(encoding="utf-8")):
            if len(article.get("categories", [])) != 1:
                errors.add(f"Article must inherit exactly one content category: {article['title']}")
            rel = destination(urlsplit(article["permalink"]).path)
            page = pages.get(rel)
            expected = f'/categories/{article["section"]}/'
            origin = urljoin("https://drawn123.github.io", article["permalink"])
            categories = set()
            if page:
                for link in page.category_links:
                    target = urlsplit(urljoin(origin, link))
                    if target.scheme in ("http", "https") and target.netloc.lower() == "drawn123.github.io":
                        categories.add(unquote(target.path))
            if categories != {expected}:
                errors.add(f"Article category does not match its section: {article['title']}")

    protected = json.loads(baseline.read_text(encoding="utf-8"))["urls"]
    for url in protected:
        if not (site / destination(url)).is_file():
            errors.add(f"Existing route lost: {url}")

    article_ids = {}
    for file in Path("content").rglob("index.md"):
        raw = file.read_text(encoding="utf-8")
        match = re.match(r"---\s*\n(.*?)\n---", raw, re.S)
        if not match:
            continue
        metadata = match[1]
        identifier = re.search(r'^knowledge_id:\s*"([a-z0-9-]+)"\s*$', metadata, re.M)
        if identifier:
            key = identifier[1]
            if key in article_ids:
                errors.add(f"Duplicate article ID: {key}")
            article_ids[key] = file
        elif file.parts[1] != "page":
            errors.add(f"Missing knowledge_id: {file}")

    for error in sorted(errors):
        print(error)
    print(f"Checked {len(pages)} HTML pages, {len(protected)} preserved routes, {len(article_ids)} article IDs; {len(errors)} errors.")
    return bool(errors)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site", type=Path, default=Path("public"))
    parser.add_argument("--baseline", type=Path, default=Path("docs/url-baseline.json"))
    args = parser.parse_args()
    if not args.site.is_dir():
        parser.error(f"Build directory does not exist: {args.site}")
    raise SystemExit(check(args.site, args.baseline))
