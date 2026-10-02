/* NEU/NYP Archive — prototype behaviour: chrome, placeholder plates, search, facets. */

/* ------------------------------------------------------------------ helpers */
const esc = s => String(s == null ? "" : s)
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const qs  = k => new URLSearchParams(location.search).get(k) || "";
const el  = (sel, root=document) => root.querySelector(sel);
const els = (sel, root=document) => [...root.querySelectorAll(sel)];
function seed(str){ let h=2166136261; for(const c of String(str)){ h^=c.charCodeAt(0); h=Math.imul(h,16777619);} return () => { h^=h<<13; h^=h>>>17; h^=h<<5; return ((h>>>0)%10000)/10000; }; }

/* ------------------------------------------------- placeholder "plate" art
   These are generated stand-ins, not scans. Nothing here depicts a real
   photograph — the shapes are procedural, keyed off the record id.          */
const PAL = [
  ["#3b3a36","#8a7f6d","#d8cdb8"], ["#2f3a40","#6d8793","#cddbe0"],
  ["#43362c","#9a7a5a","#e2d2bd"], ["#36402f","#7d8f68","#d6dfc7"],
  ["#3e3340","#85708f","#ddd2e2"], ["#402f2f","#96706a","#e4d0cb"]
];
function plate(it, w=400, h=300){
  const r = seed(it.id + it.type), p = PAL[Math.floor(r()*PAL.length)];
  const g = `g${it.id.replace(/[^a-z0-9]/gi,"")}`;
  let inner = "";
  const horizon = h*(0.46 + r()*0.2);

  if(it.type === "photograph" || it.type === "slide"){
    inner += `<rect width="${w}" height="${h}" fill="url(#${g})"/>`;
    for(let i=0;i<5;i++){
      const y = horizon - i*(h*0.055) - r()*8, amp = 10+r()*22;
      inner += `<path d="M0 ${y} Q ${w*0.25} ${y-amp} ${w*0.5} ${y} T ${w} ${y-amp*0.5} L ${w} ${h} L 0 ${h} Z"
                 fill="${p[0]}" opacity="${0.1+i*0.11}"/>`;
    }
    inner += `<circle cx="${w*(0.6+r()*0.25)}" cy="${horizon-h*0.3}" r="${12+r()*16}" fill="#f0c98a" opacity=".5"/>`;
    if(it.type === "slide")
      inner += `<rect x="6" y="6" width="${w-12}" height="${h-12}" fill="none" stroke="#efe9dc" stroke-width="12"/>
                <rect x="12" y="12" width="${w-24}" height="${h-24}" fill="none" stroke="#cfc6b4" stroke-width="1"/>`;
  }
  else if(it.type === "document"){
    inner += `<rect width="${w}" height="${h}" fill="#efe9dd"/>
              <rect x="${w*0.14}" y="0" width="${w*0.72}" height="${h}" fill="#fdfbf6" stroke="#e0d8c8"/>`;
    for(let i=0;i<13;i++){
      const y = h*0.15 + i*(h*0.062), len = (i%4===0?0.34:0.52+r()*0.14);
      inner += `<rect x="${w*0.19}" y="${y}" width="${w*len}" height="2.4" rx="1" fill="#9c9382" opacity="${i%4===0?0.85:0.5}"/>`;
    }
    inner += `<rect x="${w*0.19}" y="${h*0.075}" width="${w*0.28}" height="5" rx="2" fill="${p[0]}" opacity=".8"/>`;
  }
  else if(it.type === "map"){
    inner += `<rect width="${w}" height="${h}" fill="#f3eee0"/>`;
    for(let i=0;i<9;i++){
      const cx=w*(0.3+r()*0.45), cy=h*(0.3+r()*0.45), rr=16+i*13;
      inner += `<ellipse cx="${cx}" cy="${cy}" rx="${rr*1.35}" ry="${rr}" fill="none"
                 stroke="#a89877" stroke-width="1" opacity=".75"/>`;
    }
    inner += `<path d="M0 ${h*0.7} Q ${w*0.3} ${h*0.55} ${w*0.55} ${h*0.68} T ${w} ${h*0.5}"
               fill="none" stroke="#7f98a8" stroke-width="2.5" opacity=".8"/>
              <path d="M${w*0.08} ${h} L ${w*0.42} ${h*0.1}" stroke="#b5553a" stroke-width="2"
               stroke-dasharray="7 5" opacity=".85" fill="none"/>`;
  }
  else if(it.type === "film" || it.type === "video"){
    inner += `<rect width="${w}" height="${h}" fill="#1e1c19"/>
              <rect x="${w*0.1}" y="0" width="${w*0.8}" height="${h}" fill="url(#${g})" opacity=".55"/>`;
    for(let i=0;i<9;i++){
      const y = 10 + i*(h-20)/8.6;
      inner += `<rect x="${w*0.025}" y="${y}" width="${w*0.05}" height="${h*0.055}" rx="2" fill="#cdc3b2" opacity=".85"/>
                <rect x="${w*0.925}" y="${y}" width="${w*0.05}" height="${h*0.055}" rx="2" fill="#cdc3b2" opacity=".85"/>`;
    }
    if(it.type === "video")
      for(let i=0;i<22;i++)
        inner += `<rect x="${w*0.1}" y="${i*h/22}" width="${w*0.8}" height="1.2" fill="#fff" opacity="${r()*0.08}"/>`;
    inner += `<circle cx="${w/2}" cy="${h/2}" r="${h*0.17}" fill="none" stroke="#efe6d6" stroke-width="2.5" opacity=".75"/>
              <path d="M${w/2-h*0.055} ${h/2-h*0.075} L ${w/2+h*0.085} ${h/2} L ${w/2-h*0.055} ${h/2+h*0.075} Z" fill="#efe6d6" opacity=".8"/>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img"
    aria-label="Generated placeholder for ${esc(it.t)} — not an actual scan">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p[2]}"/><stop offset="1" stop-color="${p[1]}"/>
    </linearGradient></defs>${inner}</svg>`;
}

/* ------------------------------------------------------------------- chrome */
const NAV = [
  ["index.html","Home"], ["browse.html","Browse"], ["people.html","People"], ["story.html","Stories"],
  ["contribute.html","Contribute"], ["review.html","Review queue"], ["proposal.html","The proposal"]
];
function chrome(){
  const here = location.pathname.split("/").pop() || "index.html";
  const head = document.createElement("header");
  head.className = "site";
  head.innerHTML = `<div class="wrap">
    <a class="brand" href="index.html">
      <span class="mark">NYP</span>
      <span class="wordmark">NEU/NYP Archive<small>Prototype &middot; sample data</small></span>
    </a>
    <button class="navtoggle" aria-expanded="false">Menu</button>
    <nav class="main">${NAV.map(([h,l]) =>
      `<a href="${h}"${h===here?' class="on"':""}>${l}</a>`).join("")}</nav>
  </div>`;
  const bar = el('.demobar');
  if(bar) bar.insertAdjacentElement('afterend', head); else document.body.prepend(head);
  const btn = el(".navtoggle", head), nav = el("nav.main", head);
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });

  const f = document.createElement("footer");
  f.className = "site";
  f.innerHTML = `<div class="wrap">
    <div class="fgrid">
      <div>
        <h4>About this site</h4>
        <p style="color:#9c938a;line-height:1.6;margin:0 0 10px">
          A working prototype for a proposed volunteer project to digitize and catalog the
          Nevada-Yuba-Placer Unit archive. Built to show how the archive would look and behave.
        </p>
        <a href="proposal.html">Read the full proposal &rarr;</a>
      </div>
      <div><h4>Explore</h4>
        ${NAV.slice(1,4).map(([h,l]) => `<a href="${h}">${l}</a>`).join("")}
        <a href="browse.html?type=film">At-risk media</a></div>
      <div><h4>For the Unit</h4>
        <a href="signin.html">Sign in (example)</a>
        <a href="review.html">Review queue demo</a>
        <a href="proposal.html#privacy">Privacy safeguards</a>
        <a href="proposal.html#custody">Chain of custody</a></div>
    </div>
    <div class="disc">
      <b>Demonstration prototype.</b> This is not an official CAL FIRE website and is not affiliated with,
      endorsed by, or operated on behalf of CAL FIRE or the Nevada-Yuba-Placer Unit. No CAL FIRE seal, badge,
      or official mark is used. Every catalog record shown here is <b>invented sample data</b> created to
      demonstrate the interface &mdash; none of it is a real archival record, and no real document, photograph,
      personnel record, or medical information has been published. Incident names come from the public
      historical record; the holdings attached to them are fictional. Nothing on this site should be cited
      as a source.
    </div>
  </div>`;
  document.body.appendChild(f);
}

/* ------------------------------------------------------------------ pieces */
function pill(status){ return `<span class="pill ${status}">${STATUS_LABEL[status]}</span>`; }

function card(it){
  const inc = it.inc ? incident(it.inc) : null;
  const risky = it.risk === "critical" || it.risk === "high";
  return `<a class="card" href="item.html?id=${encodeURIComponent(it.id)}">
    <div class="plate">${plate(it)}
      <span class="badge${risky?" risk":""}">${risky ? RISK_LABEL[it.risk] : TYPE_LABEL[it.type]}</span>
    </div>
    <div class="body">
      <p class="ttl">${esc(it.t)}</p>
      <p class="meta">${it.year} &middot; ${inc ? esc(inc.name) : (it.stn ? esc(stationLabel(station(it.stn))) : esc(it.series))}</p>
    </div></a>`;
}

function row(it, q){
  const inc = it.inc ? incident(it.inc) : null;
  let snip = esc(it.d);
  if(q){
    const re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + ")", "ig");
    snip = snip.replace(re, "<mark>$1</mark>");
  }
  return `<a class="row" href="item.html?id=${encodeURIComponent(it.id)}">
    <span class="thumb">${plate(it,148,112)}</span>
    <span style="flex:1;min-width:0">
      <p class="ttl">${esc(it.t)}</p>
      <p class="meta">${TYPE_LABEL[it.type]} &middot; ${it.year}
        ${inc ? "&middot; " + esc(inc.name) : ""}
        ${it.stn ? "&middot; " + esc(stationLabel(station(it.stn))) : ""}
        &middot; ${esc(it.box)} ${esc(it.folder && it.folder !== "—" ? it.folder : "")}</p>
      <p class="snip">${snip}</p>
    </span>
    <span style="flex:none">${pill(it.status)}</span></a>`;
}

/* ------------------------------------------------------------------ search */
function matches(it, q){
  if(!q) return true;
  const inc = it.inc ? incident(it.inc).name : "";
  const stn = it.stn ? station(it.stn).name : "";
  const hay = [it.id, it.t, it.d, it.series, it.fmt, it.bn, inc, stn, it.year,
               TYPE_LABEL[it.type], it.ocr || ""].join(" ").toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w));
}
function wireSearch(formSel){
  const f = el(formSel); if(!f) return;
  f.addEventListener("submit", e => {
    e.preventDefault();
    const v = el("input", f).value.trim();
    location.href = "browse.html" + (v ? "?q=" + encodeURIComponent(v) : "");
  });
}
document.addEventListener("DOMContentLoaded", chrome);
