/* ---------------------------------------------------------------------------
   SAMPLE CATALOG — demonstration data only.
   Every record below is invented to show how the interface behaves. None of it
   is an actual archival record and none of it describes a real document held by
   any agency. Incident names are drawn from the public historical record;
   the "holdings" attached to them here are fictional placeholders.
   --------------------------------------------------------------------------- */

const INCIDENTS = [
  { id:"49er",       name:"49er Fire",        year:1988, acres:"33,700", note:"Nevada County" },
  { id:"trauner",    name:"Trauner Fire",     year:1994, acres:"—",      note:"Nevada City" },
  { id:"pendola",    name:"Pendola Fire",     year:1999, acres:"11,725", note:"Yuba County" },
  { id:"star",       name:"Star Fire",        year:2001, acres:"16,800", note:"Placer County" },
  { id:"mccourtney", name:"McCourtney Fire",  year:2017, acres:"76",     note:"Grass Valley" },
  { id:"lobo",       name:"Lobo Fire",        year:2017, acres:"821",    note:"Nevada County" },
  { id:"jones",      name:"Jones Fire",       year:2020, acres:"705",    note:"Nevada County" },
  { id:"river",      name:"River Fire",       year:2021, acres:"2,619",  note:"Colfax" },
  { id:"rices",      name:"Rices Fire",       year:2022, acres:"904",    note:"North San Juan" }
];

/* Real NEU structure, taken from the CAL FIRE Nevada-Yuba-Placer Unit
   2026 Strategic Fire Plan (unit staffing roster). Battalions 11, 12, 13, 15,
   16 and 17 are the operational battalions that hold stations; B-14
   (Smartsville–Columbia Hill) appears in the plan as a planning area rather
   than a staffed battalion, so it is not a branch here. */
const STATIONS = [
  { id:"s10",  no:10,  name:"Auburn",          bn:"Battalion 11", county:"Placer", note:"Unit headquarters" },
  { id:"s11",  no:11,  name:"Foresthill",      bn:"Battalion 11", county:"Placer" },
  { id:"s71",  no:71,  name:"Atwood",          bn:"Battalion 11", county:"Placer" },
  { id:"s72",  no:72,  name:"Ophir",           bn:"Battalion 11", county:"Placer" },

  { id:"s20",  no:20,  name:"Nevada City",     bn:"Battalion 12", county:"Nevada", note:"Task Force Rattlesnake (CNA 23)" },
  { id:"s21",  no:21,  name:"Higgins Corner",  bn:"Battalion 12", county:"Nevada" },
  { id:"s42",  no:42,  name:"Columbia Hill",   bn:"Battalion 12", county:"Nevada" },

  { id:"s30",  no:30,  name:"Colfax",          bn:"Battalion 13", county:"Placer" },
  { id:"s136", no:136, name:"Colfax",          bn:"Battalion 13", county:"Placer" },
  { id:"s33",  no:33,  name:"Alta",            bn:"Battalion 13", county:"Placer" },
  { id:"s198", no:198, name:"Alta",            bn:"Battalion 13", county:"Placer" },

  { id:"s50",  no:50,  name:"Truckee",         bn:"Battalion 15", county:"Nevada" },
  { id:"s55",  no:55,  name:"Carnelian Bay",   bn:"Battalion 15", county:"Placer" },

  { id:"s40",  no:40,  name:"Smartsville",     bn:"Battalion 16", county:"Yuba" },
  { id:"s60",  no:60,  name:"Dobbins",         bn:"Battalion 16", county:"Yuba" },
  { id:"s61",  no:61,  name:"Loma Rica",       bn:"Battalion 16", county:"Yuba" },

  { id:"s70",  no:70,  name:"Lincoln",         bn:"Battalion 17", county:"Placer" },
  { id:"s174", no:174, name:"Thermalands",     bn:"Battalion 17", county:"Placer" },
  { id:"s175", no:175, name:"Paige",           bn:"Battalion 17", county:"Placer" },
  { id:"s77",  no:77,  name:"Sunset",          bn:"Battalion 17", county:"Placer" },
  { id:"s178", no:178, name:"Sheridan",        bn:"Battalion 17", county:"Placer" },
  { id:"s79",  no:79,  name:"Dry Creek",       bn:"Battalion 17", county:"Placer" },

  { id:"fecc", no:null, name:"Grass Valley Emergency Command Center", short:"Grass Valley ECC", bn:"Unit facilities", county:"Nevada" },
  { id:"faab", no:null, name:"Grass Valley Air Attack Base",          short:"Air Attack Base", bn:"Unit facilities", county:"Nevada" },
  { id:"fwar", no:null, name:"Washington Ridge Conservation Camp",    short:"Washington Ridge", bn:"Unit facilities", county:"Nevada" },
  { id:"fpfc", no:null, name:"Placer Fire Center",                    bn:"Unit facilities", county:"Placer" }
];

/* "Nevada City 20" / "Grass Valley Air Attack Base" */
const stationLabel = st => st.no ? st.name + " " + st.no : st.name;
/* compact form for the tree, where the label sits between two columns */
const stationShort = st => st.short || stationLabel(st);

/* status: approved | unreviewed | withheld | redacted
   flags:  phi | personnel | civilian | investigation            */
const ITEMS = [
  { id:"NYP-001", t:"Incident Action Plan, Operational Period 3", type:"document", year:1988,
    inc:"49er", stn:"s20", bn:"Battalion 12", series:"Incident Records", fmt:"Paper, letter",
    box:"Box 14", folder:"Folder 3", risk:"low", status:"approved", pages:22,
    d:"Printed IAP covering the third operational period, with division assignments, a communications plan, and a hand-annotated organization chart.",
    ocr:"INCIDENT ACTION PLAN\nINCIDENT NAME: 49er\nOPERATIONAL PERIOD: 0600-1800\n\n1. CONTROL OPERATIONS\n   Division A — structure protection, hold the ridge road.\n   Division B — direct attack off the dozer line constructed overnight.\n\n2. SPECIAL INSTRUCTIONS\n   Watch for snags along the east flank. Spotting reported up to 1/4 mile\n   during afternoon burning period." },

  { id:"NYP-002", t:"Aerial view of the fire perimeter, east flank", type:"photograph", year:1988,
    inc:"49er", stn:"s20", bn:"Battalion 12", series:"Photographs", fmt:"35mm color negative",
    box:"Box 22", folder:"Sleeve 7", risk:"high", status:"approved",
    d:"Color negative showing the eastern perimeter from a fixed-wing aircraft. Dye shift consistent with unrefrigerated storage; color correction applied to the access copy, master retained unaltered." },

  { id:"NYP-003", t:"Unit Log (ICS-214), Division Supervisor", type:"document", year:1988,
    inc:"49er", stn:"s20", bn:"Battalion 12", series:"Incident Records", fmt:"Paper, carbon copy",
    box:"Box 14", folder:"Folder 9", risk:"low", status:"approved", pages:4,
    d:"Carbon copy of a division supervisor's unit log. Second and third sheets are faint but legible under raking light." },

  { id:"NYP-004", t:"Fire progression map, days one through four", type:"map", year:1988,
    inc:"49er", stn:"s20", bn:"Battalion 12", series:"Maps and Plans", fmt:"Oversized, 24×36 in",
    box:"Flat file 2", folder:"Drawer B", risk:"medium", status:"approved",
    d:"Hand-colored progression map on a USGS quadrangle base, with daily perimeters in grease pencil and a legend in the lower right." },

  { id:"NYP-005", t:"Engine company at the staging area", type:"slide", year:1988,
    inc:"49er", stn:"s21", bn:"Battalion 12", series:"Photographs", fmt:"35mm transparency",
    box:"Carousel 4", folder:"Tray 2", risk:"high", status:"approved",
    d:"Kodachrome transparency, mounted. Visible dye fading in the magenta layer. One of roughly 180 slides in this carousel." },

  { id:"NYP-006", t:"Structure protection briefing, 16mm reel", type:"film", year:1979,
    inc:null, stn:"s20", bn:null, series:"Training Material", fmt:"16mm, 400 ft",
    box:"Media tote 1", folder:"Can 3", risk:"critical", status:"unreviewed",
    d:"Training reel on structure protection in the wildland-urban interface. Can shows corrosion and a faint vinegar odor. Flagged for priority transfer." },

  { id:"NYP-007", t:"Station history and roster, Nevada City", type:"document", year:1962,
    inc:null, stn:"s20", bn:"Battalion 12", series:"Station Records", fmt:"Paper, bound",
    box:"Box 2", folder:"Folder 1", risk:"low", status:"redacted", flags:["personnel"], pages:38,
    d:"Typed station history with a personnel roster appended. The roster lists home addresses for the 1962 crew; those columns are masked in the public copy and the unredacted master is held privately." },

  { id:"NYP-008", t:"Daily station log, January through June", type:"document", year:1971,
    inc:null, stn:"s30", bn:"Battalion 13", series:"Station Records", fmt:"Paper, ledger",
    box:"Box 7", folder:"—", risk:"low", status:"approved", pages:140,
    d:"Bound ledger of daily station activity: apparatus checks, drills, run counts, weather, and a running note of who was on shift." },

  { id:"NYP-009", t:"Dozer operations on the Pendola Fire", type:"photograph", year:1999,
    inc:"pendola", stn:"s60", bn:"Battalion 16", series:"Photographs", fmt:"Color print, 5×7",
    box:"Box 31", folder:"Folder 2", risk:"medium", status:"approved",
    d:"Print showing dozer line construction on a steep slope. Writing on the verso identifies the operator and the date; the verso is scanned as a second image." },

  { id:"NYP-010", t:"ICS-209 incident status summaries, complete set", type:"document", year:1999,
    inc:"pendola", stn:null, bn:null, series:"Incident Records", fmt:"Paper, fax copies",
    box:"Box 30", folder:"Folder 4", risk:"medium", status:"approved", pages:31,
    d:"Run of 209s from initial attack through containment. Thermal fax paper, already browning; scanning was prioritized for this reason." },

  { id:"NYP-011", t:"Patient care report attached to incident packet", type:"document", year:1999,
    inc:"pendola", stn:"s60", bn:"Battalion 16", series:"Incident Records", fmt:"Paper, carbonless",
    box:"Box 30", folder:"Folder 9", risk:"low", status:"withheld", flags:["phi"], pages:2,
    d:"Withheld in full. Contains patient-identifying medical information. Cataloged for the Unit's internal record; no public derivative exists and the item does not appear in public search." },

  { id:"NYP-012", t:"Star Fire after-action review, draft with comments", type:"document", year:2001,
    inc:"star", stn:"s11", bn:"Battalion 11", series:"Incident Records", fmt:"Paper, annotated",
    box:"Box 44", folder:"Folder 1", risk:"low", status:"unreviewed", pages:17,
    d:"Draft after-action review carrying several rounds of handwritten comment. Flagged for review: marginalia names individuals and characterizes their decisions." },

  { id:"NYP-013", t:"Helicopter water drop, ridge above the canyon", type:"slide", year:2001,
    inc:"star", stn:"s11", bn:"Battalion 11", series:"Photographs", fmt:"35mm transparency",
    box:"Carousel 9", folder:"Tray 1", risk:"high", status:"approved",
    d:"Transparency in good condition relative to the rest of the tray. Part of a sequence of eleven frames shot from the same position." },

  { id:"NYP-014", t:"Pre-attack plan, Foresthill Divide", type:"map", year:1984,
    inc:null, stn:"s11", bn:"Battalion 11", series:"Maps and Plans", fmt:"Blueline, 30×42 in",
    box:"Flat file 1", folder:"Drawer C", risk:"medium", status:"approved",
    d:"Blueline pre-attack plan with water sources, access roads, and gate locations marked. Several gates annotated by hand in later years." },

  { id:"NYP-015", t:"Apparatus record card, Engine 2341", type:"document", year:1967,
    inc:null, stn:"s10", bn:"Battalion 11", series:"Apparatus and Equipment", fmt:"Index card stock",
    box:"Box 9", folder:"Card file", risk:"low", status:"approved", pages:1,
    d:"Equipment record card: chassis and pump specifications, assignment history, and maintenance notes running about fifteen years." },

  { id:"NYP-016", t:"Academy graduation, class photograph", type:"photograph", year:1958,
    inc:null, stn:"s10", bn:"Battalion 11", series:"Photographs", fmt:"B&W print, 8×10",
    box:"Box 3", folder:"Folder 6", risk:"low", status:"approved",
    d:"Silver gelatin print, mounted on board. Most faces are unidentified — this item is in the identification queue." },

  { id:"NYP-017", t:"Unit newsletter, autumn issue", type:"document", year:1976,
    inc:null, stn:null, bn:null, series:"Publications", fmt:"Paper, mimeograph",
    box:"Box 11", folder:"Folder 2", risk:"medium", status:"approved", pages:8,
    d:"Mimeographed newsletter: promotions, retirements, a season summary, and a long piece on the previous winter's equipment overhaul." },

  { id:"NYP-018", t:"Personnel evaluation file", type:"document", year:1983,
    inc:null, stn:"s40", bn:"Battalion 16", series:"Station Records", fmt:"Paper, folder",
    box:"Box 6", folder:"Folder 14", risk:"low", status:"withheld", flags:["personnel"], pages:12,
    d:"Withheld in full. Performance evaluations and related correspondence for a named employee. Described in the Unit's private catalog only; excluded from the public index entirely." },

  { id:"NYP-019", t:"Columbia Hill station construction, progress photographs", type:"photograph", year:1939,
    inc:null, stn:"s42", bn:"Battalion 12", series:"Station Records", fmt:"B&W negatives",
    box:"Box 1", folder:"Sleeve 2", risk:"high", status:"approved",
    d:"Nitrate-era safety film negatives documenting construction of the station. Sleeves are brittle; handling limited to a single scanning pass." },

  { id:"NYP-020", t:"Mutual aid agreement with the city", type:"document", year:1991,
    inc:null, stn:"s20", bn:"Battalion 12", series:"Station Records", fmt:"Paper, executed copy",
    box:"Box 18", folder:"Folder 5", risk:"low", status:"approved", pages:9,
    d:"Signed mutual aid agreement with an attached map of the overlapping response area." },

  { id:"NYP-021", t:"Jones Fire, structure defense on the east side", type:"photograph", year:2020,
    inc:"jones", stn:"s20", bn:"Battalion 12", series:"Photographs", fmt:"Digital, born-digital",
    box:"—", folder:"Transfer 4", risk:"low", status:"unreviewed", flags:["civilian"],
    d:"Born-digital photograph. Flagged for review: a street address and a vehicle plate are legible in the frame. Candidate for masking rather than withholding." },

  { id:"NYP-022", t:"River Fire evacuation map as posted", type:"map", year:2021,
    inc:"river", stn:"s30", bn:"Battalion 13", series:"Maps and Plans", fmt:"Digital, PDF",
    box:"—", folder:"Transfer 7", risk:"low", status:"approved",
    d:"The evacuation zone map as it was published during the incident, retained as a record of what the public was shown and when." },

  { id:"NYP-023", t:"Rices Fire community meeting, video recording", type:"video", year:2022,
    inc:"rices", stn:null, bn:"Battalion 12", series:"Publications", fmt:"Digital, MP4",
    box:"—", folder:"Transfer 9", risk:"low", status:"approved", dur:"41:18",
    d:"Recording of a public community meeting held during the incident. Already public at the time; retained for the record." },

  { id:"NYP-024", t:"Dedication ceremony, 16mm reel", type:"film", year:1964,
    inc:null, stn:"s40", bn:"Battalion 16", series:"Station Records", fmt:"16mm, 200 ft",
    box:"Media tote 2", folder:"Can 1", risk:"critical", status:"unreviewed",
    d:"Silent reel, apparently of a station dedication. Edge code suggests early 1960s stock. Not yet viewed — there is no projector, and inspection is deferred to the transfer vendor." },

  { id:"NYP-025", t:"Trauner Fire investigation photographs", type:"photograph", year:1994,
    inc:"trauner", stn:"s20", bn:"Battalion 12", series:"Incident Records", fmt:"Color prints",
    box:"Box 27", folder:"Folder 3", risk:"medium", status:"withheld", flags:["investigation"],
    d:"Withheld. Cause-and-origin investigation material. Held in the private catalog pending a Unit determination; closed-case status does not by itself make investigation material publishable." },

  { id:"NYP-026", t:"Lobo Fire initial attack radio log", type:"document", year:2017,
    inc:"lobo", stn:"s21", bn:"Battalion 12", series:"Incident Records", fmt:"Paper, printed",
    box:"Box 51", folder:"Folder 2", risk:"low", status:"approved", pages:6,
    d:"Printed radio log for the first six hours, with times, units, and traffic summarized by the dispatcher." },

  { id:"NYP-027", t:"McCourtney Fire damage inspection sheets", type:"document", year:2017,
    inc:"mccourtney", stn:"s21", bn:"Battalion 12", series:"Incident Records", fmt:"Paper, forms",
    box:"Box 52", folder:"Folder 1", risk:"low", status:"redacted", flags:["civilian"], pages:24,
    d:"Damage inspection forms. Parcel addresses and owner names are masked in the public copy; the unredacted master stays private. The aggregate damage counts remain visible." },

  { id:"NYP-028", t:"Hose testing at the Higgins Corner station", type:"slide", year:1973,
    inc:null, stn:"s21", bn:"Battalion 12", series:"Photographs", fmt:"35mm transparency",
    box:"Carousel 2", folder:"Tray 4", risk:"high", status:"approved",
    d:"Transparency with pronounced warm shift. Useful mainly for the apparatus and the uniform of the period." }
];

const TYPE_LABEL = { document:"Document", photograph:"Photograph", slide:"Slide",
                     film:"Film", map:"Map", video:"Video" };
const RISK_LABEL = { low:"Stable", medium:"Monitor", high:"At risk", critical:"Priority transfer" };
const STATUS_LABEL = { approved:"Public", unreviewed:"Awaiting review", withheld:"Withheld", redacted:"Redacted copy" };
const FLAG_LABEL = { phi:"Health information", personnel:"Personnel record",
                     civilian:"Civilian identifying detail", investigation:"Investigation material" };

/* Items the public site may show. Withheld items never reach a public listing —
   they are visible only in the Unit's private catalog and in the review queue. */
function publicItems(){ return ITEMS.filter(i => i.status === "approved" || i.status === "redacted"); }
function incident(id){ return INCIDENTS.find(x => x.id === id); }
function station(id){ return STATIONS.find(x => x.id === id); }
function item(id){ return ITEMS.find(x => x.id === id); }
