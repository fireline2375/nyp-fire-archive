#!/usr/bin/env python3
"""Render the proposal document's XML export into site/proposal.html.

The proposal page is generated rather than hand-written so it cannot drift from
the source document. Usage:

    python3 tools/docxml2html.py <exported-doc.xml> site/proposal.html

The input may be the raw <doc>...</doc> XML or the JSON envelope a docs read
returns (the XML is picked out of data.xml).
"""
import sys, json, re, datetime
import xml.etree.ElementTree as ET

src, out = sys.argv[1], sys.argv[2]
raw = open(src).read()
xml = json.loads(raw)["data"]["xml"] if raw.lstrip().startswith("{") else raw
root = ET.fromstring(xml)

def esc(t):
    return (t or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def inline(el):
    out = [esc(el.text)]
    for ch in el:
        t = ch.tag
        if   t == "bold":   out.append("<strong>%s</strong>" % inline(ch))
        elif t == "italic": out.append("<em>%s</em>" % inline(ch))
        elif t == "code":   out.append("<code>%s</code>" % inline(ch))
        elif t == "link":   out.append('<a href="%s">%s</a>' % (esc(ch.get("href", "#")), inline(ch)))
        elif t == "date":
            v = ch.get("value", "")
            try: v = datetime.date.fromisoformat(v).strftime("%B %-d, %Y")
            except Exception: pass
            out.append(esc(v))
        elif t == "mention":
            out.append("<strong>%s</strong>" % esc(ch.get("name") or ch.get("label") or "someone"))
        else: out.append(inline(ch))
        out.append(esc(ch.tail))
    return "".join(x for x in out if x)

# stable anchors for the sections other pages link to
ALIAS = [("protected health", "privacy"), ("how the platform", "safeguards"),
         ("automated flagging", "flagging"),
         ("ai-assisted search", "aisearch"),
         ("how material would move", "custody"), ("the paperwork", "paperwork"),
         ("what gets published", "publishing"), ("name, domain", "funding"),
         ("if this is more", "tiers"), ("precedent", "precedent"),
         ("what i am asking", "ask"), ("technology", "technology"),
         ("risks", "risks"), ("what this asks", "asks")]

def slug(txt):
    low = re.sub(r"<[^>]+>", "", txt).strip().lower()
    for key, a in ALIAS:
        if low.startswith(key): return a
    return re.sub(r"[^a-z0-9]+", "-", low).strip("-")[:48] or "section"

body, toc, state = [], [], {"title": False, "sub": False}

def render(el, out):
    tag = el.tag
    if tag == "paragraph":
        txt = inline(el).strip()
        lvl = el.get("heading")
        if not txt: return
        if lvl == "1" and not state["title"]:
            state["title"] = True; return          # the title lives in the hero
        if lvl == "2" and state["title"] and not state["sub"]:
            state["sub"] = True; return            # and so does the subtitle
        if lvl in ("1", "2", "3"):
            s = slug(txt)
            toc.append((s, re.sub(r"<[^>]+>", "", txt)))
            out.append('<h2 id="%s">%s</h2>' % (s, txt)); return
        if not state["sub"]:
            out.append('<p class="byline-src">%s</p>' % txt); return
        out.append("<p>%s</p>" % txt); return

    if tag == "list":
        t = "ol" if el.get("kind") == "ordered" else "ul"
        out.append("<%s>" % t)
        for li in el.findall("listItem"):
            out.append("<li>")
            for p in li.findall("paragraph"):
                out.append(inline(p)); out.append("<br>")
            if out[-1] == "<br>": out.pop()
            for sub in li:
                if sub.tag in ("list", "table"): render(sub, out)
            out.append("</li>")
        out.append("</%s>" % t); return

    if tag == "table":
        rows = el.findall("row")
        if not rows: return
        out.append('<div style="overflow-x:auto"><table>')
        for r in rows:
            cells = r.findall("cell")
            head = any(c.get("header") == "true" for c in cells)
            out.append("<tr>")
            for c in cells:
                inner = " ".join(inline(p) for p in c.findall("paragraph"))
                tagn = "th" if head else "td"
                out.append("<%s>%s</%s>" % (tagn, inner, tagn))
            out.append("</tr>")
        out.append("</table></div>"); return

    if tag == "embed":
        out.append('<figure><div class="plate" style="padding:26px;text-align:center;'
                   'font-family:var(--sans);font-size:13px;color:var(--faint)">'
                   'Structural diagram &mdash; four levels of description, six cross-cutting facets'
                   '</div><figcaption>%s</figcaption></figure>' % esc(el.get("caption") or "diagram"))
        return

    for ch in el: render(ch, out)

for e in root: render(e, body)

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The proposal &middot; NEU/NYP Archive</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&family=Source+Serif+4:opsz,wght@8..60,400..600&family=IBM+Plex+Mono:wght@400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
<style>
  .byline-src{font-family:var(--sans);font-size:13.5px;color:var(--faint);margin-bottom:0}
  .prose h2{scroll-margin-top:84px;padding-top:.2em}
  .prose table{font-size:14.5px}
  .prose th{white-space:nowrap}
  @media (max-width:640px){ .prose th{white-space:normal} }
</style>
</head>
<body>
<div class="demobar"><div class="wrap">
  <b>Demonstration prototype</b>
  <span>Every record shown is invented sample data &middot; not an official CAL FIRE site &middot; no real records are published here</span>
</div></div>

<div class="story-hero">
  <div class="wrap">
    <p class="eyebrow">Proposal</p>
    <h1>NEU/NYP Archive Project</h1>
    <p class="lede">A proposal to the Unit Chief &mdash; digitize the archive room, catalog it item by item,
      and publish only what the Unit approves.</p>
  </div>
</div>

<section style="padding:40px 0 0">
  <div class="wrap">
    <div class="cols">
      <aside class="facets">
        <div class="fgroup">
          <h3>Contents</h3>
          <div class="anchor-list" style="columns:1">__TOC__</div>
        </div>
        <div class="fgroup">
          <h3>See it working</h3>
          <a class="btn" href="browse.html" style="margin-bottom:8px">The public catalog</a>
          <a class="btn" href="review.html">The approval gate</a>
        </div>
      </aside>
      <div class="prose" style="max-width:74ch">
__BODY__
      </div>
    </div>
  </div>
</section>
<script src="assets/data.js"></script>
<script src="assets/app.js"></script>
</body>
</html>
"""
toc_html = "".join('<a href="#%s">%s</a>' % (s, t) for s, t in toc)
open(out, "w").write(HEAD.replace("__TOC__", toc_html).replace("__BODY__", "\n".join(body)))
print("wrote %s - %d sections" % (out, len(toc)))
