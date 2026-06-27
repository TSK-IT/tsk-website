/* ============================================================
   TSK — individual product page builder
   ============================================================ */
window.PAGE_READY = function(){
  const {C,$,$$,param,product,imgFull,imgCard,divMeta,productCard,reveal,el}=window.TSK;
  const p = product(param('id')) || C.products[0];
  const meta = divMeta(p.division);
  document.title = `${p.name} — ${meta.title} · TSK`;

  /* ---- SEO: Product structured data + dynamic meta ---- */
  (function(){
    const url='https://www.thestellarkraft.com/product.html?id='+p.id;
    const img='https://www.thestellarkraft.com/'+imgFull(p.hero);
    const desc=(p.description||p.tagline||'').slice(0,300);
    const setMeta=(sel,val)=>{const m=document.querySelector(sel);if(m)m.setAttribute('content',val);};
    setMeta('meta[name="description"]',desc); setMeta('meta[property="og:title"]',p.name+' — '+meta.title+' · TSK');
    setMeta('meta[property="og:description"]',desc); setMeta('meta[name="twitter:title"]',p.name+' · TSK');
    setMeta('meta[name="twitter:description"]',desc);
    const ld=document.createElement('script'); ld.type='application/ld+json';
    ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"Product","name":p.name,"sku":p.code,
      "category":meta.title,"image":img,"description":desc,
      "brand":{"@type":"Brand","name":"TSK — The Stellar Kraft"},
      "material":(p.materials||[]).join(", "),
      "manufacturer":{"@type":"Organization","name":"The Stellar Kraft","url":"https://www.thestellarkraft.com"},
      "offers":{"@type":"Offer","availability":"https://schema.org/MadeToOrder","priceCurrency":"USD","url":url,"seller":{"@type":"Organization","name":"The Stellar Kraft"}}});
    document.head.appendChild(ld);
  })();

  /* ---- finish → CSS filter (live visualisation) ---- */
  const FINISH_FX = {
    'Champagne Gold':'sepia(.32) saturate(1.25) brightness(1.06) hue-rotate(-8deg)',
    'Gold PVD':'sepia(.5) saturate(1.5) brightness(1.05) contrast(1.05) hue-rotate(-12deg)',
    'Rose Gold':'sepia(.32) saturate(1.35) hue-rotate(-22deg) brightness(1.06)',
    'Mirror Polish':'saturate(.82) brightness(1.13) contrast(1.12)',
    'Brushed Finish':'saturate(.72) brightness(1.0) contrast(.96)',
    'Chrome':'grayscale(.42) brightness(1.16) contrast(1.12)',
    'Bronze':'sepia(.55) saturate(1.15) brightness(.9) hue-rotate(-10deg)',
    'Matte Black':'grayscale(.62) brightness(.66) contrast(1.12)',
    'Powder Coated Finish':'saturate(.9) brightness(.95) contrast(1.02)'
  };
  const FINISH_DOT = {
    'Champagne Gold':'linear-gradient(135deg,#f0e2bf,#c9a86a)',
    'Gold PVD':'linear-gradient(135deg,#e7c873,#b8860b)',
    'Rose Gold':'linear-gradient(135deg,#e9c1b1,#c98a72)',
    'Mirror Polish':'linear-gradient(135deg,#fff,#aab0b8 55%,#e8ebef)',
    'Brushed Finish':'linear-gradient(135deg,#c5c8ce,#9aa0a8)',
    'Chrome':'linear-gradient(135deg,#fdfdff,#b6bcc4 50%,#dfe3e8)',
    'Bronze':'linear-gradient(135deg,#a87f4d,#6e5230)',
    'Matte Black':'linear-gradient(135deg,#26262b,#0d0d10)',
    'Powder Coated Finish':'linear-gradient(135deg,#3a3a42,#1c1c22)'
  };
  const MAT_DOT = {
    'Stainless Steel 304':'linear-gradient(135deg,#eef0f3,#aab0b8 60%,#d6dade)',
    'Stainless Steel 316':'linear-gradient(135deg,#e6e9ee,#9098a2 60%,#cfd4da)',
    'Brass':'linear-gradient(135deg,#d8bd7e,#a8843f)',
    'Bronze':'linear-gradient(135deg,#a87f4d,#6e5230)',
    'Aluminium':'linear-gradient(135deg,#dfe2e7,#b3b8bf)',
    'Crystal':'linear-gradient(135deg,rgba(255,255,255,.9),rgba(180,205,225,.6))',
    'Hand-blown Glass':'linear-gradient(135deg,rgba(220,235,245,.85),rgba(150,190,210,.6))',
    'FRP':'linear-gradient(135deg,#efeadd,#cfc7b4)',
    'Custom Composites':'linear-gradient(135deg,#7a756c,#46423c)'
  };
  const MATG = C.materials_glossary||{};

  /* ---- hero / intro ---- */
  $('#pHero').innerHTML = `<img class="float" id="pHeroImg" src="${imgFull(p.hero)}" alt="${p.name}">`;
  $('#pDivLink').textContent = meta.title; $('#pDivLink').href = `collection.html?division=${p.division}`;
  $('#pCrumb').textContent = p.name;
  $('#pCode').textContent = `${p.code} · ${meta.kicker}`;
  $('#pName').textContent = p.name;
  $('#pTag').textContent = p.tagline;
  $('#pChips').innerHTML = [p.collection, p.materials[0], p.finishes[0]].map(c=>`<span class="chip">${c}</span>`).join('');
  $('#pColl').textContent = p.collection;
  $('#pDesc').textContent = p.description;
  $('#pSector').innerHTML = `Conceived for: <b style="color:var(--silver)">${p.sector}</b> environments.`;

  /* hero parallax + finish on hero echoes finish selector */
  if(typeof gsap!=='undefined' && window.ScrollTrigger){
    gsap.to('#pHeroImg',{scale:1.12,ease:'none',scrollTrigger:{trigger:'.p-hero',start:'top top',end:'bottom top',scrub:true}});
  }

  /* ---- 2 · gallery ---- */
  const gal = (p.gallery&&p.gallery.length?p.gallery:[p.hero]);
  const spans=['g big','g tall','g wide','g sq','g wide','g sq'];
  $('#pGallery').innerHTML = gal.map((n,i)=>`<div class="${spans[i%spans.length]} reveal" data-zoom="${imgFull(n)}"><img src="${imgCard(n)}" alt="${p.name} view ${i+1}" loading="lazy"></div>`).join('');

  /* ---- 3 · technical drawings ---- */
  const tech = p.technical&&p.technical.length?p.technical:[];
  let techHTML = tech.map((n,i)=>`<div class="g ${i%2?'tall':'big'} reveal" data-zoom="${imgFull(n)}"><img src="${imgCard(n)}" alt="Technical drawing" loading="lazy"></div>`).join('');
  techHTML += `<div class="g ${tech.length%2?'tall':'big'} reveal">${elevationSVG(p)}</div>`;
  $('#pTech').innerHTML = techHTML;

  /* ---- 4 · structural engineering ---- */
  const eng = ENG[p.division] || ENG.lighting;
  $('#pEngSvg').innerHTML = engSVG(p.division);
  $('#pEngLead').textContent = eng.lead;
  $('#pEngList').innerHTML = eng.rows.map(r=>`<li><b>${r[0]}</b><span>${r[1]}</span></li>`).join('');

  /* ---- 5 · material selector ---- */
  const matWrap=$('#pMat');
  matWrap.innerHTML = p.materials.map((m,i)=>`<button class="swatch ${i===0?'active':''}" data-m="${m}"><span class="dot" style="background:${MAT_DOT[m]||'#888'}"></span><span>${m}</span></button>`).join('');
  $('#pMatImg').src = imgFull(gal[1]||p.hero);
  const setMat=m=>{ $('#pMatRead').textContent=m; $('#pMatDesc').textContent=MATG[m]||''; };
  setMat(p.materials[0]);
  $$('#pMat .swatch').forEach(s=>s.addEventListener('click',()=>{
    $$('#pMat .swatch').forEach(x=>x.classList.remove('active')); s.classList.add('active'); setMat(s.dataset.m);
  }));

  /* ---- 6 · finish selector (live filter on preview + hero) ---- */
  const finWrap=$('#pFin');
  finWrap.innerHTML = p.finishes.map((f,i)=>`<button class="swatch ${i===0?'active':''}" data-f="${f}"><span class="dot" style="background:${FINISH_DOT[f]||'#888'}"></span><span>${f}</span></button>`).join('');
  $('#pFinImg').src = imgFull(p.hero);
  const setFin=f=>{ const fx=FINISH_FX[f]||'none'; $('#pFinRead').textContent=f; $('#pFinImg').style.filter=fx; const hi=$('#pHeroImg'); if(hi)hi.style.filter=fx; };
  setFin(p.finishes[0]);
  $$('#pFin .swatch').forEach(s=>s.addEventListener('click',()=>{
    $$('#pFin .swatch').forEach(x=>x.classList.remove('active')); s.classList.add('active'); setFin(s.dataset.f);
  }));

  /* ---- 9 · specs ---- */
  $('#pSpecs').innerHTML = Object.entries(p.specs).map(([k,v])=>`<div class="row"><b>${k}</b><span>${v}</span></div>`).join('');

  /* ---- 10 · downloads ---- */
  const dls=[
    ['Technical PDF','Full specification sheet','▤'],
    ['CAD / DWG','Architect drawing pack','▦'],
    ['Engineering','Load & mounting details','⚙'],
    ['Spec Sheet','Print-ready data sheet','✎'],
  ];
  $('#pDownloads').innerHTML = dls.map(d=>`<a class="dl reveal" href="#enquire" data-trans="" onclick="TSKreqDownload('${d[0]}');return false;"><div class="dl-ic" style="font-size:26px">${d[2]}</div><b>${d[0]}</b><small>${d[1]}</small></a>`).join('');

  /* ---- 11 · related ---- */
  const rel=(p.related||[]).map(product).filter(Boolean);
  $('#pRelated').innerHTML = (rel.length?rel:C.products.filter(x=>x.division===p.division&&x.id!==p.id).slice(0,4)).map(r=>productCard(r)).join('');

  /* ---- lightbox ---- */
  const lb=$('#lb'), lbImg=$('#lbImg');
  document.addEventListener('click',e=>{
    const z=e.target.closest('[data-zoom]'); if(z){ lbImg.src=z.dataset.zoom; lb.style.display='flex'; }
    if(e.target.closest('#lb')) lb.style.display='none';
  });

  /* ---- SEO: breadcrumb + meta refinement (Product schema already injected above) ---- */
  try{
    var crumb={"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
      {"@type":"ListItem","position":1,"name":"Home","item":"https://www.thestellarkraft.com/"},
      {"@type":"ListItem","position":2,"name":meta.title,"item":"https://www.thestellarkraft.com/collection.html?division="+p.division},
      {"@type":"ListItem","position":3,"name":p.name,"item":"https://www.thestellarkraft.com/product.html?id="+p.id}
    ]};
    var sc=document.createElement('script'); sc.type='application/ld+json'; sc.textContent=JSON.stringify(crumb); document.head.appendChild(sc);
    var md=document.querySelector('meta[name="description"]'); if(md) md.setAttribute('content', p.name+' — '+p.tagline+'. '+(p.description||'').slice(0,110));
    var ot=document.querySelector('meta[property="og:title"]'); if(ot) ot.setAttribute('content', p.name+' · '+meta.title+' | TSK');
  }catch(e){}

  reveal(); if(window._cursorHook)window._cursorHook();
  setTimeout(()=>{ if(window.ScrollTrigger)ScrollTrigger.refresh(); },400);
};

/* ===== engineering content ===== */
const ENG={
  lighting:{lead:'Each suspended system is engineered as a load-balanced structure — concealed canopies, aircraft-grade cabling and independent safety circuits carry the piece invisibly.',
    rows:[['Suspension','Aircraft cable · concealed canopy'],['Primary load','Distributed steel spreader plate'],['Safety factor','5× rated working load'],['Electrical','Low-voltage driver · DALI control'],['Seismic','Engineered restraint cabling'],['Service','Tool-free lowering access']]},
  ceilings:{lead:'Ceiling systems hang from a concealed adjustable track grid — every module independently rod-suspended and levelled, with integrated linear light and acoustic backing.',
    rows:[['Suspension','Concealed track + adjustable rod'],['Module fixing','Quick-lock bracket system'],['System weight','1.5–9 kg/m² engineered'],['Light integration','Linear LED, dimmable'],['Acoustic','NRC up to 0.75 backing'],['Fire rating','Class 0 / B-s1,d0']]},
  sculpture:{lead:'Monumental works are engineered from an internal 316L armature anchored to a reinforced foundation — wind, water and corrosion modelled for permanent outdoor installation.',
    rows:[['Internal structure','316L stainless armature'],['Foundation','RCC pad + chemical anchors'],['Wind load','Engineered to 180 km/h'],['Corrosion','Marine-grade protection'],['Anchoring','Through-bolt base flange'],['Warranty','10-year structural']]},
  lavius:{lead:'Lavius collections are configured as decorative luminous systems: crystal drops, glass forms and suspended components are mapped to a concealed canopy and tuned to the room.',
    rows:[['Suspension','Concealed canopy · cable grid'],['Composition','Family-based modular layout'],['Light source','Warm LED · dimmable driver'],['Components','Crystal / glass / metal elements'],['Service','Accessible canopy drivers'],['Customization','Scale, finish and drop to project']]}
};

/* ===== inline SVG diagrams ===== */
function engSVG(div){
  const g='#c9a86a', l='rgba(255,255,255,.25)', t='#9b958a';
  if(div==='sculpture'){
    return `<svg class="eng-svg" viewBox="0 0 520 360"><defs><marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="${g}"/></marker></defs>
    <rect x="0" y="0" width="520" height="360" fill="none"/>
    <line x1="40" y1="300" x2="480" y2="300" stroke="${l}"/>
    <rect x="200" y="284" width="120" height="18" fill="none" stroke="${g}"/>
    <text x="260" y="324" fill="${t}" font-size="11" text-anchor="middle" letter-spacing="2">RCC FOUNDATION</text>
    <path d="M255 284 C 250 200 230 150 260 90 C 285 45 250 30 290 40" fill="none" stroke="${g}" stroke-width="2"/>
    <path d="M265 284 C 270 210 300 170 280 110" fill="none" stroke="${g}" stroke-width="1.4" opacity=".6"/>
    <circle cx="290" cy="40" r="6" fill="${g}"/>
    <line x1="120" y1="284" x2="120" y2="90" stroke="${l}" stroke-dasharray="4 4"/>
    <line x1="116" y1="90" x2="124" y2="90" stroke="${g}"/><line x1="116" y1="284" x2="124" y2="284" stroke="${g}"/>
    <text x="100" y="190" fill="${t}" font-size="11" text-anchor="middle" transform="rotate(-90 100 190)" letter-spacing="2">OVERALL HEIGHT</text>
    <line x1="320" y1="293" x2="400" y2="293" stroke="${g}" marker-end="url(#a)"/><text x="410" y="296" fill="${t}" font-size="10">ANCHOR BOLTS</text>
    <text x="40" y="30" fill="${g}" font-size="11" letter-spacing="3">STRUCTURAL ELEVATION</text></svg>`;
  }
  if(div==='ceilings'){
    return `<svg class="eng-svg" viewBox="0 0 520 360">
    <text x="40" y="30" fill="${g}" font-size="11" letter-spacing="3">SUSPENSION DETAIL</text>
    <line x1="40" y1="70" x2="480" y2="70" stroke="${g}" stroke-width="2"/>
    <text x="40" y="60" fill="${t}" font-size="10">SOFFIT / SLAB</text>
    <g stroke="${g}">
     ${[110,190,270,350,430].map(x=>`<line x1="${x}" y1="70" x2="${x}" y2="150" /><circle cx="${x}" cy="70" r="4" fill="${g}"/>`).join('')}
    </g>
    <rect x="80" y="150" width="380" height="16" fill="none" stroke="${g}"/>
    <text x="270" y="142" fill="${t}" font-size="10" text-anchor="middle">CONCEALED TRACK GRID</text>
    <path d="M80 180 q95 60 190 0 q95 -60 190 0" fill="none" stroke="${g}" stroke-width="2"/>
    <path d="M80 205 q95 60 190 0 q95 -60 190 0" fill="none" stroke="${g}" stroke-width="1.4" opacity=".55"/>
    <text x="270" y="250" fill="${t}" font-size="10" text-anchor="middle" letter-spacing="2">SCULPTED CEILING MODULE</text>
    <line x1="110" y1="150" x2="110" y2="180" stroke="${l}" stroke-dasharray="3 3"/>
    <text x="40" y="320" fill="${t}" font-size="10">Adjustable rod · quick-lock bracket · integrated LED</text></svg>`;
  }
  return `<svg class="eng-svg" viewBox="0 0 520 360">
    <text x="40" y="30" fill="${g}" font-size="11" letter-spacing="3">SUSPENSION SYSTEM</text>
    <line x1="40" y1="64" x2="480" y2="64" stroke="${g}" stroke-width="2"/><text x="40" y="54" fill="${t}" font-size="10">STRUCTURAL SLAB</text>
    <rect x="220" y="64" width="80" height="22" fill="none" stroke="${g}"/><text x="260" y="100" fill="${t}" font-size="10" text-anchor="middle">CONCEALED CANOPY</text>
    <g stroke="${g}">${[240,260,280].map(x=>`<line x1="${x}" y1="86" x2="${x}" y2="170"/>`).join('')}</g>
    <text x="330" y="135" fill="${t}" font-size="10">aircraft cable ×3</text>
    <ellipse cx="260" cy="210" rx="120" ry="34" fill="none" stroke="${g}" stroke-width="2"/>
    <ellipse cx="260" cy="240" rx="92" ry="26" fill="none" stroke="${g}" stroke-width="1.4" opacity=".6"/>
    <ellipse cx="260" cy="266" rx="60" ry="18" fill="none" stroke="${g}" stroke-width="1.1" opacity=".4"/>
    <g stroke="${g}" opacity=".5">${[180,210,240,270,300,330].map(x=>`<line x1="${x}" y1="200" x2="${x}" y2="288"/>`).join('')}</g>
    <text x="260" y="320" fill="${t}" font-size="10" text-anchor="middle" letter-spacing="2">SUSPENDED CRYSTAL ARRAY</text>
    <line x1="392" y1="64" x2="392" y2="210" stroke="${l}" stroke-dasharray="4 4"/>
    <text x="406" y="140" fill="${t}" font-size="10" transform="rotate(-90 406 140)">DROP HEIGHT</text></svg>`;
}

/* annotated elevation card (image + dimension overlay) */
function elevationSVG(p){
  const img=window.TSK.imgCard(p.gallery&&p.gallery[0]||p.hero);
  const g='#c9a86a', t='#9b958a';
  const H=p.specs['Height']||p.specs['Coverage']||'—';
  const W=p.specs['Diameter / Width']||p.specs['Footprint']||p.specs['Module Depth']||'—';
  return `<div style="position:relative;width:100%;height:100%;min-height:280px;background:var(--graphite)">
    <img src="${img}" alt="elevation" style="width:100%;height:100%;object-fit:cover;opacity:.5">
    <svg viewBox="0 0 400 300" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">
      <line x1="26" y1="30" x2="26" y2="270" stroke="${g}" stroke-dasharray="4 4"/>
      <line x1="20" y1="30" x2="32" y2="30" stroke="${g}"/><line x1="20" y1="270" x2="32" y2="270" stroke="${g}"/>
      <line x1="40" y1="282" x2="360" y2="282" stroke="${g}" stroke-dasharray="4 4"/>
      <line x1="40" y1="276" x2="40" y2="288" stroke="${g}"/><line x1="360" y1="276" x2="360" y2="288" stroke="${g}"/>
    </svg>
    <div style="position:absolute;left:14px;top:14px;font-size:10px;letter-spacing:3px;color:var(--gold)">FRONT ELEVATION · ${p.code}</div>
    <div style="position:absolute;left:40px;bottom:8px;font-size:11px;color:${t};letter-spacing:1px">W · ${W}</div>
    <div style="position:absolute;left:6px;top:50%;transform:rotate(-90deg);transform-origin:left;font-size:11px;color:${t};letter-spacing:1px">H · ${H}</div>
  </div>`;
}

/* ===== form + downloads ===== */
window.TSKsubmit=function(e){e.preventDefault();var nm=document.getElementById('pName')?document.getElementById('pName').textContent:'';return window.TSK.submitForm(e.target,{source:'Product — '+nm});};
window.TSKreqDownload=function(kind){
  const sec=document.getElementById('enquire');
  if(window.TSK&&window.TSK.lenis){window.TSK.lenis.scrollTo(sec,{offset:-120});}else sec.scrollIntoView({behavior:'smooth'});
  const msg=document.getElementById('pFormMsg'); msg.textContent=`Request the ${kind} via private consultation — the atelier will send full documentation directly.`; msg.style.display='block';
};
