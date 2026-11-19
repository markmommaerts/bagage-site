/* =========================================================
   BAGAGE — REEKS- EN DOSSIERPAGINA'S (gedeeld gedrag)
   Laad na reeksen.js en vóór bagage-site.js. Werkt op <div id="bagage-reeks" class="bagage-reeks" …>.

   Instellingen op die div:
     data-seizoen      Revidd-id van het seizoen (de reeks of het dossier dat je huurt)
     data-soort        reeks | dossier   (bepaalt "Deel 1" of "Documentaire 1", "de reeks" of "het dossier")
     data-nieuwsbrief  naam van de Ghost-nieuwsbrief (bv. GoodPlanet, In Flanders Fields Museum, Bagage)
     data-label        label op het nieuwe lid in Ghost (bv. Bron: partnerpagina GoodPlanet)

   Wat de code zelf doet:
     - afleveringen of documentaires van het seizoen tonen: beeld, titel, duur, korte inhoud (hover; vaste tekst op gsm)
       → elke klik gaat naar het seizoen
     - links met data-link="seizoen" naar het seizoen laten wijzen (huurknop, eerste videoblok, balk onder de afleveringen)
     - prijs in de huurknop uit het prijsveld in Revidd: "Huur 11,99 € · 1 maand · of 3 credits"
     - prijsvoordeel: "Huur het dossier en bespaar 3,97 €" (losse prijzen samen min de prijs van het seizoen)
     - videoblokken zonder link (LINK_…) tonen als "Binnenkort"
     - Achtergrond (Ghost-artikels met de media-UID van een aflevering als tag)
     - Meer reeksen & dossiers (uit reeksen.js), nieuwsbrief-inschrijving, trailer, kop en onderbalk van Revidd
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
  const woord = isDossier
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
  const prijs = item => { const t = item && (item.tvod || []).find(x => x && x.price > 0); return t ? { price:t.price, duur:duur(t.duration) } : null; };
  const img = (list, width) => { const i = list && list[0]; return i && i.mediaPath ? CDN + i.mediaPath + '?width=' + width : ''; };
  const minuten = s => s ? Math.round(s / 60) + ' min' : '';
  const naam = (title, reeks) => {
    let t = (title || '').trim();
    if (t.includes(': ')) t = t.slice(t.lastIndexOf(': ') + 2);
    else if (reeks && t.toLowerCase().startsWith(reeks.toLowerCase() + ' - ')) t = t.slice(reeks.length + 3);
    else if (t.includes(' - ')) t = t.slice(t.indexOf(' - ') + 3);
    return t;
  };

  /* ---------- Kop en onderbalk van Revidd (zolang deze pagina open staat) ---------- */
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
        '#bagage-bottombar{position:fixed;left:0;right:0;bottom:0;z-index:60;display:none;justify-content:space-around;align-items:center;' +
        'padding:10px 0 calc(10px + env(safe-area-inset-bottom));background:#000;color:#fff;font:12px/1.2 Arial,Helvetica,sans-serif;border-top:1px solid #272d2f}' +
        '#bagage-bottombar button{appearance:none;background:none;border:0;color:#aaa8a2;display:flex;flex-direction:column;align-items:center;gap:4px;font:inherit;cursor:pointer;padding:0 12px}' +
        '#bagage-bottombar img{height:20px;width:20px}' +
        '@media (max-width:639px){#bagage-bottombar{display:flex}}' +
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
        view.location.href = '/' + lang();
      };
      host.addEventListener('click', onLogo, true);
      let bar = host.getElementById('bagage-bottombar');
      if (!bar) {
        bar = host.createElement('nav');
        bar.id = 'bagage-bottombar';
        bar.setAttribute('aria-label', 'Snelmenu');
        bar.innerHTML =
          '<button type="button" data-go="home"><img src="/icons/home.svg" alt=""><span>Home</span></button>' +
          '<button type="button" data-go="search"><img src="/icons/search-icon.svg" alt=""><span>Zoeken</span></button>' +
          '<button type="button" data-go="profile"><img src="/icons/profile_inactive.svg" alt=""><span>Profiel</span></button>';
        bar.addEventListener('click', e => {
          const btn = e.target.closest('button'); if (!btn) return;
          const go = btn.dataset.go;
          if (go === 'home') view.location.href = '/' + lang();
          if (go === 'profile') view.location.href = '/' + lang() + '/settings?s';
          if (go === 'search') { const icon = host.querySelector('img[alt="searchIcon"]'); if (icon) icon.click(); }
        });
        host.body.append(bar);
      }
      const cleanup = () => { style.remove(); bar.remove(); host.removeEventListener('click', onLogo, true); };
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
        frameEl.src = frameEl.getAttribute('data-src'); tp.remove();
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

  /* ---------- Videoblokken: zonder link (nog LINK_…) staan ze er als "Binnenkort" ---------- */
  const syncFormats = () => root.querySelectorAll('.format').forEach(b => {
    const a = b.querySelector('.format-frame a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const soon = !href || /^LINK_/.test(href) || href === '#';
    b.classList.toggle('is-soon', soon);
    if (soon) {
      a.removeAttribute('href');
      a.setAttribute('aria-disabled', 'true');
      if (!a.querySelector('.soon')) a.append(el('span', 'soon', 'Binnenkort'));
    }
  });
  syncFormats();

  /* ---------- Shorts: altijd gratis, samen op de Shorts-pagina. Adres hier centraal aanpassen
     (later: per onderwerp filteren via data-pagina). ---------- */
  root.querySelectorAll('a[data-link="shorts"]').forEach(a => {
    a.href = SHORTS_PAGE + (cfg.shorts ? '?onderwerp=' + encodeURIComponent(cfg.shorts) : '');
    if (!a.querySelector('.gratis')) a.append(el('span', 'gratis', 'Gratis'));
  });

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

  revidd.then(items => {
    const byId = Object.fromEntries(items.map(i => [i.id, i]));
    const season = byId[cfg.seizoen];
    if (!season) { console.warn('Reekspagina: seizoen niet gevonden', cfg.seizoen); return; }
    const order = Object.fromEntries((season.episodes || []).map(e => [e.id, e.order]));
    const eps = items.filter(x => x.seasonId === season.id)
      .sort((a, b) => (order[a.id] ?? 99) - (order[b.id] ?? 99));
    const seasonUrl = STORE + season.seoSlug + '-' + season.id;

    /* Links naar het seizoen */
    root.querySelectorAll('[data-link="seizoen"]').forEach(a => { a.href = seasonUrl; });
    syncFormats();

    /* Zijn alle afleveringen gratis (en zonder huurprijs), dan is de reeks gratis te bekijken */
    const gratis = eps.length > 0 && eps.every(e => e.isFree && !prijs(e));

    /* Afleveringen / documentaires als één geheel */
    const set = root.querySelector('.set');
    if (set && eps.length) {
      const grid = set.querySelector('.set-grid');
      grid.style.setProperty('--n', Math.min(eps.length, 6));
      const covers = eps.map(e => img(e.coverimage, 800));
      const allSame = covers.every(c => c && c === covers[0]);
      grid.replaceChildren(...eps.map((e, i) => {
        const a = el('a', 'set-item'); a.href = seasonUrl;
        const frame = el('div', 'set-frame');
        const pic = el('img');
        const thumb = e.actualmedia && e.actualmedia[0] && e.actualmedia[0].coverUrl ? CDN + e.actualmedia[0].coverUrl + '?width=800' : '';
        pic.src = (allSame && thumb) ? thumb : (covers[i] || thumb || img(season.coverimage, 800));
        pic.alt = ''; pic.loading = 'lazy';
        frame.append(pic);
        const desc = (e.description || '').trim();
        if (desc) { const h = el('span', 'set-hint', desc); h.setAttribute('aria-hidden', 'true'); frame.append(h); }
        const len = minuten(e.actualmedia && e.actualmedia[0] && e.actualmedia[0].duration);
        a.append(frame, el('div', 'set-no', woord.deel + ' ' + (i + 1) + (len ? ' · ' + len : '')), el('h3', 'set-name', naam(e.title, season.title)));
        if (desc) a.append(el('p', 'set-desc', desc));
        a.setAttribute('aria-label', 'Bekijk ' + woord.het + ': ' + naam(e.title, season.title));
        return a;
      }));
      const meta = set.querySelector('.set-cta-meta');
      if (meta) meta.textContent = eps.length + ' ' + woord.stuks + (gratis ? ' · gratis' : ' · één huurprijs');
      set.closest('.section').hidden = false;
    }

    /* Prijs en prijsvoordeel */
    const p = prijs(season);
    if (gratis) {
      root.querySelectorAll('.rent-btn[data-link="seizoen"] > span').forEach(s => { s.textContent = 'Bekijk gratis'; });
      root.querySelectorAll('.rent-btn[data-link="seizoen"] > small').forEach(s => { s.hidden = true; });
    } else if (p) {
      root.querySelectorAll('.rent-btn[data-link="seizoen"] > span').forEach(s => {
        s.textContent = 'Huur ' + euro(p.price) + (p.duur ? ' · ' + p.duur : '') + ' · of ' + credits(p.price);
      });
      const los = eps.map(prijs).filter(Boolean).reduce((s, x) => s + x.price, 0);
      const sav = root.querySelector('.access-saving');
      if (sav && los - p.price > 0.005) {
        sav.textContent = 'Huur ' + woord.het + ' en bespaar ' + euro(los - p.price) + '.';
        sav.hidden = false;
      }
    }

    /* Achtergrond: Ghost-artikels bij de afleveringen */
    achtergrond(items, [season.id, ...(root.querySelector('.bg-achtergrond')?.dataset.reviddIds || '').split(',').map(x => x.trim()).filter(Boolean)]);
  }).catch(err => console.warn('Reekspagina', err));

  /* ---------- Achtergrond (Ghost) + lezer ---------- */
  function achtergrond(items, ids) {
    const box = root.querySelector('.bg-achtergrond');
    if (!box) return;
    const byId = Object.fromEntries(items.map(i => [i.id, i]));
    const uid = i => i && i.actualmedia && i.actualmedia[0] && i.actualmedia[0].id;
    const uids = new Set();
    const add = id => {
      const item = byId[id]; if (!item) return;
      if (uid(item)) uids.add(String(uid(item)));
      (item.seasons || []).forEach(s => add(s.id));
      items.filter(x => x.seasonId === id).forEach(ep => { if (uid(ep)) uids.add(String(uid(ep))); });
    };
    ids.forEach(add);
    if (!uids.size) return;
    const url = GHOST_CONTENT + '?key=' + GHOST_KEY + '&limit=6&filter=' +
      encodeURIComponent('tag:[' + [...uids].flatMap(u => ['hash-' + u, u]).join(',') + ']') +
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
