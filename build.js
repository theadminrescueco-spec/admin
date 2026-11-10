// Rebuilds materialandmusestudio.com from the live site with the new images and renamed studies.
const fs = require('fs'), path = require('path');
const SITE = 'https://materialandmusestudio.com/';
const OUT = process.argv[2] || 'site';
const NEW = process.argv[3] || 'new';
const FILES = ['404.html','assets/og/aster-row.jpg','assets/og/common-room.jpg','assets/og/default.jpg','assets/og/dusk.jpg','assets/og/halenne.jpg','assets/og/launch.jpg','assets/og/long-table.jpg','assets/og/portfolio.jpg','assets/portfolio/aster-a.jpg','assets/portfolio/aster-b.jpg','assets/portfolio/aster-c.jpg','assets/portfolio/aster-row.jpg','assets/portfolio/bedside.jpg','assets/portfolio/commonroom-a.jpg','assets/portfolio/commonroom-b.jpg','assets/portfolio/commonroom-c.jpg','assets/portfolio/considered-deck.jpg','assets/portfolio/dusk-a.jpg','assets/portfolio/dusk-b.jpg','assets/portfolio/dusk-c.jpg','assets/portfolio/halenne-a.jpg','assets/portfolio/halenne-b.jpg','assets/portfolio/halenne-brandbook.jpg','assets/portfolio/halenne-c.jpg','assets/portfolio/halenne-launch.jpg','assets/portfolio/halenne-stationery.jpg','assets/portfolio/long-table-room.jpg','assets/portfolio/long-table.jpg','assets/portfolio/longtable-a.jpg','assets/portfolio/longtable-b.jpg','assets/portfolio/longtable-c.jpg','assets/portfolio/wellness-room.jpg','assets/site.css','assets/site.js','assets/video/launch-poster.jpg','assets/video/material-and-muse-launch.mp4','contact.html','index.html','launch.html','partnerships.html','portfolio.html','possibility-blueprint.html','privacy.html','robots.txt','services.html','sitemap.xml','studio.html','study-aster-row.html','study-dusk.html','study-halenne.html','study-hotel-avelline.html','study-the-common-room.html','study-the-long-table.html','terms.html','thank-you.html','work.html'];
const SIZES = {'404.html':4737,'contact.html':9371,'index.html':17523,'work.html':10529};

const P = 'assets/portfolio/';
const sw = a => '<div class="swatches">' + a.map(([n, c]) => `<div class="swatch"><div class="chip" style="background:${c}"></div><span>${n}</span><code>${c}</code></div>`).join('') + '</div>';
const caseArt = (k, a, b, c) => `<div class="case-art"><div class="plate plate--photo plate--wide"><img class="el" src="${P}${k}-a.jpg" alt="${a}" width="1504" height="940" decoding="async"></div><div class="stack"><div class="plate plate--photo plate--wide"><img class="el" src="${P}${k}-b.jpg" alt="${b}" width="896" height="560" loading="lazy" decoding="async"></div><div class="plate plate--photo plate--wide"><img class="el" src="${P}${k}-c.jpg" alt="${c}" width="896" height="560" loading="lazy" decoding="async"></div></div></div>`;
const R = (re, to) => [re, to];
const CA = /<div class="case-art">[\s\S]*?(?=\n  <\/div>\n<\/section>)/;
const SW = /<div class="swatches">[\s\S]*?(?=<div class="type-sample">)/;
const OGI = /(<meta (?:property|name)="(?:og|twitter):image" content="[^"]*assets\/og\/)[a-z-]+(\.jpg")/g;
const OGA = /(<meta (?:property|name)="(?:og|twitter):image:alt" content=")[^"]*(")/g;
const card = (src, alt) => `<div class="plate plate--photo"><img class="el" src="${P}${src}" alt="${alt}" width="896" height="1120" loading="lazy" decoding="async"></div>`;
const imgRe = f => new RegExp('<img class="el" src="assets/portfolio/' + f.replace('.', '\\.') + '"[^>]*>');
const cardImg = (f, src, alt) => R(imgRe(f), `<img class="el" src="${P}${src}" alt="${alt}" width="896" height="1120" loading="lazy" decoding="async">`);
const PLASTER = /<div class="plate mat-plaster " role="img" aria-label="Concept artwork">(?:<div[^>]*><\/div>)*<\/div>/;
const cards = [
  cardImg('halenne-stationery.jpg', 'card-terraluxe.jpg', 'Terraluxe mineral skincare: frosted bottles and jars with gold caps, website concept and gift box.'),
  R(PLASTER, card('card-harrington.jpg', 'The Harrington lobby in oxblood velvet and brass, with stationery, key tag, amenities and in-room dining card.')),
  cardImg('long-table.jpg', 'card-candlelit.jpg', 'Candlelit Dinner for Twelve: a long oxblood and gold table lit by taper candles, with the concept and palette.'),
  cardImg('aster-row.jpg', 'card-rowhouse.jpg', 'The Row House Collection: a restored brick rowhouse, monogram signage, kitchen and brand palette.'),
  cardImg('wellness-room.jpg', 'card-nest.jpg', 'The Nest wellness studio: arched reception, brand book, storefront and amenities in olive, cream and gold.'),
  cardImg('bedside.jpg', 'card-aura.jpg', 'The Aura Lamp: an alabaster shade on an oxblood marble and brass base.')];
const STILL_ALT = 'Burgundy peonies and roses in a pearl vase beside a lamp, a candle, a brass bowl and books on art direction, brand identity and visual storytelling.';
const still = `<div class="plate plate--photo plate--square"><img class="el" src="${P}studio-still-life.jpg" alt="${STILL_ALT}" width="900" height="900" loading="lazy" decoding="async"></div>`;
const stillTall = `<div class="plate plate--photo"><img class="el" src="${P}studio-still-life-tall.jpg" alt="${STILL_ALT}" width="896" height="1120" loading="lazy" decoding="async"></div>`;
const pf = (cls, src, w, h, alt) => `<img${cls ? ' class="pf-wide"' : ''} src="${P}${src}" width="${w}" height="${h}" loading="lazy" decoding="async" alt="${alt}">`;
const pfRe = f => new RegExp('<img(?: class="pf-wide")? src="assets/portfolio/' + f.replace('.', '\\.') + '"[^>]*>');

const rules = {
'index.html': [...cards, R(/<div class="plate mat-linen plate--square" role="img" aria-label="Concept artwork">(?:<div[^>]*><\/div>)*<\/div>/, still)],
'work.html': cards,
'studio.html': [R(PLASTER, stillTall)],
'portfolio.html': [
  R(OGA, '$1Terraluxe mineral skincare brand board.$2'),
  ['Mineral skincare: identity, packaging and launch presentation.', 'Mineral skincare: identity, packaging and website concept.'],
  R(pfRe('halenne-stationery.jpg'), pf(1, 'terraluxe-a.jpg', 1504, 940, 'Terraluxe brand board: frosted bottles and jars with gold caps, website and mobile concepts, olive gift box, T monogram, palette and type pairing.')),
  R(pfRe('halenne-brandbook.jpg'), pf(0, 'terraluxe-b.jpg', 896, 560, 'Terraluxe website concept on a laptop and phone, headed Earth Minerals for Radiant Skin.')),
  R(pfRe('halenne-launch.jpg'), pf(0, 'terraluxe-c.jpg', 896, 560, 'The Terraluxe wordmark and T monogram on textured paper.')),
  ['A brand built in strata. Roman numerals mark each layer of a three-step routine, and the palette of Salt, Sediment, Clay, Basalt and Tide runs from the bottles to the stationery, tissue and clay wax seal.', 'Earth minerals, made luxurious. A T monogram, a Cormorant Garamond and Montserrat pairing, and a palette of olive, taupe, sand, ivory and gold run from the bottles to the website, the gift box and its gold wax seal.'],
  ['<li>Wordmark and clear space</li>', '<li>Wordmark and monogram</li>'], ['<li>Stationery and tissue</li>', '<li>Gift box and unboxing</li>'], ['<li>Launch presentation</li>', '<li>Website and mobile concept</li>'],
  ['Four rowhouses: investor presentation.', 'A historic rowhouse: brand, interiors and sales campaign.'],
  R(pfRe('aster-row.jpg'), pf(1, 'rowhouse-a.jpg', 1504, 940, 'The Row House Collection board: brick facade at dusk, living room and kitchen, RH monogram sign, brochure with floor plans, palette and a mobile tour page.')),
  ['Selected slides from the investor presentation. One idea per slide, large numbers, and charts simple enough to read across a table. Figures shown are illustrative.', 'A strategic redesign and rebrand that turns a historic rowhouse into a modern, market-ready city residence: an RH monogram, signage, interiors, a brochure with floor plans and a mobile page for booking tours.'],
  R(/<li>Investor presentation<\/li>\s*<li>Financial charts<\/li>\s*<li>Project timeline<\/li>\s*<li>Concept visualizations<\/li>/, '<li>Property branding</li>\n      <li>Interior design and space planning</li>\n      <li>Signage and marketing assets</li>\n      <li>Sales campaign</li>'),
  R(pfRe('long-table.jpg'), pf(1, 'candlelit-a.jpg', 1504, 940, 'Candlelit Dinner for Twelve board: oxblood velvet chairs, gold tapers and peonies, a wax-sealed invitation, place card, menu, cocktail and ribboned favor box.')),
  R(pfRe('long-table-room.jpg'), pf(1, 'candlelit-b.jpg', 896, 560, 'The invitation: Candlelit Dinner for Twelve, an intimate evening of dining, conversation and connection.')),
  ['Four courses on a single folded menu set in an italic serif, and a mood board of linen, gold satin, figs, olive branches and pearls so everyone styling the evening works from one reference.', 'A wax-sealed invitation, a three-course menu, hand-lettered place cards and a thank-you favor, all in oxblood, ivory and gold, so everyone styling the evening works from one reference.'],
  ['<li>Moodboard</li>', '<li>Invitation and place cards</li>\n      <li>Floral direction</li>'],
  ['Mood studies for interiors.', 'Mood studies for spaces and objects.'],
  R(pfRe('wellness-room.jpg'), pf(0, 'nest-a.jpg', 1504, 940, 'The Nest Wellness Studio board: arched reception, practice room, brand book, member guide, storefront, amenities and launch page.')),
  R(pfRe('bedside.jpg'), pf(0, 'aura-a.jpg', 1504, 940, 'The Aura Lamp board: alabaster shade on oxblood marble and brass, material swatches, three finishes and gift packaging.')),
  ['The practice room is from The Common Room, a neighborhood wellness studio, and the bedside scene is from Dusk, a lamp that follows the sun.', 'The wellness board is from The Nest, a neighborhood studio, and the lamp board is from The Aura Lamp, a sculptural light that follows the sun.']],
'study-halenne.html': [R(OGI, '$1terraluxe$2'), R(OGA, '$1Terraluxe mineral skincare brand board.$2'),
  R(CA, caseArt('terraluxe', 'Terraluxe brand board: frosted bottles and stone-textured jars with gold caps, website and mobile concepts, olive gift box, monogram, palette and type pairing.', 'Terraluxe website concept on a laptop and phone, headed Earth Minerals for Radiant Skin.', 'The Terraluxe wordmark and T monogram on textured paper.')),
  ['three mineral-based products ready to sell: a cleanser, a serum and a balm', 'four mineral-based products ready to sell: a cleanser, a serum, a repair cream and an exfoliant'],
  ['works for three products now', 'works for four products now'],
  ['a three-step routine built in layers like the ground itself', 'a simple daily ritual: cleanse, restore, renew'],
  ['<p><strong>Name.</strong> Halenne, drawn from halite, the mineral form of salt. Soft to say and easy to spell, with a name check required before use.</p>', '<p><strong>Name.</strong> Terraluxe, joining terra, the earth, with luxe. It says mineral origin and premium care in one word, with a name check required before use.</p>'],
  R(/<p><strong>Product architecture\.<\/strong>[\s\S]*?<\/p>/, '<p><strong>Product architecture.</strong> Four products named plainly for what they do, each with a two-word promise: Mineral Cleanser (Purify + Restore), Radiant Mineral Serum (Brighten + Firm), Mineral Repair Cream (Nourish + Strengthen) and Mineral Exfoliant (Polish + Renew). New products can join without renaming the range.</p>'),
  R(/<p><strong>Packaging\.<\/strong>[\s\S]*?<\/p>/, '<p><strong>Packaging.</strong> Frosted glass and stone-textured jars with brushed gold caps and a T monogram. Orders ship in an olive gift box with tissue and a gold wax seal, so the unboxing carries the same mineral warmth as the products.</p>'),
  ['Salt, sediment and stone.', 'Earth, stone and gold.'],
  R(SW, sw([['Olive', '#3B3622'], ['Taupe', '#9C8A76'], ['Sand', '#E3D3BF'], ['Ivory', '#F4EEE6'], ['Gold', '#B58A4C']])),
  ['Layer II <em>Restore</em>', 'The Mineral <em>Ritual</em>'],
  ['A high-contrast editorial serif for names, with a wide, quiet sans-serif for ingredients and directions.', 'Cormorant Garamond for headlines and product names, with Montserrat for body copy, ingredients and the website.'],
  ['Imagery shows stone at the shoreline, salt crystals in raking light and hands mid-ritual, always in natural light.', 'Imagery shows rose quartz and raw crystal, stone veined with gold and close textures of cream and water, always in warm natural light.'],
  R(/<ol class="journey">[\s\S]*?<\/ol>/, '<ol class="journey"><li><strong>Discover</strong><span>A campaign image of raw crystal and gold-veined stone, with one line: Earth Minerals for Radiant Skin.</span></li><li><strong>Website</strong><span>A calm storefront that opens on The Mineral Ritual and lets each product be shopped by the step it plays.</span></li><li><strong>Unboxing</strong><span>An olive gift box sealed in gold, with tissue and a card on where the minerals come from.</span></li><li><strong>Ritual</strong><span>A ritual card that sets the order: cleanse, exfoliate, treat, repair.</span></li><li><strong>Refill</strong><span>Refills keep the glass and stone jars in use, so the vessel stays on the shelf.</span></li></ol>'),
  ['shipping cost of weighted glass', 'shipping cost of glass and stone-finish jars']],
'study-hotel-avelline.html': [R(OGI, '$1harrington$2'), R(OGA, '$1The Harrington boutique hotel brand collage.$2'),
  R(CA, caseArt('harrington', 'The Harrington lobby: oxblood velvet seating, olive trees, brass reception desk and the H monogram wordmark.', 'A refreshed guest room with an oxblood velvet throw and cushions, brass lamps and cream linen.', 'The Harrington stationery: H monogram on oxblood and cream cards, a welcome card and a key card.')),
  ['Warm plaster-toned walls, oak, linen and layered lighting', 'Warm neutral walls, oxblood velvet, cream linen and layered lighting'],
  ['<p><strong>Identity.</strong> A refined wordmark, brass room tokens in place of plastic cards where systems allow, and letterpress stationery.</p>', '<p><strong>Identity.</strong> A serif H monogram and wordmark, brass signage, oxblood leather key tags in place of plastic cards where systems allow, letterpress stationery and house-branded bath amenities.</p>'],
  ['Plaster, oak and lamplight.', 'Oxblood, brass and lamplight.'],
  R(SW, sw([['Oxblood', '#5A1A22'], ['Cream', '#EFE6D8'], ['Brass', '#B08D57'], ['Stone', '#CFC3B2'], ['Night', '#26201C']])),
  ['Mood boards focus on material and light: limewash walls, ribbed glass lamps, oxblood leather, aged brass and linen. Concept visualizations show the lobby at dusk and one refreshed guest room.', 'The board focuses on material and light: oxblood velvet, aged brass, warm stone, olive trees and cream linen. Concept visualizations show the lobby, a refreshed guest room and the touchpoints in between: signage, key tags, amenities, the welcome card and the in-room dining menu.'],
  ['A brass key token', 'An oxblood key tag']],
'study-the-long-table.html': [R(OGI, '$1candlelit$2'), R(OGA, '$1Candlelit Dinner for Twelve event concept board.$2'),
  ['The Long Table: a dinner for twelve <em>lit only by candles.</em>', 'Candlelit Dinner for Twelve: an evening <em>lit only by candles.</em>'],
  R(CA, caseArt('candlelit', 'Candlelit Dinner for Twelve board: a long table with oxblood velvet chairs, gold tapers and peonies, the invitation, place card, menu, cocktail and favor box.', 'The invitation: Candlelit Dinner for Twelve, an intimate evening of dining, conversation and connection.', 'Oxblood peonies and hydrangeas with white orchids in a gold vessel among candles.')),
  ['Heavy undyed linen to the floor, with a runner of low greenery and fruit rather than tall arrangements.', 'A dark stone top left bare, with gold chargers, oxblood napkins and low clusters of peonies, hydrangeas and white orchids rather than tall arrangements.'],
  ["Printed on a single folded sheet in the evening's palette, with each course titled after a decade of the host's life.", "Three courses on a gold-edged card in the evening's palette: roasted beet and burrata, a choice of herb-crusted salmon or braised short rib, and a dark chocolate tart."],
  ['Linen, wax and late harvest.', 'Oxblood, gold and candlelight.'],
  R(SW, sw([['Oxblood', '#5E1220'], ['Plum', '#3E1424'], ['Ivory', '#EFE4D2'], ['Gold', '#C59A55'], ['Olive', '#5C6243']])),
  ['The <em>forties</em>', 'Dinner <em>for Twelve</em>'],
  ['Mood boards focus on candlelight on linen, ripe figs and grapes, olive branches, stoneware and amber glass. Concept visualizations show the table before guests arrive and the room once the candles are lit.', 'The board brings together oxblood velvet, gold tapers and votives, deep red peonies with white orchids, a wax-sealed invitation, a gold-edged menu, hand-lettered place cards, a signature cocktail and a ribboned thank-you gift.']],
'study-aster-row.html': [R(OGI, '$1rowhouse$2'), R(OGA, '$1The Row House Collection repositioning board.$2'),
  ['Aster Row: an investor presentation <em>built on clarity.</em>', 'The Row House Collection: historic soul, <em>modern city living.</em>'],
  ['A repositioning concept and investor presentation for a group of four vacant rowhouses, designed so private investors can see the opportunity and its risks at once.', 'A repositioning concept, brand and investor presentation for a group of four vacant rowhouses, designed so residents see a home worth choosing and investors see the opportunity and its risks at once.'],
  R(CA, caseArt('rowhouse', 'The Row House Collection board: a charcoal brick facade at dusk, living room, kitchen, RH monogram sign, brochure with floor plans, palette and a mobile tour page.', 'A living room with a cream curved sofa, black marble table, brass lamp and burgundy hydrangeas.', 'The brochure spread: Modern City Living with Historic Soul.')),
  R(/(<p><strong>Concept\.<\/strong>[^<]*<\/p>)/, '$1<p><strong>Identity.</strong> An RH monogram in brass on charcoal, used on the hanging sign, key fobs, the brochure and a mobile page for booking tours, under the line Modern City Living with Historic Soul.</p>'),
  ['A resident-facing brochure in the same identity, used later for leasing.', 'A resident-facing brochure in the same identity, with floor plans for all three levels, used later for leasing and the sales campaign.'],
  ['Brick, limestone and iron.', 'Charcoal, brass and old brick.'],
  R(SW, sw([['Charcoal', '#26231F'], ['Cream', '#EEE7DA'], ['Olive', '#4E5236'], ['Rust', '#7A2E1E'], ['Brass', '#B08A4E']])),
  ['adds pale oak floors and simple, durable finishes.', 'adds charcoal cabinetry, black marble, warm walnut, brass lighting and soft cream upholstery.'],
  ['Visualizations show one front room and one garden view, each captioned as a concept.', 'Visualizations show the facade at dusk, the living room and the kitchen, each captioned as a concept.']],
'study-the-common-room.html': [R(OGI, '$1nest$2'), R(OGA, '$1The Nest Wellness Studio moodboard.$2'),
  R(CA, caseArt('nest', 'The Nest Wellness Studio board: arched reception with a gold lotus mark, practice room, brand book, member guide, storefront, amenities and launch page.', 'The Nest amenities: eucalyptus and cedar body wash, a restore salt soak and an olive candle.', 'The grand-launch page on a phone beside the opening-week schedule.')),
  ['<p><strong>Identity.</strong> A simple wordmark with an open doorway symbol, set in a friendly serif, with a weekly timetable designed as a printed poster for the window.</p>', '<p><strong>Identity.</strong> A spaced serif wordmark with a gold lotus mark, built around five pillars (movement, recovery, nourishment, restoration and community), with a member guide, a member card, house amenities and a window that lists the classes: yoga, Pilates, breathwork and recovery.</p>'],
  ['The storefront becomes a front room with a long oak bench, tea and a noticeboard.', 'The storefront becomes a front room with an arched, softly lit reception, a long bench, tea and a noticeboard.'],
  ['Limewash, oak and morning light.', 'Olive, stone and soft gold.'],
  R(SW, sw([['Cream', '#F1EBDD'], ['Stone', '#C9C2B0'], ['Sage', '#6E7556'], ['Olive', '#3D4430'], ['Gold', '#A88552']])),
  ['Mood boards show limewash and oak, linen curtains, handmade ceramics, plants in the window and early light across a wooden floor. Visualizations show the front room from the street and the practice room at dusk.', 'The board shows the arched reception and practice room, the brand book and member guide, the storefront from the street, eucalyptus and cedar amenities, and the grand-launch page with the opening-week schedule.']],
'study-dusk.html': [R(OGI, '$1aura$2'), R(OGA, '$1The Aura Lamp editorial collection board.$2'),
  ['Dusk: a home light that <em>follows the sun.</em>', 'The Aura Lamp: a sculptural light that <em>follows the sun.</em>'],
  ['for a black table lamp that warms and dims with the day outside.', 'for a sculptural table lamp in stone and brass that warms and dims with the day outside.'],
  R(CA, caseArt('aura', 'The Aura Lamp board: an alabaster shade over a curved brass arm and oxblood marble column, with materials, the collection and packaging.', 'The collection: the lamp in travertine, rosso marble and nero marble.', 'The packaging: an oxblood box stamped in gold, with an ivory satin tray and monogrammed card.')),
  R(/<p><strong>Product\.<\/strong>[\s\S]*?<\/p>/, '<p><strong>Product.</strong> A domed shade of translucent alabaster over a curved brushed-brass arm and a solid marble column, sized as a bedside or console lamp. The stone diffuses the light, so the bulb is never seen. Three finishes: travertine, rosso marble and nero marble.</p>'),
  R(/<p><strong>Name\.<\/strong>[\s\S]*?<\/p>/, '<p><strong>Name.</strong> The Aura Lamp: the soft field of light around the object is the product. A trademark search is required before use.</p>'),
  R(/<p><strong>Identity\.<\/strong>[\s\S]*?<\/p>/, '<p><strong>Identity.</strong> A classical serif wordmark in spaced capitals, signed with the Material &amp; Muse monogram.</p>'),
  R(/<p><strong>Packaging\.<\/strong>[\s\S]*?<\/p>/, '<p><strong>Packaging.</strong> A deep oxblood box stamped in gold, opening onto an ivory satin-lined tray with a monogrammed card.</p>'),
  ['Black, ivory and the last hour of light.', 'Stone, brass and the last hour of light.'],
  R(SW, sw([['Alabaster', '#EADCC6'], ['Rosso', '#5A1A1E'], ['Brass', '#B48A4A'], ['Travertine', '#E2D6C3'], ['Walnut', '#4A2E1F']])),
  ['d u s <em>k</em>', 'The <em>Aura</em> Lamp'],
  ['Lowercase, widely spaced and set in a quiet serif, with each letter a shade lighter than the last.', 'Spaced capitals in a classical serif, with italic serif lines for the story.'],
  ['AI-assisted visualizations show the lamp on a writing desk in afternoon light, in a candlelit reading corner at night, and in its pearl packaging.', 'AI-assisted visualizations show the lamp on a marble console beside oxblood peonies, the three finishes side by side, and the gift packaging.'],
  ['The pearl sleeve slides away to reveal the lamp resting on ivory silk, with a handwritten card.', 'The oxblood lid lifts to reveal the lamp resting on ivory satin, with a monogrammed card.'],
  ['Ceramic and wood suppliers', 'Stone, alabaster and brass suppliers']]
};
const GLOBAL = [[/Hotel Avelline/g, 'The Harrington'], [/Avelline/g, 'The Harrington'], [/Halenne/g, 'Terraluxe'], [/The Long Table/g, 'Candlelit Dinner for Twelve'], [/Aster Row/g, 'The Row House Collection'], [/The Common Room/g, 'The Nest'], [/\bDusk\b/g, 'The Aura Lamp']];
const GLOBAL_FILES = ['index.html', 'work.html', 'portfolio.html', 'study-halenne.html', 'study-hotel-avelline.html', 'study-the-long-table.html', 'study-aster-row.html', 'study-the-common-room.html', 'study-dusk.html'];
const LEFT = /Halenne|Avelline|Aster Row|Common Room|Long Table|\bDusk\b|mat-plaster |mat-linen plate--square/g;

(async () => {
  const report = {};
  for (const f of FILES) {
    const r = await fetch(SITE + f, { headers: { 'cache-control': 'no-cache' } });
    if (!r.ok) throw new Error(f + ' ' + r.status);
    let buf = Buffer.from(await r.arrayBuffer());
    if (/\.(html|xml|txt)$/.test(f)) {
      let s = buf.toString('utf8').replace(/<script async src="\/\.netlify\/scripts\/[^"]*"[^>]*><\/script>\n?$/, '');
      // restore Netlify Forms attributes that Netlify strips when serving
      s = s.replace(/<form ([^>]*name='project-inquiry'[^>]*)>/, (m, a) => /netlify/.test(a) ? m : `<form ${a} data-netlify="true" netlify-honeypot="company-website">`);
      const miss = [];
      (rules[f] || []).forEach(([a, b], i) => {
        if (typeof a === 'string') { if (!s.includes(a)) miss.push(i); s = s.split(a).join(b); }
        else { const re = new RegExp(a.source, a.flags); if (!re.test(s)) miss.push(i); s = s.replace(new RegExp(a.source, a.flags), b); }
      });
      if (GLOBAL_FILES.includes(f)) for (const [a, b] of GLOBAL) s = s.replace(a, b);
      if (rules[f] || GLOBAL_FILES.includes(f)) report[f] = { miss, left: (s.match(LEFT) || []).filter(x => !(f === 'studio.html' && x === 'mat-plaster ')) };
      if (/<form/.test(s)) report[f + ' form'] = (s.match(/<form[^>]*>/g) || []).join(' | ');
      buf = Buffer.from(s, 'utf8');
    }
    fs.mkdirSync(path.join(OUT, path.dirname(f)), { recursive: true });
    fs.writeFileSync(path.join(OUT, f), buf);
  }
  // new images
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const p of walk(NEW)) { const rel = path.relative(NEW, p); fs.mkdirSync(path.join(OUT, path.dirname(rel)), { recursive: true }); fs.copyFileSync(p, path.join(OUT, rel)); }
  fs.writeFileSync(path.join(OUT, 'netlify.toml'), '[build]\n  publish = "."\n\n[[headers]]\n  for = "/*"\n  [headers.values]\n    X-Frame-Options = "SAMEORIGIN"\n    X-Content-Type-Options = "nosniff"\n    Referrer-Policy = "strict-origin-when-cross-origin"\n');
  // check every local image reference resolves
  const missing = [];
  for (const f of FILES.filter(x => x.endsWith('.html'))) {
    const s = fs.readFileSync(path.join(OUT, f), 'utf8');
    for (const m of s.matchAll(/(?:src|content)="(?:https:\/\/materialandmusestudio\.com\/)?(assets\/[^"]+\.(?:jpg|png|mp4))"/g)) if (!fs.existsSync(path.join(OUT, m[1]))) missing.push(f + ' -> ' + m[1]);
  }
  report.missingRefs = missing;
  console.log(JSON.stringify(report, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
