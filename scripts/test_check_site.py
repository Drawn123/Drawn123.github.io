"""Regression checks for category validation in ordinary and minified HTML."""
import contextlib
import io
import json
import tempfile
import unittest
from pathlib import Path

from check_site import Page, check


class CategoryValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.site = Path(self.temp.name) / "site"
        self.site.mkdir()
        self.baseline = Path(self.temp.name) / "baseline.json"
        self.baseline.write_text(json.dumps({"urls": ["/"]}), encoding="utf-8")
        self.write("index.html", "<html></html>")
        self.write("categories/algorithm/index.html", "<html></html>")
        self.write("categories/notes/index.html", "<html></html>")
        self.article = {
            "title": "Category validation fixture",
            "permalink": "https://drawn123.github.io/algorithm/intro/",
            "section": "algorithm",
            "categories": ["算法竞赛"],
        }
        self.write_index()

    def write(self, name, text):
        path = self.site / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")

    def write_index(self):
        self.write("search/index.json", json.dumps([self.article], ensure_ascii=False))

    def render(self, category_link):
        # The expected category also appears in navigation and a related article.
        # Neither may hide an incorrect category on the article itself.
        self.write("algorithm/intro/index.html", (
            '<nav><a href="/categories/algorithm/">Navigation</a></nav>'
            '<article class="main-article"><header class="article-category">'
            f'{category_link}</header><p>Body</p></article>'
            '<article><header class="article-category">'
            '<a href="/categories/algorithm/">Related article</a></header></article>'
        ))

    def result(self):
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            failed = check(self.site, self.baseline)
        return failed, output.getvalue()

    def test_quoted_and_minified_attributes(self):
        for href in ('"/categories/algorithm/"', "'/categories/algorithm/'", "/categories/algorithm/"):
            with self.subTest(href=href):
                self.render(f"<a href={href}>Algorithm</a>")
                failed, output = self.result()
                self.assertFalse(failed, output)

    def test_absolute_and_relative_category_links(self):
        for href in ("https://drawn123.github.io/categories/algorithm/", "../../categories/algorithm/"):
            with self.subTest(href=href):
                self.render(f'<a href="{href}">Algorithm</a>')
                failed, output = self.result()
                self.assertFalse(failed, output)

    def test_wrong_category_is_not_hidden_by_navigation_or_related_articles(self):
        self.render("<a href=/categories/notes/>Notes</a>")
        failed, output = self.result()
        self.assertTrue(failed)
        self.assertIn("Article category does not match its section", output)

    def test_extra_article_category_is_rejected(self):
        self.render('<a href=/categories/algorithm/>Algorithm</a><a href=/categories/notes/>Notes</a>')
        self.assertTrue(self.result()[0])

    def test_multiple_metadata_categories_are_rejected(self):
        self.render('<a href=/categories/algorithm/>Algorithm</a>')
        self.article["categories"].append("课程与工具笔记")
        self.write_index()
        failed, output = self.result()
        self.assertTrue(failed)
        self.assertIn("Article must inherit exactly one content category", output)

    def test_missing_article_is_rejected(self):
        self.assertTrue(self.result()[0])

    def test_minified_main_article_and_category_classes(self):
        page = Page('<article class=main-article><header class=article-category>'
                    '<a href=/categories/algorithm/>Algorithm</a></header></article>')
        self.assertEqual(page.category_links, ["/categories/algorithm/"])


if __name__ == "__main__":
    unittest.main()
