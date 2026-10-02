/* ---------------------------------------------------------------------------
   SAMPLE PERSONNEL — every name below is MACHINE-GENERATED from a word list.
   These are not real people. No real employee, retiree, roster, personnel file
   or service record was used, and nothing here corresponds to any actual
   person living or dead. Ranks, dates and assignments are synthetic, produced
   by the deterministic generator in this file purely so the tree has something
   to draw. On a live archive this view would be built only from information
   already in the public record, and the Unit would approve it first.
   --------------------------------------------------------------------------- */

const FIRSTS = ["James","Robert","John","Michael","David","William","Richard","Thomas","Charles","Daniel",
  "Mary","Patricia","Linda","Barbara","Susan","Jennifer","Maria","Nancy","Karen","Betty",
  "Frank","Raymond","Arthur","Harold","Eugene","Dale","Wayne","Glen","Roy","Carl",
  "Lester","Virgil","Alvin","Clyde","Orville","Dwight","Marvin","Elmer","Floyd","Vernon"];

const SURNAMES = ["Alder","Barstow","Calder","Danforth","Eastman","Falkner","Gaines","Harlow","Ingram","Jessup",
  "Kerrick","Lathrop","Marchetti","Norcross","Oakley","Pemberton","Quinlan","Rademacher","Stapleton","Thorsen",
  "Underhill","Vandermeer","Whitlock","Yarborough","Ziegler","Ashcroft","Brightwell","Carnahan","Dunlavy","Ellsworth",
  "Fairbanks","Granville","Hollister","Iverson","Jorgensen","Kingsbury","Lindquist","Mapes","Nesbitt","Ormsby",
  "Prescott","Rutherford","Sandoval","Tillotson","Ulrich","Vreeland","Waverly","Yancey","Abernathy","Blackwood",
  "Cromwell","Driscoll","Everhart","Fontaine","Galbraith","Hawthorne","Ironside","Kessler","Lockridge","Montrose"];

const RANKS = [
  { r:"Firefighter",               w:34, lvl:1 },
  { r:"Fire Apparatus Engineer",   w:19, lvl:2 },
  { r:"Fire Captain",              w:17, lvl:3 },
  { r:"Heavy Equipment Operator",  w:8,  lvl:2 },
  { r:"Dispatcher",                w:6,  lvl:2 },
  { r:"Battalion Chief",           w:6,  lvl:4 },
  { r:"Fire Prevention Specialist",w:5,  lvl:2 },
  { r:"Division Chief",            w:3,  lvl:5 },
  { r:"Unit Chief",                w:2,  lvl:6 }
];

const ERAS = [
  { id:"e1", label:"1931–1955", from:1931, to:1955 },
  { id:"e2", label:"1956–1979", from:1956, to:1979 },
  { id:"e3", label:"1980–1999", from:1980, to:1999 },
  { id:"e4", label:"2000–2012", from:2000, to:2012 },
  { id:"e5", label:"2013–present", from:2013, to:2026 }
];
const YEAR_MIN = 1931, YEAR_MAX = 2026;

/* deterministic generator — same tree on every load, in every browser */
function lcg(s){ let x = s >>> 0; return () => (x = (x * 1664525 + 1013904223) >>> 0) / 4294967296; }

function buildPeople(){
  const rnd = lcg(20260929);
  const pick = a => a[Math.floor(rnd() * a.length)];
  const wpick = () => {
    const tot = RANKS.reduce((s,r) => s + r.w, 0);
    let n = rnd() * tot;
    for(const r of RANKS){ if((n -= r.w) <= 0) return r; }
    return RANKS[0];
  };
  const people = [];
  let n = 0;

  STATIONS.forEach(st => {
    const headcount = 4 + Math.floor(rnd() * 5);          // 4–8 per station
    for(let i = 0; i < headcount; i++){
      // roughly 40% are still serving, the rest are spread back through the decades
      let from, to;
      if(rnd() < 0.40){
        from = YEAR_MAX - (2 + Math.floor(rnd() * 30));
        to   = YEAR_MAX;
      } else {
        from = YEAR_MIN + Math.floor(rnd() * 86);
        to   = Math.min(from + 4 + Math.floor(rnd() * 29), YEAR_MAX - 1);
      }
      if(to <= from) to = from + 3;
      const rank = wpick();
      const also = [];
      if(rnd() < 0.22){
        const other = pick(STATIONS);
        if(other.id !== st.id) also.push(other.id);
      }
      people.push({
        id: "P" + (++n).toString().padStart(3,"0"),
        name: pick(FIRSTS) + " " + pick(SURNAMES),
        rank: rank.r, lvl: rank.lvl,
        stn: st.id, bn: st.bn,
        from, to, current: to >= YEAR_MAX,
        also,
        era: (ERAS.find(e => from >= e.from && from <= e.to) || ERAS[ERAS.length-1]).id
      });
    }
  });

  // a handful of unit-level officers, attached to the Unit rather than a station
  for(let i = 0; i < 5; i++){
    const from = 1931 + i * 19 + Math.floor(rnd() * 8);
    const to = Math.min(from + 9 + Math.floor(rnd() * 14), YEAR_MAX);
    people.push({
      id: "P" + (++n).toString().padStart(3,"0"),
      name: pick(FIRSTS) + " " + pick(SURNAMES),
      rank: i % 2 ? "Unit Chief" : "Division Chief",
      lvl: i % 2 ? 6 : 5,
      stn: null, bn: null, from, to, current: to >= YEAR_MAX, also: [],
      era: (ERAS.find(e => from >= e.from && from <= e.to) || ERAS[ERAS.length-1]).id
    });
  }
  return people;
}

const PEOPLE = buildPeople();
const person = id => PEOPLE.find(p => p.id === id);
const activeIn = (p, y) => p.from <= y && p.to >= y;

/* Unit → Battalion → Station → Era → Person */
function buildTree(){
  const bns = [...new Set(STATIONS.map(s => s.bn))].sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ""), 10), nb = parseInt(b.replace(/\D/g, ""), 10);
    if(isNaN(na)) return 1;          // "Unit facilities" sorts to the end
    if(isNaN(nb)) return -1;
    return na - nb;
  });
  return {
    id:"unit", kind:"unit", name:"Nevada-Yuba-Placer Unit", sub:"NEU / NYP",
    children: [
      {
        id:"hq", kind:"hq", name:"Unit Office", sub:"Chiefs and staff",
        children: ERAS.map(e => ({
          id:"hq-" + e.id, kind:"era", name:e.label, era:e,
          children: PEOPLE.filter(p => !p.stn && p.era === e.id)
                          .sort((a,b) => b.lvl - a.lvl || a.from - b.from)
                          .map(p => ({ id:p.id, kind:"person", name:p.name, p }))
        })).filter(e => e.children.length)
      },
      ...bns.map(bn => ({
        id: bn.replace(/\s+/g,"-").toLowerCase(), kind:"battalion", name:bn,
        sub: STATIONS.filter(s => s.bn === bn).length + " stations",
        children: STATIONS.filter(s => s.bn === bn).map(st => ({
          id:"st-" + st.id, kind:"station", name:stationShort(st), sub:st.county + " County", st,
          children: ERAS.map(e => ({
            id:"st-" + st.id + "-" + e.id, kind:"era", name:e.label, era:e,
            children: PEOPLE.filter(p => p.stn === st.id && p.era === e.id)
                            .sort((a,b) => b.lvl - a.lvl || a.from - b.from)
                            .map(p => ({ id:p.id, kind:"person", name:p.name, p }))
          })).filter(e => e.children.length)
        }))
      }))
    ]
  };
}
