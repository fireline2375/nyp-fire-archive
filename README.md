# NEU/NYP Archive — prototype

A working prototype for a proposed volunteer project to digitize, catalog and
selectively publish the CAL FIRE Nevada-Yuba-Placer Unit archive.

**Live:** https://nyp-fire-archive.netlify.app

> ## This site contains no real records
>
> Every catalog record, photograph placeholder and personnel name in this
> prototype is **invented sample data**, created to demonstrate the interface.
> No real document, photograph, personnel record or medical information has
> been published. This is not an official CAL FIRE site and uses no CAL FIRE
> seal or official mark.
>
> The one thing that *is* real is the organizational structure — Battalions 11,
> 12, 13, 15, 16 and 17 and the stations under them, taken from the CAL FIRE
> NEU 2026 Strategic Fire Plan unit staffing roster. B-14
> (Smartsville–Columbia Hill) appears in that plan as a planning area rather
> than a staffed battalion, so it is not represented as one here.

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Landing page: search, at-risk triage, browse by incident |
| `browse.html` | Faceted search over the catalog (format, series, incident, station, decade) |
| `item.html` | Single record: viewer, metadata, OCR text, box/folder location |
| `people.html` | Animated personnel tree — unit → battalion → station → era → person |
| `review.html` | The Unit's approval gate. Approve / withhold / redact, with audit trail |
| `story.html` | Feature-story layout built on top of the catalog |
| `contribute.html` | Identify-a-photo queue, family contributions, takedown path |
| `proposal.html` | The full written proposal |

## Design intent

Three ideas drive the whole thing:

1. **Nothing becomes public without the Unit pressing a button.** Records enter
   as `unreviewed` and are invisible to the public until approved. On a live
   build this is enforced by Postgres row-level security, not by application
   code, so a bug in the site cannot leak an unapproved record.
2. **Withheld means invisible.** A withheld record does not appear in the
   public catalog or search index at all — the site does not advertise the
   existence of a sealed file.
3. **No PHI, no personnel records, ever.** Structural exclusions applied at
   ingest, not judgment calls made item by item.

## Running locally

No build step, no dependencies — it is static HTML, CSS and vanilla JS.

```bash
python3 -m http.server 8787 --directory site
# then open http://localhost:8787
```

`.claude/launch.json` defines the same server for the Claude Code preview pane.

## Deploying

The Netlify project is `nyp-fire-archive`. `netlify.toml` sets `publish = "site"`
and adds `X-Robots-Tag: noindex` — the prototype should stay out of search
indexes while it carries sample data.

## Generated files

`site/proposal.html` is generated from the source proposal document rather than
hand-edited, so the page cannot drift from the document:

```bash
python3 tools/docxml2html.py <exported-doc.xml> site/proposal.html
python3 tools/docxml2pdf.py  <exported-doc.xml> NEU-NYP-Archive-Proposal.pdf
```

`tools/docxml2pdf.py` needs `reportlab`; the HTML one needs only the standard library.

## Structure of the sample data

- `site/assets/data.js` — stations (real), incidents, and ~28 sample catalog records
- `site/assets/people.js` — deterministic generator for sample personnel. Names come
  from a word list and a seeded PRNG, so the tree is identical on every load
- `site/assets/app.js` — shared chrome, placeholder artwork, search, card rendering
