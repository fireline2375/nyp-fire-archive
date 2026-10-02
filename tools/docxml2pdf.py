#!/usr/bin/env python3
"""Typeset the proposal document's XML export as a PDF.

    pip install reportlab
    python3 tools/docxml2pdf.py <exported-doc.xml> NEU-NYP-Archive-Proposal.pdf

Headings, body text, bullet and numbered lists, and tables with wrapped cells.
Embedded figures are noted rather than drawn - export the PDF from the source
document itself if the diagrams have to appear.
"""
import sys, json, re, datetime
import xml.etree.ElementTree as ET
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, Table, TableStyle)

src, out = sys.argv[1], sys.argv[2]
raw = open(src).read()
xml = json.loads(raw)["data"]["xml"] if raw.lstrip().startswith("{") else raw
root = ET.fromstring(xml)

INK   = colors.HexColor("#1a1a1a")
MUTED = colors.HexColor("#5c5c5c")
RULE  = colors.HexColor("#c8c8c8")
BAND  = colors.HexColor("#f0efec")
ACCENT = colors.HexColor("#8c2f16")

def esc(t):
    return (t or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def inline(el):
    out = [esc(el.text)]
    for ch in el:
        tag = ch.tag
        if tag == "bold":
            out.append("<b>%s</b>" % inline(ch))
        elif tag == "italic":
            out.append("<i>%s</i>" % inline(ch))
        elif tag == "code":
            out.append('<font face="Courier" size="9" color="#7a2d12">%s</font>'
                       % inline(ch).replace("\n", "<br/>"))
        elif tag == "link":
            out.append('<font color="#1b4f8a">%s</font>' % inline(ch))
        elif tag == "date":
            v = ch.get("value", "")
            try: v = datetime.date.fromisoformat(v).strftime("%B %-d, %Y")
            except Exception: pass
            out.append(esc(v))
        elif tag == "mention":
            out.append("<b>%s</b>" % esc(ch.get("name") or ch.get("label") or "someone"))
        else:
            out.append(inline(ch))
        out.append(esc(ch.tail))
    return "".join(x for x in out if x)

S = dict(
    title    = ParagraphStyle("title", fontName="Helvetica-Bold", fontSize=21, leading=25,
                              textColor=INK, spaceAfter=2),
    subtitle = ParagraphStyle("subtitle", fontName="Helvetica", fontSize=12.5, leading=16,
                              textColor=ACCENT, spaceAfter=3),
    byline   = ParagraphStyle("byline", fontName="Helvetica", fontSize=9, leading=13,
                              textColor=MUTED, spaceAfter=16),
    h2       = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=12.5, leading=15,
                              textColor=INK, spaceBefore=17, spaceAfter=6),
    body     = ParagraphStyle("body", fontName="Times-Roman", fontSize=10.5, leading=14.6,
                              textColor=INK, spaceAfter=7, alignment=TA_LEFT),
    item     = ParagraphStyle("item", fontName="Times-Roman", fontSize=10.5, leading=14.4,
                              textColor=INK, spaceAfter=4.5, leftIndent=16, bulletIndent=3),
    cell     = ParagraphStyle("cell", fontName="Times-Roman", fontSize=9.2, leading=12.4,
                              textColor=INK),
    cellh    = ParagraphStyle("cellh", fontName="Helvetica-Bold", fontSize=8.6, leading=11.6,
                              textColor=INK),
    figure   = ParagraphStyle("figure", fontName="Helvetica-Oblique", fontSize=9, leading=12.5,
                              textColor=MUTED, spaceBefore=4, spaceAfter=10, leftIndent=10),
)

AVAIL = letter[0] - 2 * 0.95 * inch
story = []
state = {"title": False, "sub": False}

def render(el, into):
    tag = el.tag
    if tag == "paragraph":
        txt = inline(el)
        lvl = el.get("heading")
        if not txt.strip():
            into.append(Spacer(1, 5)); return
        if lvl == "1" and not state["title"]:
            state["title"] = True; into.append(Paragraph(txt, S["title"])); return
        if lvl == "2" and state["title"] and not state["sub"]:
            state["sub"] = True; into.append(Paragraph(txt, S["subtitle"])); return
        if lvl in ("1", "2", "3"):
            into.append(Paragraph(txt, S["h2"])); return
        if not state["sub"]:
            into.append(Paragraph(txt, S["byline"]))
            into.append(Table([[""]], colWidths=[AVAIL], rowHeights=[0.6],
                              style=TableStyle([("LINEABOVE", (0, 0), (-1, 0), 0.7, RULE)])))
            into.append(Spacer(1, 10)); return
        into.append(Paragraph(txt, S["body"])); return

    if tag == "list":
        kind, n = el.get("kind", "bullet"), 0
        for li in el.findall("listItem"):
            n += 1
            if kind == "ordered": b = "%d." % n
            elif kind == "check": b = "☒" if li.get("checked") == "true" else "☐"
            else:                 b = "•"
            for i, p in enumerate(li.findall("paragraph")):
                into.append(Paragraph(inline(p), S["item"], bulletText=(b if i == 0 else None)))
            for sub in li:
                if sub.tag in ("list", "table"): render(sub, into)
        into.append(Spacer(1, 5)); return

    if tag == "table":
        rows, head = [], []
        for r in el.findall("row"):
            cells, is_head = [], False
            for c in r.findall("cell"):
                if c.get("header") == "true": is_head = True
                sty = S["cellh"] if c.get("header") == "true" else S["cell"]
                cells.append(Paragraph(" ".join(inline(p) for p in c.findall("paragraph")) or "", sty))
            rows.append(cells); head.append(is_head)
        if not rows: return
        ncol = max(len(r) for r in rows)
        for r in rows:
            while len(r) < ncol: r.append(Paragraph("", S["cell"]))
        weight = [0.0] * ncol
        for r in rows:
            for i, c in enumerate(r):
                weight[i] += max(len(re.sub(r"<[^>]+>", "", c.text)), 4) ** 0.62
        tot = sum(weight) or 1
        w = [max(0.14, x / tot) for x in weight]
        tot = sum(w)
        t = Table(rows, colWidths=[AVAIL * x / tot for x in w],
                  repeatRows=1 if head and head[0] else 0, hAlign="LEFT")
        st = [("VALIGN", (0, 0), (-1, -1), "TOP"),
              ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
              ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
              ("LINEBELOW", (0, 0), (-1, -2), 0.35, RULE),
              ("BOX", (0, 0), (-1, -1), 0.6, RULE)]
        if head and head[0]:
            st += [("BACKGROUND", (0, 0), (-1, 0), BAND),
                   ("LINEBELOW", (0, 0), (-1, 0), 0.7, colors.HexColor("#9a9a9a"))]
        t.setStyle(TableStyle(st))
        into.append(Spacer(1, 3)); into.append(t); into.append(Spacer(1, 11)); return

    if tag == "embed":
        into.append(Paragraph("[ Figure: %s — see the online version of this document ]"
                              % esc(el.get("caption") or "diagram"), S["figure"]))
        return

    for ch in el: render(ch, into)

for el in root: render(el, story)

def furniture(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.95 * inch, 0.58 * inch,
                      "NEU/NYP Archive Project · proposal to the Unit Chief")
    canvas.drawRightString(letter[0] - 0.95 * inch, 0.58 * inch, "%d" % doc.page)
    canvas.setStrokeColor(RULE); canvas.setLineWidth(0.4)
    canvas.line(0.95 * inch, 0.76 * inch, letter[0] - 0.95 * inch, 0.76 * inch)
    canvas.restoreState()

doc = BaseDocTemplate(out, pagesize=letter,
                      leftMargin=0.95 * inch, rightMargin=0.95 * inch,
                      topMargin=0.85 * inch, bottomMargin=0.95 * inch,
                      title="NEU/NYP Archive Project — Proposal to the Unit Chief",
                      author="Josh Bradley", subject="Archive digitization proposal")
doc.addPageTemplates([PageTemplate(id="p", frames=[
    Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="n")], onPage=furniture)])
doc.build(story)
print("wrote", out)
