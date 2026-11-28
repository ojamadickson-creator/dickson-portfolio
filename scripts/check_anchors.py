"""Checks that every internal anchor link points at a real id in the built site."""
import os
import re
import glob

REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
CANDIDATES = [
    os.path.join(REPO, ".vercel", "output", "static"),
    os.path.join(REPO, "dist", "client"),
    os.path.join(REPO, "dist"),
]
ROOT = next((d for d in CANDIDATES if os.path.exists(os.path.join(d, "index.html"))), CANDIDATES[-1])

pages = {}
for f in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
    rel = "/" + os.path.relpath(f, ROOT).replace("\\", "/")
    rel = rel[: -len("index.html")] if rel.endswith("index.html") else rel[: -len("404.html")] + "404"
    pages[rel] = open(f, encoding="utf8").read()

bad = []
for rel, html in pages.items():
    for m in re.finditer(r'href="(/[^"]*#[^"]+)"', html):
        base, anchor = m.group(1).split("#", 1)
        page = pages.get(base)
        if page is None:
            bad.append((rel, base, "page missing"))
        elif f'id="{anchor}"' not in page:
            bad.append((rel, base + "#" + anchor, "anchor missing"))

print(f"pages: {len(pages)} | problems: {len(bad)}")
for b in bad:
    print(" ", b)