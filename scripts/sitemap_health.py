import re, urllib.request, xml.etree.ElementTree as ET, concurrent.futures, time

BASE = "https://ojamadickson.xyz"
UA = {"User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"}

def get(url, method="GET"):
    req = urllib.request.Request(url, headers=UA, method=method)
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=30) as r:
        body = r.read() if method == "GET" else b""
        return r.status, r.headers.get("Content-Type", ""), body, round((time.time()-t0)*1000)

# 1. sitemap itself
status, ctype, raw, ms = get(f"{BASE}/sitemap.xml")
tree = ET.fromstring(raw)
ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
urls = [u.find("s:loc", ns).text for u in tree.findall("s:url", ns)]
print(f"sitemap: {status} | {ctype} | {len(raw)} bytes | {ms} ms | {len(urls)} urls")
print(f"duplicates: {len(urls) - len(set(urls))}")
print(f"all https+apex: {all(u.startswith('https://ojamadickson.xyz/') for u in urls)}")
print(f"all trailing slash: {all(u.endswith('/') for u in urls)}")

# 2. every listed URL
def probe(u):
    try:
        st, ct, body, ms = get(u)
        html = body.decode("utf8", "replace")
        title = re.search(r"<title>([^<]*)</title>", html)
        canon = re.search(r'rel="canonical" href="([^"]+)"', html)
        h1 = len(re.findall(r"<h1\b", html))
        return (u, st, ct.split(";")[0], len(body), h1,
                (canon.group(1) if canon else "MISSING"),
                (title.group(1)[:48] if title else "NO TITLE"))
    except Exception as e:
        return (u, "ERR", str(e), 0, 0, "", "")

print("\nURL checks:")
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
    rows = list(ex.map(probe, urls))
bad = 0
for u, st, ct, size, h1, canon, title in rows:
    flag = ""
    if st != 200: flag += " STATUS!"
    if ct != "text/html": flag += " TYPE!"
    if h1 != 1: flag += f" H1={h1}!"
    if canon != u: flag += " CANON!"
    if flag: bad += 1
    print(f"  {u.replace(BASE,''):45} {st} {size:>6}B h1={h1} canon={'ok' if canon==u else canon} {flag}")

print(f"\nproblems: {bad} of {len(rows)}")
