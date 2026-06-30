/* ============================================================
   TSK — core experience layer
   loader · chrome · smooth-scroll · reveals · cursor · transitions
   ============================================================ */
(function(){
'use strict';
const C = window.TSK_CATALOG || {brand:{},divisions:[],products:[],projects:[],backgrounds:[]};
const D = document;
const hasGSAP = typeof gsap !== 'undefined';
const hasLenis = typeof Lenis !== 'undefined';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(hover:none)').matches;

/* ---------- helpers ---------- */
const $  = (s,r=D)=>r.querySelector(s);
const $$ = (s,r=D)=>[...r.querySelectorAll(s)];
const el = (t,c,h)=>{const e=D.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const divOf = n => (n||'').split('-')[0];
const NEWCODE = /^(TSK-AC|TSK-[A-Z]{3}-|BP-BS|LAV-)/;  // Excel-coded product images live in assets/p/
const imgFull = n => NEWCODE.test(n) ? `assets/p/full/${n}.jpg` : `assets/${divOf(n)}/full/${n}.jpg`;
const imgCard = n => NEWCODE.test(n) ? `assets/p/card/${n}.jpg` : `assets/${divOf(n)}/card/${n}.jpg`;
const param  = k => new URLSearchParams(location.search).get(k);
const product = id => C.products.find(p=>p.id===id);
const byDiv  = d => C.products.filter(p=>p.division===d);
const divMeta = d => C.divisions.find(x=>x.id===d) || {};
const titleCase = s => s;
const rand = arr => arr[Math.floor(Math.random()*arr.length)];

const NAV = [
  {t:'Collections', h:'services.html'},
  {t:'Projects',    h:'projects.html'},
  {t:'Experience',  h:'experience.html'},
  {t:'Atelier',     h:'founder.html'},
  {t:'Journal',     h:'journal.html'},
  {t:'Contact',     h:'contact.html'},
];

window.TSK = { C, $, $$, el, imgFull, imgCard, param, product, byDiv, divMeta, productCard, reveal, rand };

/* ---- form submission (host-agnostic) ----
   1) If a Web3Forms access key is set below, submissions are emailed to
      management@thestellarkraft.com silently via AJAX.
   2) Otherwise it opens the visitor's email client pre-filled to the studio.
   To enable silent email delivery: get a free key at https://web3forms.com
   (register management@thestellarkraft.com) and paste it here. */
window.TSK.FORM_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
window.TSK.submitForm = function(form, opts){
  opts = opts || {};
  const data = {};
  form.querySelectorAll('.field').forEach(f=>{
    const lab=f.querySelector('label'); const inp=f.querySelector('input,select,textarea');
    if(lab && inp && inp.type!=='file' && inp.value) data[lab.textContent.replace(/\s*\*$/,'').trim()] = inp.value;
  });
  data['Enquiry source'] = opts.source || document.title;
  const msgEl = form.querySelector('#cMsg, #pFormMsg, .form-msg');
  const key = window.TSK.FORM_KEY;
  const done = ()=>{ if(msgEl) msgEl.style.display='block'; try{form.reset();}catch(e){} };
  const mailto = ()=>{
    const body = Object.entries(data).map(([k,v])=>k+': '+v).join('\r\n');
    window.location.href = 'mailto:management@thestellarkraft.com?subject='
      + encodeURIComponent('New enquiry — '+(opts.source||'TSK')) + '&body=' + encodeURIComponent(body);
    done();
  };
  if(key && key.length>12 && key.indexOf('YOUR_')<0){
    fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify(Object.assign({access_key:key,subject:'New TSK enquiry — '+(opts.source||''),from_name:'TSK Website',replyto:data['Email']||''},data))})
      .then(r=>r.json()).then(()=>done()).catch(mailto);
  } else { mailto(); }
  return false;
};

/* ============================================================
   CHROME — header + footer + transition + cursor (single source)
   ============================================================ */
function buildChrome(){
  const page = D.body.dataset.page || '';

  /* page transition overlay */
  const pt = el('div'); pt.id='pt'; pt.innerHTML='<div class="pt-mark">TSK</div>';
  D.body.appendChild(pt);

  /* header */
  const head = el('header','nav');
  head.innerHTML = `
    <a class="brand" href="index.html" data-trans aria-label="TSK">
      <span class="bt"><b>TSK</b></span>
    </a>
    <nav class="nav-links">
      ${NAV.map(n=>`<a href="${n.h}" data-trans class="${page===n.h?'active':''}">${n.t}</a>`).join('')}
    </nav>
    <a href="contact.html" data-trans class="nav-cta">Private Consultation</a>
    <button class="burger" aria-label="Menu"><span></span><span></span><span></span></button>`;
  D.body.prepend(head);

  /* mobile menu */
  const mo = el('div','menu-overlay');
  mo.innerHTML = `
    <button class="menu-close" aria-label="Close menu"><span></span><span></span></button>
    <div>${[{t:'Home',h:'index.html'}].concat(NAV).map(n=>`<a href="${n.h}" data-trans>${n.t}</a>`).join('')}</div>
    <div class="menu-foot">
      <span>${C.brand.email||''}</span><span>${C.brand.phone||''}</span><span>${C.brand.instagram||''}</span>
    </div>`;
  D.body.appendChild(mo);
  const burger=$('.burger',head);
  const closeMenu=()=>{mo.classList.remove('open');burger.classList.remove('open');D.body.classList.remove('lock');};
  burger.addEventListener('click',()=>{
    const o=mo.classList.toggle('open'); burger.classList.toggle('open'); D.body.classList.toggle('lock',o);
  });
  $('.menu-close',mo).addEventListener('click',closeMenu);
  $$('.menu-overlay a').forEach(a=>a.addEventListener('click',closeMenu));

  /* footer (skip on experience room) */
  if(!D.body.classList.contains('no-foot')) buildFooter();

  /* header scroll state — transparent only over the homepage hero */
  const alwaysSolid = page!=='index.html';
  const onScroll=()=>{ head.classList.toggle('solid', alwaysSolid || window.scrollY>40); };
  onScroll(); window.addEventListener('scroll',onScroll,{passive:true});

  /* native cursor — custom cursor removed per brand direction */
  wireTransitions();
}

const SOC_ICONS={
 instagram:'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.42.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
 facebook:'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
 linkedin:'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
 pinterest:'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.747-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z',
 behance:'M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z',
 youtube:'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
 whatsapp:'M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.043zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414z',
 email:'M0 3v18h24V3H0zm21.518 2L12 12.713 2.482 5h19.036zM2 7.183l10 8.104 10-8.104V19H2V7.183z'};
function socIcon(n){return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${SOC_ICONS[n]}"/></svg>`;}

function buildFooter(){
  const b=C.brand, f=el('footer','lfoot');
  const NAVF=[['Home','index.html'],['Collections','services.html'],['Projects','projects.html'],['The Atelier','founder.html'],['Journal','journal.html'],['Contact','contact.html']];
  const SVCF=[['Couture Lighting','collection.html?division=lighting'],['Architectural Ceilings','collection.html?division=ceilings'],['Sculptural Systems','collection.html?division=sculpture'],['Materials & Finishes','materials.html']];
  const SOC=[['instagram',b.instagram,'Instagram'],['facebook',b.facebook,'Facebook'],['linkedin',b.linkedin,'LinkedIn'],['pinterest',b.pinterest,'Pinterest'],['behance',b.behance,'Behance'],['youtube',b.youtube,'YouTube'],['whatsapp',b.whatsapp,'WhatsApp'],['email','mailto:'+b.email,'Email']];
  const LEGAL=[['Privacy','privacy.html'],['Terms','terms.html'],['Careers','careers.html'],['Site Map','sitemap.html']];
  const ilink=(t,h)=>`<a class="lf-link" href="${h}"${h.endsWith('.html')||h.includes('.html?')?' data-trans':''}>${t}</a>`;
  f.innerHTML=`
   <div class="lf-amb" aria-hidden="true"><span class="blob blob1"></span><span class="blob blob2"></span></div>
   <div class="wrap">
     <div class="lf-grid">
       <div class="lf-col reveal">
         <a href="index.html" data-trans class="lf-brandmark">TSK</a>
         <div class="lf-studio">${b.studio}</div>
         <p class="lf-desc">Bespoke lighting, architectural ceilings and sculptural installations for the world's most ambitious spaces.</p>
         <p class="lf-tag">${b.tagline}</p>
         <a href="contact.html" data-trans class="btn mt-m" style="padding:13px 26px">Book a Consultation <span class="ar">→</span></a>
       </div>
       <div class="lf-col reveal reveal-d1"><h5>Explore</h5>${NAVF.map(l=>ilink(l[0],l[1])).join('')}</div>
       <div class="lf-col reveal reveal-d2"><h5>Collections</h5>${SVCF.map(l=>ilink(l[0],l[1])).join('')}</div>
       <div class="lf-col reveal reveal-d3">
         <h5>Connect</h5>
         <div class="lf-socials">${SOC.map(s=>`<a class="lf-soc" href="${s[1]}"${s[0]!=='email'?' target="_blank" rel="noopener"':''} aria-label="${s[2]}" title="${s[2]}">${socIcon(s[0])}</a>`).join('')}</div>
         <div class="lf-contact">
           <a href="mailto:${b.email}">${b.email}</a>
           <a href="https://wa.me/919902058882" target="_blank" rel="noopener">WhatsApp · ${b.phone}</a>
           <span style="display:block;color:var(--muted-2);font-size:12px;padding-top:12px;letter-spacing:.04em">${b.group} · ${b.city}</span>
         </div>
       </div>
     </div>
     <div class="lf-bottom">
       <span class="l">© ${new Date().getFullYear()} TSK Design Studio · All Rights Reserved</span>
       <span class="c">${b.tagline}</span>
       <span class="r">${LEGAL.map(l=>`<a href="${l[1]}" data-trans>${l[0]}</a>`).join('<i> · </i>')}</span>
     </div>
   </div>`;
  D.body.appendChild(f);
}

function markSVG(s){
  return `<svg class="mark" width="${s}" height="${s}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="24" cy="24" r="22.4" stroke="url(#mg)" stroke-width="1"/>
    <path d="M24 6 L24 42 M14 13 L34 13 M24 24 C30 20 33 27 30 30 C27 33 19 31 18 24 C17 17 24 14 30 17" stroke="url(#mg)" stroke-width="1" stroke-linecap="round"/>
    <defs><linearGradient id="mg" x1="0" y1="0" x2="48" y2="48">
      <stop stop-color="#e7d3a1"/><stop offset="1" stop-color="#9c7b43"/></linearGradient></defs></svg>`;
}

/* ============================================================
   CURSOR
   ============================================================ */
function buildCursor(){
  const dot=el('div','cursor'), ring=el('div','cursor-ring');
  D.body.append(dot,ring);
  let mx=innerWidth/2,my=innerHeight/2, rx=mx,ry=my;
  window.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;});
  (function loop(){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(loop);})();
  const grow=l=>{ring.classList.add('grow');ring.dataset.label=l||'';};
  const shrink=()=>{ring.classList.remove('grow');ring.dataset.label='';};
  const hook=()=>$$('a,button,.pcard,[data-cursor]').forEach(n=>{
    if(n._ch)return;n._ch=1;
    n.addEventListener('mouseenter',()=>grow(n.dataset.cursor||''));
    n.addEventListener('mouseleave',shrink);
  });
  hook(); window._cursorHook=hook;
}

/* ============================================================
   PAGE TRANSITIONS
   ============================================================ */
function wireTransitions(){
  const pt=$('#pt'); const mark=$('.pt-mark',pt);
  /* keep panel parked off-screen (never covers on load) */
  if(hasGSAP) gsap.set(pt,{yPercent:100}); else pt.style.transform='translateY(100%)';

  $$('a[data-trans]').forEach(a=>{
    if(a._t)return; a._t=1;
    a.addEventListener('click',e=>{
      const href=a.getAttribute('href');
      if(!href||href.startsWith('#')||href.startsWith('mailto')||href.startsWith('tel')||a.target==='_blank')return;
      if(reduce||!hasGSAP){ return; } // native nav
      e.preventDefault();
      let gone=false; const nav=()=>{ if(gone)return; gone=true; location.href=href; };
      gsap.set(pt,{yPercent:100,autoAlpha:1});
      gsap.timeline({onComplete:nav})
        .to(pt,{yPercent:0,duration:.6,ease:'power4.inOut'})
        .fromTo(mark,{opacity:0,y:14},{opacity:1,y:0,duration:.35,ease:'power2.out'},'-=.25');
      setTimeout(nav,820); // failsafe if rAF is throttled
    });
  });
}

/* ============================================================
   LOADER
   ============================================================ */
/* loader is VISUAL ONLY — it never gates content. Robust to frozen rAF. */
function runLoader(){
  const mode = D.body.dataset.loader;
  if(mode!=='full' || sessionStorage.getItem('tsk_seen') || reduce){ quickVeil(); return; }
  sessionStorage.setItem('tsk_seen','1');
  const lines=[
    'Architecture was never meant to be ordinary.',
    'We shape emotion through light.',
    'We engineer luxury through form.',
  ];
  const final='Welcome to The Stellar Kraft.';
  const L=el('div'); L.id='loader';
  L.innerHTML = lines.map((t,i)=>`<div class="l-line" data-i="${i}">${t}</div>`).join('')
    + `<div class="l-line l-final">${final}</div>`
    + `<div class="l-mono">TSK · The Stellar Kraft</div>`
    + `<div class="l-prog"></div>`;
  D.body.appendChild(L); D.body.classList.add('lock');
  const ls=$$('.l-line',L), mono=$('.l-mono',L), prog=$('.l-prog',L);

  let done=false;
  const finish=()=>{ if(done)return; done=true; L.style.transition='opacity .9s ease'; L.style.opacity='0';
    setTimeout(()=>{ if(L.parentNode)L.remove(); D.body.classList.remove('lock'); },900); };

  if(hasGSAP && !reduce){
    const tl=gsap.timeline({onComplete:finish});
    gsap.set(mono,{opacity:0});
    tl.to(prog,{width:'100%',duration:3.4,ease:'none'},0).to(mono,{opacity:.55,duration:.8},.15);
    ls.forEach((line,i)=>{
      const fnl=line.classList.contains('l-final');
      tl.fromTo(line,{opacity:0,y:20,filter:'blur(6px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.7,ease:'power3.out'}, i? '>-0.15':'>')
        .to(line,{opacity:0,y:-14,filter:'blur(5px)',duration:.5,ease:'power2.in'}, fnl? '+=0.6':'+=0.28');
      if(fnl) tl.to(line,{scale:1.03,duration:.9,ease:'power1.out'},'<');
    });
  } else {
    let i=0; const all=[...ls];
    const step=()=>{ if(i>0)all[i-1].style.opacity='0'; if(i<all.length){all[i].style.opacity='1';i++;setTimeout(step,1300);} else finish(); };
    setTimeout(step,450);
  }
  setTimeout(finish, 8200); // hard failsafe — clears even if animations never tick
}

function quickVeil(){
  const v=el('div'); v.style.cssText='position:fixed;inset:0;z-index:9000;background:var(--black);opacity:1;transition:opacity .7s ease';
  D.body.appendChild(v);
  setTimeout(()=>{ v.style.opacity='0'; },40);
  setTimeout(()=>{ if(v.parentNode)v.remove(); },1100); // rAF-independent removal
}

/* ============================================================
   SMOOTH SCROLL + SCROLLTRIGGER
   ============================================================ */
let lenis=null;
function initScroll(){
  if(hasLenis && !reduce && !isTouch){
    lenis=new Lenis({duration:1.25,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});
    function raf(t){lenis.raf(t);requestAnimationFrame(raf);} requestAnimationFrame(raf);
    if(hasGSAP && gsap.ticker){ lenis.on('scroll',()=>{if(window.ScrollTrigger)ScrollTrigger.update();}); }
    window.TSK.lenis=lenis;
  }
  if(hasGSAP && window.ScrollTrigger){ gsap.registerPlugin(ScrollTrigger); }
}

/* ============================================================
   REVEALS (works with or without GSAP)
   ============================================================ */
function reveal(scope){
  const root=scope||D;
  if(!('IntersectionObserver' in window)){ $$('.reveal,.line-mask',root).forEach(n=>n.classList.add('in')); return; }
  // failsafe: guarantee final visible state even if a CSS transition is interrupted
  const settle=t=>setTimeout(()=>{ try{ t.style.transition='none'; t.style.opacity='1'; t.style.transform='none';
    $$('span',t).forEach(s=>{ if(getComputedStyle(t).overflow!=='visible'){ s.style.transform='none'; } }); }catch(e){} }, 1600);
  const io=new IntersectionObserver((ents)=>{
    ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); settle(e.target); io.unobserve(e.target);} });
  },{threshold:.08,rootMargin:'0px 0px -6% 0px'});
  $$('.reveal,.line-mask',root).forEach(n=>io.observe(n));

  // counters
  const cio=new IntersectionObserver((ents)=>{
    ents.forEach(e=>{ if(e.isIntersecting){ countUp(e.target); cio.unobserve(e.target);} });
  },{threshold:.5});
  $$('[data-count]',root).forEach(n=>cio.observe(n));
}
function countUp(node){
  const end=parseFloat(node.dataset.count), suf=node.dataset.suffix||'', dur=1600;
  const t0=performance.now();
  (function tick(t){const p=Math.min(1,(t-t0)/dur);const e=1-Math.pow(1-p,3);
    node.textContent=Math.round(end*e).toLocaleString()+suf; if(p<1)requestAnimationFrame(tick);})(t0);
}

/* ============================================================
   PRODUCT CARD (shared)
   ============================================================ */
function productCard(p,extra){
  return `<a class="pcard reveal ${extra||''}" href="product.html?id=${p.id}" data-trans data-cursor="Explore">
    <div class="pc-media">
      <img src="${imgCard(p.hero)}" alt="${p.name}" loading="lazy">
      <div class="pc-shine"></div>
    </div>
    <div class="pc-explore">Explore <span>→</span></div>
    <div class="pc-body">
      <div class="pc-code">${p.code}</div>
      <div class="pc-name display">${p.name}</div>
      <div class="pc-tag">${p.tagline}</div>
    </div>
  </a>`;
}

/* ============================================================
   PARALLAX (data-parallax on elements)
   ============================================================ */
function initParallax(){
  if(!hasGSAP || !window.ScrollTrigger || reduce) return;
  $$('[data-parallax]').forEach(n=>{
    const amt=parseFloat(n.dataset.parallax)||12;
    gsap.fromTo(n,{yPercent:-amt},{yPercent:amt,ease:'none',
      scrollTrigger:{trigger:n.closest('section')||n,scrub:true,start:'top bottom',end:'bottom top'}});
  });
}

/* ============================================================
   SEO — structured data + manifest injected on every page (DRY)
   ============================================================ */
const SEO_BASE='https://www.thestellarkraft.com/';
const PAGE_NAME={
  'index.html':'Home','services.html':'Collections','collection.html':'Collection',
  'projects.html':'Projects','experience.html':'Experience Room','founder.html':'The Atelier',
  'contact.html':'Contact','testimonials.html':'Testimonials','materials.html':'Materials & Craft',
  'careers.html':'Careers','product.html':'Product','privacy.html':'Privacy','terms.html':'Terms',
  'sitemap.html':'Sitemap'
};
function addLD(obj){ const s=D.createElement('script'); s.type='application/ld+json'; s.textContent=JSON.stringify(obj); D.head.appendChild(s); }
function injectSEO(){
  const page=(D.body.dataset.page||'index.html');
  // manifest + theme colour (only if not already declared)
  if(!$('link[rel="manifest"]')){ const m=D.createElement('link'); m.rel='manifest'; m.href='site.webmanifest'; D.head.appendChild(m); }
  if(!$('meta[name="theme-color"]')){ const t=D.createElement('meta'); t.name='theme-color'; t.content='#070709'; D.head.appendChild(t); }
  // WebSite entity (every page reinforces the brand site)
  addLD({"@context":"https://schema.org","@type":"WebSite","name":"The Stellar Kraft","alternateName":"TSK","url":SEO_BASE,"inLanguage":"en","publisher":{"@type":"Organization","name":"The Stellar Kraft","logo":SEO_BASE+"assets/og-image.jpg"}});
  // BreadcrumbList for inner pages
  if(page!=='index.html' && page!=='product.html'){
    addLD({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
      {"@type":"ListItem","position":1,"name":"Home","item":SEO_BASE},
      {"@type":"ListItem","position":2,"name":(PAGE_NAME[page]||'Page'),"item":SEO_BASE+page}
    ]});
  }
}

/* ============================================================
   BOOT
   ============================================================ */
function boot(){
  injectSEO();
  buildChrome();
  initScroll();
  // render content IMMEDIATELY — independent of any animation
  const start=()=>{
    if(window.__tskStarted)return; window.__tskStarted=1;
    reveal();
    initParallax();
    if(window._cursorHook)window._cursorHook();
    if(typeof window.PAGE_READY==='function'){ try{ window.PAGE_READY(); }catch(e){ console.error('PAGE_READY error',e); } }
    setTimeout(()=>{ if(window._cursorHook)window._cursorHook(); if(window.ScrollTrigger&&!reduce)ScrollTrigger.refresh(); },350);
  };
  setTimeout(start,0); // run after the page's inline PAGE_READY script has defined it
  runLoader();         // purely visual
}
if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',boot); else boot();
})();
