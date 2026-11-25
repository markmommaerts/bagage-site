/* =========================================================
   BAGAGE — REEKS- EN DOSSIERPAGINA'S (gedeeld gedrag)
   Laad na reeksen.js en vóór bagage-site.js. Werkt op <div id="bagage-reeks" class="bagage-reeks" …>.

   Instellingen op die div:
     data-seizoen      Revidd-id van het seizoen (de reeks of het dossier dat je huurt)
     data-soort        reeks | dossier | documentaire   (bepaalt "Deel 1" of "Documentaire 1", "de reeks" of "het dossier")
                       documentaire = partnerpagina rond één losse documentaire (data-seizoen = id van de film in Revidd):
                       één groot blok met beeld en korte inhoud, geen korte versies, geen prijsvoordeel
     data-nieuwsbrief  naam van de Ghost-nieuwsbrief (bv. GoodPlanet, In Flanders Fields Museum, Bagage)
     data-label        label op het nieuwe lid in Ghost (bv. Bron: partnerpagina GoodPlanet)

   Wat de code zelf doet:
     - afleveringen of documentaires van het seizoen tonen: beeld, titel, duur, korte inhoud (hover; vaste tekst op gsm)
       → elke klik gaat naar het seizoen
     - links met data-link="seizoen" naar het seizoen laten wijzen (huurknop, eerste videoblok, balk onder de afleveringen)
     - prijs in de huurknop uit het prijsveld in Revidd: "Huur 11,99 € · 1 maand · of 3 credits"
     - prijsvoordeel: "Huur het dossier en bespaar 3,97 €" (losse prijzen samen min de prijs van het seizoen)
     - Kijk zoals je wil: tabbladen volledige reeks (data-seizoen), korte versies (data-kort, leeg = binnenkort) en shorts
     - Achtergrond (Ghost-artikels met de media-UID van een aflevering als tag)
     - Meer reeksen & dossiers (uit reeksen.js), nieuwsbrief-inschrijving, trailer, kop van Revidd
   ========================================================= */
(() => {
  const root = document.getElementById('bagage-reeks');
  if (!root) return;

  const STORE = 'https://bagage.store1.revidd.video/nl/';
  const SHORTS_PAGE = STORE + 'pages/shorts';
  const API = 'https://bagage.api1.revidd.video/partner/v1/content/fetch';
  const API_KEY = '4649e3177994e74974747df6ae98c9868791c5bcfc673faa';
  const GHOST_CONTENT = 'https://bagage.ghost.io/ghost/api/content/posts/';
  const GHOST_KEY = 'ba7d6876786ccada3ce5ee5da1';
  const GHOST_MEMBERS = 'https://bagage.ghost.io/members/api/';
  const SIGNUP = 'https://bagage.ghost.io/#/portal/signup';
  const CDN = 'https://1577787583.rsc.cdn77.org/';
  const CREDIT = 3.99;                                  // 1 credit = prijs van één documentaire

  const cfg = root.dataset;
  const isDossier = cfg.soort === 'dossier';
  const isDocu = cfg.soort === 'documentaire';
  const woord = isDocu
    ? { het:'de documentaire', deel:'Documentaire', stuks:'documentaires', een:'documentaire' }
    : isDossier
    ? { het:'het dossier', deel:'Documentaire', stuks:'documentaires', een:'documentaire' }
    : { het:'de reeks', deel:'Deel', stuks:'afleveringen', een:'aflevering' };
  /* Optioneel: andere woorden voor de afleveringen, bv. data-deel="Kort" data-stuks="korte versies" */
  if (cfg.deel) woord.deel = cfg.deel;
  if (cfg.stuks) woord.stuks = cfg.stuks;
  const el = (t, c, txt) => { const n = document.createElement(t); if (c) n.className = c; if (txt) n.textContent = txt; return n; };
  const euro = n => n.toFixed(2).replace('.', ',') + ' €';
  const credits = n => { const c = Math.max(1, Math.round(n / CREDIT)); return c + (c === 1 ? ' credit' : ' credits'); };
  const duur = d => {
    const m = /^(\d+)_(DAYS|WEEKS|MONTHS|YEARS)$/.exec(d || ''); if (!m) return '';
    const n = +m[1], w = { DAYS:['dag','dagen'], WEEKS:['week','weken'], MONTHS:['maand','maanden'], YEARS:['jaar','jaar'] }[m[2]];
    return n + ' ' + w[n === 1 ? 0 : 1];
  };
  /* Prijs van een titel: bij meerdere huurformules telt de hoogste (de gewone prijs, bv. 3,99 € · 1 maand) */
  const prijs = item => {
    const t = (item && item.tvod || []).filter(x => x && x.price > 0).sort((a, b) => b.price - a.price)[0];
    return t ? { price:t.price, duur:duur(t.duration) } : null;
  };
  const img = (list, width) => { const i = list && list[0]; return i && i.mediaPath ? CDN + i.mediaPath + '?width=' + width : ''; };
  const minuten = s => s ? Math.round(s / 60) + ' min' : '';
  const naam = (title, reeks) => {
    let t = (title || '').trim();
    if (t.includes(': ')) t = t.slice(t.lastIndexOf(': ') + 2);
    else if (reeks && t.toLowerCase().startsWith(reeks.toLowerCase() + ' - ')) t = t.slice(reeks.length + 3);
    else if (t.includes(' - ')) t = t.slice(t.indexOf(' - ') + 3);
    return t;
  };

  /* ---------- Kop van Revidd (zolang deze pagina open staat); geen onderbalk meer op gsm ---------- */
  (() => {
    let host;
    try { host = window.parent && window.parent !== window ? window.parent.document : document; } catch { return; }
    const view = host.defaultView;
    const lang = () => view.location.pathname.split('/')[1] || 'nl';
    if (!host.getElementById('bagage-reeks-chrome')) {
      const style = host.createElement('style');
      style.id = 'bagage-reeks-chrome';
      style.textContent =
        'div:has(> button > img[src*="ic-back"]){display:none!important}' +
        '.bagage-head{transition:background-color .3s ease}' +
        '.bagage-head.bagage-head-solid{background-color:rgba(9,12,13,.94)!important}' +
        '.MuiDrawer-paper div.cursor-pointer:has(> p.rd-menu__item:empty){display:none!important}';
      host.head.append(style);
      const onLogo = e => {
        const t = e.target;
        const box = t.closest && t.closest('a, [class*="cursor-pointer"]');
        const isLogo = (t.matches && t.matches('img[alt="NavLogo"]')) || (box && box.querySelector('img[alt="NavLogo"]'));
        if (!isLogo) return;
        e.preventDefault(); e.stopPropagation();
        const home = '/' + lang();
        if (!(view.__bagageGo && view.__bagageGo(home))) view.location.href = home;
      };
      host.addEventListener('click', onLogo, true);
      const cleanup = () => { style.remove(); host.removeEventListener('click', onLogo, true); };
      window.addEventListener('pagehide', cleanup);
      window.addEventListener('unload', cleanup);
    }
    const frame = window.frameElement;
    if (!frame) return;
    /* Hoeveel van de Revidd-kop over het kader valt (voor de lezer van Achtergrond) */
    const measure = () => {
      const logo = host.querySelector('img[alt="NavLogo"]');
      const header = logo && logo.closest('.fixed');
      if (!header) return;
      const v = host.defaultView;
      let st = (host.scrollingElement || host.documentElement).scrollTop;
      for (let p = frame.parentElement; p && p !== host.body; p = p.parentElement) {
        const oy = v.getComputedStyle(p).overflowY;
        if (oy !== 'visible' && oy !== 'clip' && p.scrollHeight > p.clientHeight + 1) { st = p.scrollTop; break; }
      }
      const b = header.getBoundingClientRect().bottom;
      if (st <= 2 || !v.__bagageHeaderMax) v.__bagageHeaderMax = Math.max(v.__bagageHeaderMax || 0, b);
      root.style.setProperty('--revidd-header', Math.max(0, Math.round(v.__bagageHeaderMax - (frame.getBoundingClientRect().top + st))) + 'px');
    };
    window.addEventListener('load', measure);
    view.addEventListener('resize', measure);
    setTimeout(measure, 1500);
    const solid = () => {
      const logo = host.querySelector('img[alt="NavLogo"]');
      const header = logo && logo.closest('.fixed');
      if (!header) return;
      header.classList.add('bagage-head');
      header.classList.toggle('bagage-head-solid', window.scrollY > 10 || view.scrollY > 10);
    };
    window.addEventListener('scroll', solid, { passive:true });
    view.addEventListener('scroll', solid, { passive:true });
    setTimeout(solid, 1500);
  })();

  /* ---------- Terugknop: terug naar waar de bezoeker vandaan kwam ----------
     Kwam je via de catalogus, Welkom, zoeken … dan wordt "← Alle reeksen & dossiers" bv. "← Terug naar de catalogus"
     en brengt de knop je terug naar die pagina, op dezelfde plek. Rechtstreeks binnengekomen (bv. vanaf de site van
     de partner): de knop blijft "Alle reeksen & dossiers". bagage-site.js houdt bij waar je vandaan kwam. */
  (() => {
    const back = root.querySelector('.pk-back');
    if (!back) return;
    let top, van = '';
    try { top = window.top; } catch { return; }
    try {
      const here = top.location.pathname;
      const rec = JSON.parse(top.sessionStorage.getItem('bagageVan') || 'null');
      if (rec && rec.van && rec.van.split('?')[0] !== here && (rec.naar === here || Date.now() - rec.t < 30000)) van = rec.van;
      if (!van && top.document.referrer) {
        const r = new URL(top.document.referrer);
        if (r.origin === top.location.origin && r.pathname !== here) van = r.pathname + r.search;
      }
    } catch { return; }
    if (!van || top.history.length < 2) return;
    const p = van.split('?')[0];
    const label =
      van === '?' ? 'Terug' :
      /\/pages\/catalogus\/?$/.test(p) ? 'Terug naar de catalogus' :
      /\/pages\/partnerkeuze\/?$/.test(p) ? 'Alle reeksen & dossiers' :
      /\/pages\/shorts\/?$/.test(p) ? 'Terug naar de shorts' :
      /\/search(\/|$)/.test(p) ? 'Terug naar je zoekresultaten' :
      /^\/[a-z]{2}\/?$/.test(p) ? 'Terug naar Welkom' : 'Terug';
    back.textContent = '← ' + label;
    back.addEventListener('click', e => { e.preventDefault(); top.history.back(); });
  })();

  /* ---------- Trailer: eerst eigen thumbnail, speler op 1920×1080 geschaald naar het kader ---------- */
  const tf = root.querySelector('.trailer-frame');
  if (tf) {
    const fit = () => tf.style.setProperty('--trailer-scale', tf.clientWidth / 1920);
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(tf); else window.addEventListener('resize', fit);
    const tp = tf.querySelector('.trailer-poster');
    const frameEl = tf.querySelector('iframe');
    if (tp && frameEl) {
      const mid = (frameEl.getAttribute('data-src').match(/mid=(\d+)/) || [])[1];
      if (mid) fetch('https://api.revidd.com/media/v1/org/public/video/' + mid)
        .then(r => r.ok ? r.json() : null)
        .then(d => { const p = d && d.video && d.video.cover && d.video.cover.mediaPath; if (p) tp.style.backgroundImage = "url('" + CDN + p + "?width=1200')"; })
        .catch(() => {});
      if (window.matchMedia && window.matchMedia('(pointer:coarse)').matches) {
        /* Aanraakscherm: de speler laadt al onder onze eigen afbeelding met afspeelknop (zelfde als op desktop).
           De tik gaat door naar de speler; zodra die de focus krijgt, verdwijnt de afbeelding. */
        frameEl.src = frameEl.getAttribute('data-src');
        tp.style.pointerEvents = 'none';
        let poll = 0;
        const weg = () => { clearInterval(poll); window.removeEventListener('blur', check); tp.classList.add('is-hidden'); setTimeout(() => tp.remove(), 400); };
        const check = () => setTimeout(() => { if (document.activeElement === frameEl) weg(); }, 0);
        window.addEventListener('blur', check);
        poll = setInterval(() => { if (document.activeElement === frameEl) weg(); }, 300);
      } else {
        tp.addEventListener('click', () => {
          if (tp.classList.contains('is-loading')) return;
          tp.classList.add('is-loading');
          let done = false;
          const hide = () => { if (done) return; done = true; tp.classList.add('is-hidden'); setTimeout(() => tp.remove(), 400); };
          frameEl.addEventListener('load', () => setTimeout(hide, 1500));
          setTimeout(hide, 5000);
          frameEl.src = frameEl.getAttribute('data-src');
        });
      }
    }
  }

  /* ---------- Kijk zoals je wil: tabbladen Volledige reeks · Korte versies · Shorts ---------- */
  const tabs = [...root.querySelectorAll('.kijk-tabs [role="tab"]')];
  const kies = t => tabs.forEach(x => {
    const on = x === t;
    x.setAttribute('aria-selected', on ? 'true' : 'false');
    x.tabIndex = on ? 0 : -1;
    const pan = root.querySelector('#' + x.getAttribute('aria-controls'));
    if (pan) pan.hidden = !on;
  });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => kies(t));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const n = tabs[(i + d + tabs.length) % tabs.length]; kies(n); n.focus();
    });
  });

  /* ---------- Contextkaarten van de partner: beelden uit reeksen.js (veld kaders), zodat een nieuw beeld
     geen nieuwe plakbeurt van de pagina vraagt ---------- */
  (() => {
    const entry = (window.BAGAGE_REEKSEN || []).find(r => r.page === cfg.pagina);
    const kaders = (entry && entry.kaders) || [];
    root.querySelectorAll('.context-image img').forEach((im, i) => {
      const url = kaders[i];
      if (url) im.src = url.replace(/\?.*$/, '') + '?width=1000';
    });
  })();

  /* ---------- Shorts: samen op de Shorts-pagina (adres hier centraal). Staan er shorts van deze reeks
     in reeksen.js (veld shorts: media-id's van de reels), dan komen ze naast elkaar in het tabblad. ---------- */
  const shortsUrl = uid => SHORTS_PAGE + '?' + [uid ? 's=' + encodeURIComponent(uid) : '', cfg.shorts ? 'onderwerp=' + encodeURIComponent(cfg.shorts) : ''].filter(Boolean).join('&');
  root.querySelectorAll('a[data-link="shorts"]').forEach(a => { a.href = shortsUrl().replace(/\?$/, ''); });
  /* Kaart "De shorts" (pagina zonder eigen shorts): altijd een staand 9:16-beeld. Liggende of 2:3-beelden
     werden in het staande kader zwaar bijgesneden en op iPhone soms als strook bovenaan getekend.
     Eigen beeld per pagina: veld shortsBeeld in reeksen.js (staand, 1080×1920). */
  (() => {
    const entry = (window.BAGAGE_REEKSEN || []).find(r => r.page === cfg.pagina);
    const STAAND = 'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/fc50878b-26de-41c3-8e29-1bf20ff1a96c.jpg';
    root.querySelectorAll('a.shorts-card .shorts-pic').forEach(pic => {
      const im = pic.querySelector('img');
      if (!im) return;
      im.addEventListener('load', () => { pic.style.backgroundImage = 'url("' + (im.currentSrc || im.src) + '")'; pic.classList.add('bg'); });
      im.src = ((entry && entry.shortsBeeld) || STAAND).replace(/\?.*$/, '') + '?width=600';
    });
  })();
  /* Zelfde afspraak als de startpagina: de Shorts-pagina begint bij deze short; met de terugknop
     daar kom je terug op deze pagina, op dezelfde plek (bagage-site.js bewaart de scrollpositie). */
  root.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a.short-item');
    if (!a) return;
    try { (window.parent !== window ? window.parent : window).sessionStorage.setItem('bagageShortsCurrent', a.dataset.uid); } catch (err) { /* geen opslag */ }
  });
  (async () => {
    const row = root.querySelector('.shorts-row');
    const entry = (window.BAGAGE_REEKSEN || []).find(r => r.page === cfg.pagina);
    const uids = (entry && entry.shorts) || [];
    if (!row || !uids.length) return;
    const infos = await Promise.all(uids.map(uid => fetch('https://api.revidd.com/media/v1/org/public/video/' + encodeURIComponent(uid))
      .then(r => r.ok ? r.json() : null).then(j => j && j.video ? { uid, v:j.video } : null).catch(() => null)));
    const ok = infos.filter(Boolean);
    if (!ok.length) return;
    row.replaceChildren(...ok.map(({ uid, v }) => {
      const a = el('a', 'short-item'); a.href = shortsUrl(uid); a.target = '_top'; a.dataset.uid = uid;
      const pic = el('span', 'shorts-pic');
      const im = el('img'); im.alt = '';
      im.src = v.cover && v.cover.mediaPath ? CDN + v.cover.mediaPath + '?width=400' : '';
      const play = el('span', 'play'); play.setAttribute('aria-hidden', 'true'); play.append(el('span'));
      im.addEventListener('load', () => { pic.style.backgroundImage = 'url("' + (im.currentSrc || im.src) + '")'; pic.classList.add('bg'); });
      pic.append(im, play);
      a.append(pic, el('span', 'short-name', v.name || ''));
      a.setAttribute('aria-label', 'Bekijk de short: ' + (v.name || ''));
      return a;
    }));
    row.closest('.shorts-promo').classList.add('has-shorts');
  })();

  /* ---------- Gegevens uit Revidd: één keer ophalen, voor alles hieronder ---------- */
  const revidd = (async () => {
    const items = []; let skip = 0;
    while (true) {
      const r = await fetch(API, { method:'POST', headers:{ 'api-key':API_KEY, 'Content-Type':'application/json' }, body:JSON.stringify({ limit:100, skip }) });
      if (!r.ok) throw new Error('Revidd ' + r.status);
      const j = await r.json(); items.push(...j.data); skip += 100;
      if (!j.data.length || skip >= j.count) break;
    }
    return items;
  })();

  /* Titels van een seizoen (gesorteerd), of één losse titel */
  const titelsVan = (items, item) => {
    if (!item) return [];
    if (!item.episodes) return [item];
    const order = Object.fromEntries(item.episodes.map(e => [e.id, e.order]));
    return items.filter(x => x.seasonId === item.id).sort((a, b) => (order[a.id] ?? 99) - (order[b.id] ?? 99));
  };
  /* seoSlug zonder map (movies/ of seasons/): zelf aanvullen */
  const urlVan = item => STORE + ((item.seoSlug || '').includes('/') ? '' : (item.episodes ? 'seasons/' : 'movies/')) + item.seoSlug + '-' + item.id;
  const isGratis = eps => eps.length > 0 && eps.every(e => e.isFree && !prijs(e));

  /* Korte inhoud bij hover: tekst naast het beeld (rechts, of links als er geen plaats is),
     de andere titels vervagen. Op aanraakschermen staat de tekst gewoon onder het beeld. */
  const kanHover = window.matchMedia('(hover: hover) and (min-width: 761px)');
  function focusLezen(grid) {
    if (grid.dataset.lezen || grid.closest('.is-solo')) return;
    grid.dataset.lezen = '1';
    const box = grid.closest('.set');
    const pop = el('div', 'set-pop'); pop.setAttribute('aria-hidden', 'true'); pop.hidden = true;
    box.append(pop);
    const toon = item => {
      if (!kanHover.matches) return;
      const desc = item.querySelector('.set-desc');
      if (!desc) return;
      pop.replaceChildren(el('div', 'set-no', item.querySelector('.set-no').textContent), el('h3', 'set-name', item.querySelector('.set-name').textContent), el('p', '', desc.textContent));
      const b = box.getBoundingClientRect(), r = item.querySelector('.set-frame').getBoundingClientRect();
      const w = Math.min(380, Math.max(280, b.width * 0.3)), gap = 18;
      const rechts = b.right - r.right - gap >= w;
      pop.style.width = w + 'px';
      pop.style.left = (rechts ? r.right - b.left + gap : Math.max(8, r.left - b.left - gap - w)) + 'px';
      pop.style.top = (r.top - b.top) + 'px';
      pop.hidden = false;
      grid.classList.add('is-focus');
      grid.querySelectorAll('.set-item').forEach(x => x.classList.toggle('is-on', x === item));
    };
    const weg = () => { pop.hidden = true; grid.classList.remove('is-focus'); };
    grid.addEventListener('mouseover', e => { const it = e.target.closest('.set-item'); if (it) toon(it); });
    grid.addEventListener('mouseleave', weg);
    grid.addEventListener('focusin', e => { const it = e.target.closest('.set-item'); if (it) toon(it); });
    grid.addEventListener('focusout', weg);
  }

  /* Eén tabblad vullen: beeld, nummer, duur, titel en korte inhoud per titel */
  function vulPaneel(pan, item, eps, w) {
    if (!pan) return;
    const url = urlVan(item);
    pan.querySelectorAll('.set-cta').forEach(a => { a.href = url; });
    const grid = pan.querySelector('.set-grid');
    const solo = isDocu && eps.length === 1;           /* losse documentaire: één groot blok, tekst ernaast */
    pan.classList.toggle('is-solo', solo);
    grid.style.setProperty('--n', solo ? 1 : Math.min(Math.max(eps.length, 4), 6));
    const covers = eps.map(e => img(e.coverimage, 800));
    const allSame = covers.every(c => c && c === covers[0]);
    grid.replaceChildren(...eps.map((e, i) => {
      const a = el('a', 'set-item'); a.href = url;
      const frame = el('div', 'set-frame');
      const pic = el('img');
      const thumb = e.actualmedia && e.actualmedia[0] && e.actualmedia[0].coverUrl ? CDN + e.actualmedia[0].coverUrl + '?width=800' : '';
      pic.src = (allSame && thumb) ? thumb : (covers[i] || thumb || img(item.coverimage, 800));
      pic.alt = ''; pic.loading = 'lazy';
      frame.append(pic);
      const desc = (e.description || '').trim();
      const len = minuten(e.actualmedia && e.actualmedia[0] && e.actualmedia[0].duration);
      const nr = solo ? w.deel : w.deel + ' ' + (i + 1);
      a.append(frame, el('div', 'set-no', nr + (len ? ' · ' + len : '')), el('h3', 'set-name', naam(e.title, item.title)));
      if (desc) a.append(el('p', 'set-desc', desc));
      a.setAttribute('aria-label', 'Bekijk ' + naam(e.title, item.title));
      return a;
    }));
    const meta = pan.querySelector('.set-cta-meta');
    const soloDuur = solo ? minuten(eps[0].actualmedia && eps[0].actualmedia[0] && eps[0].actualmedia[0].duration) : '';
    if (meta) meta.textContent = solo ? [soloDuur, isGratis(eps) ? 'gratis' : ''].filter(Boolean).join(' · ')
      : eps.length + ' ' + (eps.length > 1 ? w.stuks : w.een) + (w.extra || (isGratis(eps) ? ' · gratis' : ''));
    focusLezen(grid);
    pan.classList.remove('is-soon');
    const sec = pan.closest('.section'); if (sec) sec.hidden = false;
  }

  revidd.then(items => {
    const byId = Object.fromEntries(items.map(i => [i.id, i]));
    const season = byId[cfg.seizoen];
    if (!season) { console.warn('Reekspagina: seizoen niet gevonden', cfg.seizoen); return; }
    const eps = titelsVan(items, season);

    /* Links naar het seizoen (of de titel) */
    root.querySelectorAll('[data-link="seizoen"]').forEach(a => { a.href = urlVan(season); });

    /* Tabblad 1: de volledige reeks / het volledige dossier */
    const gratis = isGratis(eps);
    vulPaneel(root.querySelector('#pan-vol') || root.querySelector('.set'), season, eps, { ...woord, extra: gratis ? ' · gratis' : isDocu ? '' : ' · één huurprijs' + (byId[cfg.kort] ? ', korte versies inbegrepen' : '') });

    /* Tabblad 2: de korte versies (apart seizoen in Revidd, data-kort) */
    const kort = byId[cfg.kort];
    if (kort) vulPaneel(root.querySelector('#pan-kort'), kort, titelsVan(items, kort), { deel:'Kort', stuks:'korte versies', een:'korte versie', extra: ' · inbegrepen bij ' + woord.het });

    /* Prijs en prijsvoordeel */
    const p = prijs(season);
    if (gratis) {
      root.querySelectorAll('.rent-btn[data-link="seizoen"] > span').forEach(s => { s.textContent = 'Bekijk gratis'; });
      root.querySelectorAll('.rent-btn[data-link="seizoen"] > small').forEach(s => { s.hidden = true; });
    } else if (p) {
      root.querySelectorAll('.rent-btn[data-link="seizoen"] > span').forEach(s => {
        s.textContent = 'Huur ' + euro(p.price) + (p.duur ? ' · ' + p.duur : '') + ' · of ' + credits(p.price);
      });
      const los = eps.length > 1 ? eps.map(prijs).filter(Boolean).reduce((s, x) => s + x.price, 0) : 0;
      const sav = root.querySelector('.access-saving');
      if (sav && los - p.price > 0.005) {
        sav.textContent = 'Huur ' + woord.het + ' en bespaar ' + euro(los - p.price) + '.';
        sav.hidden = false;
      }
      /* Liever één titel? Zijn de titels ook los te huren, dan een rustige regel onder de knoppen naar het seizoen,
         waar je elke titel apart kiest en huurt. */
      const eenLos = eps.length > 1 && eps.every(prijs) ? prijs(eps[0]) : null;
      const actions = root.querySelector('.access-actions');
      if (eenLos && actions && !root.querySelector('.access-los')) {
        const los1 = el('p', 'access-los');
        los1.append('Liever één ' + woord.een + '? Elke ' + woord.een + ' is ook apart te huren: ' + euro(eenLos.price) + (eenLos.duur ? ' · ' + eenLos.duur : '') + '. ');
        const a = el('a', '', 'Kies een ' + woord.een + ' →'); a.href = urlVan(season); a.target = '_top';
        los1.append(a);
        actions.after(los1);
      }
    }

    /* Achtergrond: Ghost-artikels bij de afleveringen */
    achtergrond(items, [season.id, ...(kort ? [kort.id] : []), ...(root.querySelector('.bg-achtergrond')?.dataset.reviddIds || '').split(',').map(x => x.trim()).filter(Boolean)]);
  }).catch(err => console.warn('Reekspagina', err));

  /* ---------- Achtergrond (Ghost) + lezer ---------- */
  function achtergrond(items, ids) {
    const box = root.querySelector('.bg-achtergrond');
    if (!box) return;
    const byId = Object.fromEntries(items.map(i => [i.id, i]));
    const uid = i => i && i.actualmedia && i.actualmedia[0] && i.actualmedia[0].id;
    const uids = new Set();
    /* Een duidingsartikel in Ghost hangt aan een titel via een tag met het Revidd Content ID (sinds oktober 2026;
       zo werkt ook de tab Duiding op de detailpagina's). Oudere artikels met de media-UID (#uid) blijven gevonden. */
    const cids = new Set();
    const add = id => {
      const item = byId[id]; if (!item) return;
      cids.add(String(item.id).toLowerCase());
      if (uid(item)) uids.add(String(uid(item)));
      (item.seasons || []).forEach(s => add(s.id));
      items.filter(x => x.seasonId === id).forEach(ep => { cids.add(String(ep.id).toLowerCase()); if (uid(ep)) uids.add(String(uid(ep))); });
    };
    ids.forEach(add);
    if (!uids.size && !cids.size) return;
    const tags = [...cids, ...[...uids].flatMap(u => ['hash-' + u, u])];
    const url = GHOST_CONTENT + '?key=' + GHOST_KEY + '&limit=6&filter=' +
      encodeURIComponent('tag:[' + tags.join(',') + ']') +
      '&fields=title,slug,html,excerpt,custom_excerpt,feature_image,published_at,reading_time,url&order=published_at%20desc';
    const date = iso => iso ? new Date(iso).toLocaleDateString('nl-BE', { day:'numeric', month:'long', year:'numeric' }) : '';
    const reader = el('div', 'bg-reader'); reader.hidden = true;
    reader.setAttribute('role', 'dialog'); reader.setAttribute('aria-modal', 'true'); reader.setAttribute('aria-label', 'Artikel');
    const inner = el('article', 'bg-reader-inner'); reader.append(inner); root.append(reader);
    let lastFocus = null;
    const close = () => { reader.hidden = true; document.documentElement.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
    reader.addEventListener('click', e => { if (e.target === reader) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !reader.hidden) close(); });
    const open = (post, trigger) => {
      lastFocus = trigger;
      const btn = el('button', 'bg-reader-close', '✕ Sluiten'); btn.type = 'button'; btn.addEventListener('click', close);
      const parts = [btn, el('div', 'bg-reader-kicker', 'Achtergrond'), el('h1', '', post.title || '')];
      const meta = [date(post.published_at), post.reading_time ? post.reading_time + ' min leestijd' : ''].filter(Boolean).join(' · ');
      if (meta) parts.push(el('p', 'bg-reader-meta', meta));
      if (post.feature_image) { const fig = el('figure', 'bg-reader-hero'), im = el('img'); im.src = post.feature_image; im.alt = ''; fig.append(im); parts.push(fig); }
      /* Opschonen in een losse kopie: geen scripts, kaders, formulieren, on…-attributen of javascript:-links */
      const clean = new DOMParser().parseFromString(post.html || '', 'text/html').body;
      clean.querySelectorAll('script, iframe, object, embed, form, link, meta, base, style').forEach(n => n.remove());
      clean.querySelectorAll('*').forEach(n => [...n.attributes].forEach(at => {
        const v = at.value.replace(/[\s\u0000-\u001f]+/g, '').toLowerCase();
        if (/^on/i.test(at.name) || (/^(javascript|vbscript|data:text)/.test(v) && /^(href|src|action|formaction|xlink:href)$/i.test(at.name))) n.removeAttribute(at.name);
      }));
      const body = el('div', 'bg-reader-body'); body.append(...clean.childNodes);
      body.querySelectorAll('a[href]').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
      parts.push(body);
      const foot = el('div', 'bg-reader-foot');
      const back = el('button', 'catalog-btn', '← Terug naar de pagina'); back.type = 'button'; back.addEventListener('click', close);
      const nb = root.querySelector('.bs-newsletter');
      const sub = el('a', 'catalog-btn', 'Schrijf je in op de nieuwsbrief →');
      if (nb) { sub.href = '#'; sub.addEventListener('click', e => { e.preventDefault(); close(); nb.scrollIntoView({ block:'start', behavior:'smooth' }); }); }
      else { sub.href = SIGNUP; sub.target = '_blank'; sub.rel = 'noopener'; }
      foot.append(back, sub); parts.push(foot);
      inner.replaceChildren(...parts);
      reader.hidden = false; reader.scrollTop = 0;
      document.documentElement.style.overflow = 'hidden';
      btn.focus();
    };
    fetch(url).then(r => r.ok ? r.json() : Promise.reject(r.status)).then(json => {
      const posts = (json && json.posts) || [];
      if (!posts.length) return;
      box.querySelector('.bg-posts').replaceChildren(...posts.slice(0, 6).map(post => {
        const a = el('a', 'bg-post'); a.href = post.url;
        a.addEventListener('click', e => { if (post.html) { e.preventDefault(); open(post, a); } });
        if (post.feature_image) { const fig = el('div', 'bg-post-img'), im = el('img'); im.src = post.feature_image; im.alt = ''; im.loading = 'lazy'; fig.append(im); a.append(fig); }
        const body = el('div', 'bg-post-body');
        const d = date(post.published_at); if (d) body.append(el('span', 'bg-post-date', d));
        body.append(el('h3', 'bg-post-title', post.title || ''));
        const ex = (post.custom_excerpt || post.excerpt || '').trim(); if (ex) body.append(el('p', 'bg-post-excerpt', ex));
        body.append(el('span', 'bg-post-more', 'Lees verder →'));
        a.append(body); return a;
      }));
      box.hidden = false;
    }).catch(err => console.warn('Ghost', err));
  }

  /* ---------- Meer reeksen & dossiers (uit reeksen.js), zonder deze pagina ---------- */
  const pkRow = root.querySelector('.pk-andere .pk-row');
  if (pkRow) {
    const data = window.BAGAGE_REEKSEN || [];
    let path = location.pathname;
    try { if (window.parent !== window) path = window.parent.location.pathname; } catch { /* ander domein */ }
    const current = cfg.pagina || path.split('/').filter(Boolean).pop() || '';
    const others = data.filter(r => current.indexOf(r.page) !== 0).slice(0, 3);
    if (!others.length) root.querySelector('.pk-andere').hidden = true;
    others.forEach(r => {
      const a = el('a', 'pk-item'); a.href = r.href;
      const v = el('div', 'pk-visual');
      const im = el('img'); im.src = r.image + (r.image.includes('?') ? '' : '?width=1200'); im.alt = ''; im.loading = 'lazy';
      v.append(im, el('span', 'pk-type', r.type));
      a.append(v, el('span', 'pk-name', r.partner ? r.partner.name : 'BAGAGE'), el('span', 'pk-title', r.title));
      pkRow.append(a);
    });
  }

  /* ---------- Nieuwsbrief: inschrijven op de nieuwsbrief van deze partner, met label ---------- */
  const form = root.querySelector('.nb-form');
  if (form) {
    const status = form.parentElement.querySelector('.nb-status');
    const say = (txt, cls) => { status.textContent = txt; status.className = 'nb-status ' + (cls || ''); status.hidden = false; };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email = form.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { say('Vul een geldig e-mailadres in.', 'is-err'); form.email.focus(); return; }
      const btn = form.querySelector('button'); btn.disabled = true; say('Even geduld…');
      try {
        const token = await fetch(GHOST_MEMBERS + 'integrity-token/').then(r => r.ok ? r.text() : '');
        const body = { email, emailType:'signup', integrityToken:token };
        if (cfg.nieuwsbrief) body.newsletters = [{ name:cfg.nieuwsbrief }];
        if (cfg.label) body.labels = [cfg.label];
        const r = await fetch(GHOST_MEMBERS + 'send-magic-link/', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(body) });
        if (!r.ok) throw new Error('Ghost ' + r.status);
        form.reset();
        say('Bijna klaar: bevestig je inschrijving via de mail die we je net stuurden.', 'is-ok');
      } catch (err) {
        console.warn('Nieuwsbrief', err);
        say('Dat lukte niet. Probeer het opnieuw, of schrijf je in via bagage.ghost.io.', 'is-err');
        window.open(SIGNUP, '_blank', 'noopener');
      } finally { btn.disabled = false; }
    });
  }

  /* ---------- Links: eigen pagina's als volledige pagina, externe sites in een nieuw tabblad ---------- */
  const targets = () => root.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (href.charAt(0) === '#' || href.indexOf('mailto:') === 0) return;
    if (href.indexOf('https://bagage.store1.revidd.video/') === 0) { a.target = '_top'; return; }
    a.target = '_blank'; a.rel = 'noopener';
  });
  targets();
  revidd.then(targets).catch(() => {});
})();
