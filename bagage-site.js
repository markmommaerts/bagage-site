/* =========================================================
   BAGAGE — GEDEELDE CODE VOOR ALLE EIGEN PAGINA'S IN REVIDD
   Elke pagina laadt dit bestand met één regel onderaan:
   <script src="https://ADRES/bagage-site.js"></script>
   Een wijziging hier geldt meteen voor alle pagina's.
   Inhoud: 1. kader op maat (hoogte, scrollen, kop)  2. site-fix (logo, menu, zoeken, navigatie)
   Versie: 2026-11-06c (tab Duiding hersteld, oranje sluitknop, Lees meer)
   ========================================================= */
/* =========================================================
   KADER OP MAAT (Revidd, sinds oktober 2026)
   Revidd laadt deze pagina in een iframe met een vaste hoogte en
   eigen opvulling, en de Revidd-pagina scrolt in een eigen blok.
   Chrome geeft scrollen boven het kader niet door aan dat blok.
   Dit script:
   - maakt het kader even hoog als de inhoud en haalt de extra marges weg
   - stuurt muiswiel, trackpad en toetsen (pijlen, spatie, Page Up/Down,
     Home/End) door naar de Revidd-pagina
   - laat ankerlinks en 'scroll naar' (scrollIntoView) de Revidd-pagina
     scrollen, met de sectie net onder de Revidd-kop
   - maakt de kop donker zodra er gescrold is
   ========================================================= */
(() => {
  const frame = window.frameElement;
  if (!frame) return;
  /* Schermvullende pagina's (Shorts) regelen hun kader zelf */
  if (document.getElementById('bagage-shorts') || document.querySelector('[data-bagage-eigen-kader]')) return;
  const host = window.parent;
  const hdoc = host.document;

  /* Marges en maximale breedte van Revidd rond het kader weg (hun klassen gebruiken !important).
     Revidd zet het kader in een blok van max. 1280 px breed (max-w-screen-lg mx-auto) en bouwt dat blok
     soms opnieuw op; daarom bij elke wijziging opnieuw volle breedte zetten. */
  document.body.style.setProperty('padding', '0', 'important');
  const FULL = { 'padding-left':'0', 'padding-right':'0', 'max-width':'none', 'width':'100%', 'margin-left':'0', 'margin-right':'0', 'padding-top':'0' };
  let wrapMo = null, wrapEl = null;
  const fullWidth = () => {
    const wrap = frame.parentElement;
    if (!wrap) return;
    Object.entries(FULL).forEach(([k, v]) => {
      if (wrap.style.getPropertyValue(k) !== v || wrap.style.getPropertyPriority(k) !== 'important') wrap.style.setProperty(k, v, 'important');
    });
    if (wrap !== wrapEl) {
      if (wrapMo) wrapMo.disconnect();
      wrapEl = wrap;
      wrapMo = new MutationObserver(fullWidth);
      wrapMo.observe(wrap, { attributes: true, attributeFilter: ['style', 'class'] });
    }
  };
  fullWidth();

  /* Hoogte van het kader = hoogte van de inhoud.
     html/body krijgen hun natuurlijke hoogte, zodat we kunnen meten zonder het kader
     eerst in te klappen (dat liet de Revidd-pagina verspringen). */
  ['html', 'body'].forEach(sel => {
    const el = document.querySelector(sel);
    el.style.setProperty('height', 'auto', 'important');
    el.style.setProperty('min-height', '0', 'important');
    el.style.setProperty('overflow', 'hidden', 'important');
  });
  document.body.style.setProperty('margin', '0', 'important');
  let fitFrame = 0;
  const fit = () => {
    if (!frame.isConnected) return;
    fullWidth();
    const h = Math.max(Math.ceil(document.body.getBoundingClientRect().height), window.__bagageMinH || 0);
    if (!h) return;
    const px = h + 'px';
    if (frame.style.height !== px) frame.style.setProperty('height', px, 'important');
    if (frame.style.minHeight !== px) frame.style.setProperty('min-height', px, 'important');
    if (frame.style.maxHeight !== px) frame.style.setProperty('max-height', px, 'important');
  };
  const queueFit = () => { cancelAnimationFrame(fitFrame); fitFrame = requestAnimationFrame(fit); };
  const ro = new ResizeObserver(queueFit);
  ro.observe(document.body);
  ro.observe(frame);                            // breedte van het kader verandert (Revidd bouwt de pagina op)
  /* Revidd zet na het wisselen van pagina soms zelf een hoogte op het kader: meteen corrigeren */
  const mo = new MutationObserver(queueFit);
  mo.observe(frame, { attributes: true, attributeFilter: ['style', 'height', 'class'] });
  window.addEventListener('load', queueFit);
  host.addEventListener('resize', queueFit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueFit);
  document.querySelectorAll('img').forEach(img => { if (!img.complete) img.addEventListener('load', queueFit, { once: true }); });
  [100, 500, 1500, 3000, 6000].forEach(t => setTimeout(queueFit, t));
  window.addEventListener('pagehide', () => {
    ro.disconnect();
    if (wrapMo) wrapMo.disconnect();
    mo.disconnect();
    host.removeEventListener('resize', queueFit);
  });
  fit();

  /* Het blok waarin de Revidd-pagina scrolt (of het venster zelf).
     Revidd zet dat blok soms op overflow:hidden; via het script scrollt het dan toch. */
  const scroller = () => {
    for (let el = frame.parentElement; el && el !== hdoc.body; el = el.parentElement) {
      const oy = host.getComputedStyle(el).overflowY;
      if (oy !== 'visible' && oy !== 'clip' && el.scrollHeight > el.clientHeight + 1) return el;
    }
    return null;
  };
  const target = () => scroller() || hdoc.scrollingElement || hdoc.documentElement;
  const scrollPos = () => target().scrollTop;
  const viewHeight = () => { const s = scroller(); return s ? s.clientHeight : host.innerHeight; };
  const header = () => {
    const logo = hdoc.querySelector('img[alt="NavLogo"]');
    return logo && logo.closest('.fixed');
  };
  const headerBottom = () => { const h = header(); return h ? Math.max(0, h.getBoundingClientRect().bottom) : 0; };
  window.bagageHeaderBottom = headerBottom;
  window.bagageTopOnPage = el => el.getBoundingClientRect().top + frame.getBoundingClientRect().top;

  /* Scrolt een element in het kader zelf (bv. de lezer van Achtergrond)? Dan niet doorsturen. */
  const ownScroller = (node, dy) => {
    for (let el = node && node.nodeType === 1 ? node : node && node.parentElement;
         el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
      const oy = getComputedStyle(el).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) {
        const atTop = el.scrollTop <= 0, atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
        if (dy === 0 || (dy < 0 && !atTop) || (dy > 0 && !atEnd)) return el;
        if (getComputedStyle(el).overscrollBehaviorY === 'contain') return el;
      }
    }
    return null;
  };

  /* Muiswiel en trackpad: verticaal scrollen gaat naar de Revidd-pagina.
     Horizontaal (bv. vegen door een posterrij) blijft in het kader. */
  document.addEventListener('wheel', e => {
    if (e.ctrlKey) return;                      // knijpen om te zoomen
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    if (ownScroller(e.target, e.deltaY)) return;
    const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? viewHeight() : 1;
    e.preventDefault();
    target().scrollTop += e.deltaY * unit;
  }, { passive: false });

  /* Toetsenbord, zolang de focus in het kader staat */
  document.addEventListener('keydown', e => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target;
    if (t.closest && t.closest('input, textarea, select, [contenteditable]')) return;
    const page = viewHeight() - headerBottom() - 40;
    const steps = {
      ArrowDown: 40, ArrowUp: -40, PageDown: page, PageUp: -page,
      ' ': e.shiftKey ? -page : page
    };
    if (e.key === ' ' && t.closest && t.closest('button, a')) return;
    if (ownScroller(t, 0) || document.querySelector('[aria-modal="true"]:not([hidden])')) return;
    const s = target();
    if (e.key === 'Home') { e.preventDefault(); s.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (e.key === 'End') { e.preventDefault(); s.scrollTo({ top: s.scrollHeight, behavior: 'smooth' }); return; }
    if (!(e.key in steps)) return;
    e.preventDefault();
    s.scrollBy({ top: steps[e.key], behavior: 'smooth' });
  });

  /* scrollIntoView binnen het kader: de Revidd-pagina naar de plek scrollen */
  Element.prototype.scrollIntoView = function (opt) {
    const smooth = !(opt && typeof opt === 'object' && opt.behavior === 'auto') &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = this;
    const dest = () => Math.max(0, scrollPos() + window.bagageTopOnPage(el) - headerBottom() - 16);
    const s = target();
    s.scrollTo({ top: dest(), behavior: smooth ? 'smooth' : 'auto' });
    /* Zacht scrollen wordt soms afgebroken: door Revidd (na het wisselen van pagina) of doordat het kader
       intussen korter wordt (bv. na 'Alles bekijken' onderaan de catalogus). Dan bleef je onder de inhoud
       op een zwart vlak staan. Daarom nadien controleren en zo nodig meteen naar de juiste plek springen. */
    const check = () => { const t = dest(); if (Math.abs(target().scrollTop - t) > 4) target().scrollTop = t; };
    (smooth ? [650, 1300] : [120, 600]).forEach(ms => setTimeout(check, ms));
  };

  /* Vensters over de pagina (bv. de lezer van Achtergrond) staan 'fixed' in het kader.
     Het kader is nu zo hoog als de hele pagina, dus we zetten ze op het zichtbare stuk. */
  const placeDialogs = () => {
    document.querySelectorAll('[role="dialog"]').forEach(d => {
      if (d.hidden || getComputedStyle(d).position !== 'fixed') return;
      const top = Math.max(0, headerBottom() - frame.getBoundingClientRect().top);
      d.style.setProperty('top', top + 'px', 'important');
      d.style.setProperty('bottom', 'auto', 'important');
      d.style.setProperty('height', Math.max(200, host.innerHeight - headerBottom()) + 'px', 'important');
    });
  };
  new MutationObserver(placeDialogs).observe(document.body,
    { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden'] });
  host.addEventListener('resize', placeDialogs);

  /* Kop donker zodra er gescrold is (de stijl hiervoor zet elke pagina zelf) */
  const solid = () => {
    placeDialogs();
    const h = header();
    if (!h) return;
    h.classList.add('bagage-head');
    h.classList.toggle('bagage-head-solid', scrollPos() > 10);
  };
  let bound = null;
  const bind = () => {
    const s = scroller() || host;
    if (s === bound) return;
    if (bound) bound.removeEventListener('scroll', solid);
    s.addEventListener('scroll', solid, { passive: true });
    bound = s;
    solid();
  };
  bind();
  window.addEventListener('load', bind);
  setTimeout(bind, 1600);
  setTimeout(bind, 3000);
  window.addEventListener('pagehide', () => { if (bound) bound.removeEventListener('scroll', solid); });
})();
/* Bagage site-fix (bron: bron/home_met_commentaar.html) */
(() => {
let top;
try { top = window.parent && window.parent !== window ? window.parent : window; top.document; } catch { return; }
const doc = top.document;
function topFix() {
if (window.__bagageSiteFix) return;
window.__bagageSiteFix = 1;
const st = document.createElement('style');
st.id = 'bagage-site-fix';
const bar = 'div.fixed.bottom-0.left-0.w-full.shadow-md';
st.textContent =
'.MuiDrawer-paper div.cursor-pointer:has(> p.rd-menu__item:empty){display:none!important}' +
bar + '{padding-bottom:calc(6px + env(safe-area-inset-bottom,0px))!important;background:rgba(9,12,13,.97)!important;color:#f4f1e9!important}' +
bar + ' img{filter:brightness(0) invert(1) drop-shadow(0 0 0 #fff) drop-shadow(0 0 0 #fff) drop-shadow(0 0 0 #fff)!important;opacity:1!important}' +
bar + ' span{color:#f4f1e9!important}' +
'div.max-w-screen-lg:has(> iframe.w-full.block){padding-left:0!important;padding-right:0!important;max-width:none!important;width:100%!important;margin-left:0!important;margin-right:0!important}' +
'div.pt-80.max-w-screen-lg:has(> iframe.w-full.block){padding-top:0!important}' +
'div.max-w-screen-lg > iframe.w-full.block{min-height:calc(100vh - 60px)}' +
'html.bagage-search-light body,html.bagage-search-light .bg-bodyBg{background:#f7f4ee!important}' +
'html.bagage-search-light .page-transition,html.bagage-search-light .page-transition .text-mainText{color:#1a1a18!important}' +
'html.bagage-search-light .page-transition .border-mainText{border-color:#1a1a18!important}' +
'html.bagage-search-light div.fixed:has(img[alt=\"NavLogo\"]){background-color:#f7f4ee!important;background-image:none!important;border-bottom:1px solid #ddd6c8}' +
'html.bagage-search-light div.fixed:has(img[alt=\"NavLogo\"]) [class]{color:#1a1a18!important;border-color:rgba(26,26,24,.55)!important}' +
'html.bagage-search-light div.fixed:has(img[alt=\"NavLogo\"]) div.bg-headerBg{background-color:#f7f4ee!important}' +
'html.bagage-search-light div.fixed:has(img[alt=\"NavLogo\"]) input::placeholder{color:#55534f!important}' +
'html.bagage-search-light div.fixed:has(img[alt=\"NavLogo\"]) img,html.bagage-search-light div.fixed:has(img[alt=\"NavLogo\"]) svg{filter:invert(1)}' +
'html.bagage-search-light div.fixed:has(img[alt=\"NavLogo\"]) .MuiIconButton-root svg{filter:none!important;color:#1a1a18!important;fill:#1a1a18!important}' +
'html.bagage-search-light footer,html.bagage-search-light footer *{background:#f7f4ee!important;color:#55534f!important;border-color:#ddd6c8!important}' +
'html.bagage-search-light footer img,html.bagage-search-light footer svg{filter:invert(1)}' +
'html.bagage-search-light #bagage-page-hits{color:#1a1a18!important}' +
'html.bagage-search-light #bagage-page-hits a{color:#1a1a18!important;background:#fff!important;border-color:#ddd6c8!important;border-left-color:#ef6a28!important}' +
/* Ondertitels in de Revidd-speler (Video.js): geen achtergrond, alleen lichte schaduw */
'.video-js .vjs-text-track-display .vjs-text-track-cue>div{background:transparent!important;background-color:transparent!important;color:#fff!important;text-shadow:0 1px 2px rgba(0,0,0,.9),0 0 3px rgba(0,0,0,.7)}' +
/* Duiding (Ghost-artikel bij een titel): sluitknop in Bagage-oranje, tab 'Nieuwsbrief' heet 'Duiding' */
'button[aria-label="Close article"]{background:#ef6a28!important;color:#fff!important}' +
'[data-bagage-duiding]{font-size:0!important}[data-bagage-duiding]::after{content:"Duiding";font-size:16px}[data-bagage-lees]{font-size:0!important}[data-bagage-lees]::after{content:"Lees meer →";font-size:11px}';
document.head.append(st);
const lang = () => (location.pathname.split('/')[1] || 'nl').replace(/^en$/, 'nl');
const isOldHome = p => /^\/(en|nl)\/home\/?$/.test(p);
window.__bagageGo = url => {
try { const r = window.next && window.next.router; if (r && typeof r.push === 'function') { r.push(url); window.__bagageSpa = 1; return true; } } catch (e) {}
return false;
};
document.addEventListener('click', e => {
const t = e.target;
if (!t.closest) return;
const home = t.closest(bar + ' button');
if (home && home.querySelector('img[alt="Home"]')) {
e.preventDefault(); e.stopPropagation();
if (!window.__bagageGo('/' + lang())) location.href = '/' + lang();
return;
}
const logoBox = t.closest('a, [class*="cursor-pointer"]');
if ((t.matches && t.matches('img[alt="NavLogo"]')) || (logoBox && logoBox.querySelector('img[alt="NavLogo"]'))) {
e.preventDefault(); e.stopImmediatePropagation();
if (!window.__bagageGo('/' + lang())) location.href = '/' + lang();
return;
}
const back = t.closest('button');
if (back && back.querySelector(':scope > img[alt="back"]') && window.__bagageSpa && history.length > 1) {
e.preventDefault(); e.stopPropagation(); history.back();
}
}, true);
['pushState', 'replaceState'].forEach(k => {
const orig = history[k];
history[k] = function (s, t, url) {
try { if (url && isOldHome(new URL(url, location.href).pathname)) { location.replace('/' + lang()); return; } } catch (e) {}
return orig.apply(this, arguments);
};
});
const PAGES = [
['Welkom', '', 'De startpagina van Bagage, met nieuwe titels en shorts', 'welkom home start startpagina begin bagage nieuw nieuwe'],
['Catalogus', '/pages/catalogus', 'Alle documentaires en reeksen, per thema', 'catalogus aanbod overzicht alle documentaires documentaire reeksen reeks films film thema themas kunst cultuur geschiedenis natuur filosofie religie mens samenleving bestemmingen reizen reis'],
['Reeksen & dossiers', '/pages/partnerkeuze', 'Reeksen, dossiers en documentaires rond één onderwerp, met partners en eigen selecties', 'reeksen reeks dossiers dossier partner partners partnerkeuze museum musea organisatie organisaties selectie verdieping'],
['Prijzen & FAQ', '/pages/prijzen-faq', 'Prijzen, toegang en veelgestelde vragen', 'prijs prijzen kost kosten tarief tarieven abonnement betalen betaling gratis huren kopen faq vragen vraag veelgestelde hulp help account inloggen registreren'],
['Over ons', '/pages/over-ons', 'Wie Bagage maakt en waarom', 'over ons wie team contact missie verhaal makers'],
['GoodPlanet', '/pages/goodplanet', 'Documentaires in samenwerking met GoodPlanet', 'goodplanet good planet klimaat aarde planeet milieu duurzaam duurzaamheid'],
['Apocalyps', '/pages/apocalyps-wo1', 'Apocalyps: de Eerste Wereldoorlog', 'apocalyps apocalypse wereldoorlog oorlog wo1 wo i 1914 1918 eerste'],
['Shorts', '/pages/shorts', 'Korte fragmenten uit onze documentaires', 'shorts short kort korte fragment fragmenten clip clips']
];
const norm = x => x.toLocaleLowerCase('nl').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]+/g, ' ');
let lastHits = '';
const searchHits = () => {
const old = document.getElementById('bagage-page-hits');
const onSearch = /^\/[a-z]{2}\/search\/?$/.test(location.pathname);
document.documentElement.classList.toggle('bagage-search-light', onSearch);
if (!onSearch) { if (old) old.remove(); lastHits = ''; return; }
const term = norm(new URLSearchParams(location.search).get('term') || '').trim();
const words = term.split(/\s+/).filter(w => w.length >= 2);
const hits = words.length ? PAGES.filter(([title, , , keys]) => {
const k = norm(title + ' ' + keys).split(/\s+/);
return words.some(w => k.some(x => x.startsWith(w) || (w.length >= 4 && w.startsWith(x) && x.length >= 4)));
}) : [];
const sig = location.search + '|' + hits.length;
const grid = document.querySelector('.page-transition .search-results-grid');
const head = document.querySelector('.page-transition div.mt-20.mb-20');
const anchor = grid || (head && head.nextSibling);
if (old && sig === lastHits && old.isConnected && (!anchor || old.nextSibling === anchor || old.previousSibling === head)) return;
if (old) old.remove();
lastHits = sig;
if (!hits.length || !(grid || head)) return;
const box = document.createElement('div');
box.id = 'bagage-page-hits';
box.style.cssText = 'color:#f4f1e9;margin:4px 0 26px;display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))';
const lab = document.createElement('div');
lab.textContent = 'Pagina\u2019s op Bagage';
lab.style.cssText = 'grid-column:1/-1;font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.7';
box.append(lab);
const lang = (location.pathname.split('/')[1] || 'nl');
hits.forEach(([title, path, desc]) => {
const a = document.createElement('a');
const href = '/' + lang + path;
a.href = href;
a.style.cssText = 'display:block;padding:14px 16px;border:1px solid rgba(255,255,255,.18);border-left:3px solid #ef6a28;border-radius:6px;color:#f4f1e9;text-decoration:none;background:rgba(255,255,255,.04)';
a.innerHTML = '<b style="display:block;font-size:16px;margin-bottom:4px"></b><span style="font-size:13px;opacity:.75"></span>';
a.querySelector('b').textContent = title;
a.querySelector('span').textContent = desc;
a.addEventListener('click', ev => { ev.preventDefault(); if (!window.__bagageGo(href)) location.href = href; });
box.append(a);
});
if (grid) grid.parentNode.insertBefore(box, grid); else head.parentNode.insertBefore(box, head.nextSibling);
};
let shTimer = 0, lbTimer = 0;
const labels = () => {
/* Revidd hergebruikt de tabknoppen: bij elke wijziging opnieuw kijken welke knop 'Nieuwsbrief' is */
document.querySelectorAll('button[value]').forEach(b => {
const on = /^nieuwsbrief$/i.test(b.textContent.trim());
if (on !== b.hasAttribute('data-bagage-duiding')) b.toggleAttribute('data-bagage-duiding', on);
});
document.querySelectorAll('span[style]').forEach(sp => {
const on = !sp.childElementCount && /^read more\s*→?$/i.test(sp.textContent.trim());
if (on !== sp.hasAttribute('data-bagage-lees')) sp.toggleAttribute('data-bagage-lees', on);
});
};
new MutationObserver(() => {
if (!shTimer) shTimer = setTimeout(() => { shTimer = 0; searchHits(); }, 120);
if (!lbTimer) lbTimer = setTimeout(() => { lbTimer = 0; labels(); }, 100);
document.querySelectorAll('.MuiDrawer-paper p.rd-menu__item').forEach(p => {
if (!p.textContent.trim() && !p.querySelector('img,svg')) (p.closest('div.cursor-pointer') || p).style.setProperty('display', 'none', 'important');
});
}).observe(document.body, { childList: true, subtree: true, characterData: true });
const restoreGuard = () => {
let saved = null;
try { saved = JSON.parse(sessionStorage.getItem('bagageHomeScroll') || 'null'); } catch (e) {}
if (!saved || !saved.y || saved.path !== location.pathname || Date.now() - saved.t > 30 * 60 * 1000) return;
const y = saved.y, minY = y - 40;
const hold = document.createElement('style');
hold.textContent = 'div.max-w-screen-lg > iframe.w-full.block{min-height:' + Math.max(saved.h || 0, y + innerHeight) + 'px!important}';
document.head.append(hold);
const desc = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
const ps = document.querySelector('.bg-bodyBg');
const els = [document.documentElement, document.body, ps].filter(Boolean);
els.forEach(el => Object.defineProperty(el, 'scrollTop', { configurable: true,
get() { return desc.get.call(this); },
set(v) { if (+v < minY) return; desc.set.call(this, v); } }));
const wTo = window.scrollTo, wS = window.scroll;
const tTop = (a, b) => (a && typeof a === 'object') ? a.top : b;
window.scrollTo = function (a, b) { const t = tTop(a, b); if (t !== undefined && +t < minY) return; return wTo.apply(this, arguments); };
window.scroll = function (a, b) { const t = tTop(a, b); if (t !== undefined && +t < minY) return; return wS.apply(this, arguments); };
let done = false;
const release = () => {
if (done) return; done = true;
els.forEach(el => { delete el.scrollTop; });
window.scrollTo = wTo; window.scroll = wS;
hold.remove();
};
['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(ev => addEventListener(ev, release, { once: true, passive: true, capture: true }));
setTimeout(release, 3000);
const box = () => (ps && ps.isConnected && getComputedStyle(ps).overflowY !== 'visible' && ps.scrollHeight > ps.clientHeight + 1) ? ps : document.scrollingElement;
const tick = () => {
if (done) return;
const b = box();
if (Math.abs(desc.get.call(b) - y) > 4 && b.scrollHeight - b.clientHeight >= y - 5) desc.set.call(b, y);
requestAnimationFrame(tick);
};
tick();
};
addEventListener('popstate', restoreGuard);
}
if (!doc.getElementById('bagage-site-fix-js')) {
const sc = doc.createElement('script');
sc.id = 'bagage-site-fix-js';
sc.textContent = '(' + topFix.toString() + ')()';
doc.head.append(sc);
}
if (top === window) return;
document.addEventListener('click', e => {
if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
const a = e.target.closest && e.target.closest('a[href]');
if (!a || a.hasAttribute('download') || /^#/.test(a.getAttribute('href'))) return;
const tg = a.getAttribute('target');
if (tg && !/^_(top|self|parent)$/.test(tg)) return;
let u;
try { u = new URL(a.href, top.location.href); } catch (err) { return; }
if (u.origin !== top.location.origin || !/^\/[a-z]{2}(\/|$)/.test(u.pathname)) return;
if (u.pathname === top.location.pathname) return;
if (top.__bagageGo && top.__bagageGo(u.pathname + u.search + u.hash)) e.preventDefault();
});
})();
