/* Controleert reeksen.js: verplichte velden, geen dubbels, max. 3 op Home, geldige links en id's.
   Draait automatisch op GitHub bij elke wijziging (zie .github/workflows/controle.yml). */
global.window = {};
require('../reeksen.js');
const L = window.BAGAGE_REEKSEN;
const fout = [];
if (!Array.isArray(L) || !L.length) { console.error('reeksen.js: lijst BAGAGE_REEKSEN ontbreekt of is leeg'); process.exit(1); }
const nodig = ['page', 'title', 'type', 'soort', 'href', 'image', 'tekst'];
const pages = new Set(), ids = new Map();
L.forEach((r, i) => {
  const naam = r.title || r.page || ('blok ' + (i + 1));
  nodig.forEach(k => { if (!r[k]) fout.push(`${naam}: veld '${k}' ontbreekt`); });
  if (pages.has(r.page)) fout.push(`${naam}: page '${r.page}' staat er twee keer in`);
  pages.add(r.page);
  if (r.soort && !['reeks', 'dossier', 'documentaire'].includes(r.soort)) fout.push(`${naam}: soort moet reeks, dossier of documentaire zijn`);
  const links = [r.href, r.image, r.partner && r.partner.logo, r.partner && r.partner.site].filter(Boolean);
  links.forEach(u => { if (!/^https:\/\/[^\s]+$/.test(u)) fout.push(`${naam}: link niet geldig of niet beveiligd (https): ${u}`); });
  if (r.partner && !r.partner.name) fout.push(`${naam}: partner zonder naam`);
  (r.ids || []).forEach(id => {
    if (!/^[0-9a-f]{24}$/.test(id)) fout.push(`${naam}: Revidd-id ziet er niet juist uit: ${id}`);
    if (ids.has(id)) fout.push(`${naam}: Revidd-id ${id} staat ook al bij ${ids.get(id)}`);
    ids.set(id, naam);
  });
});
const home = L.filter(r => r.home).length;
if (home > 3) fout.push(`${home} reeksen staan op home:true, maximaal 3`);
if (fout.length) { console.error('Problemen in reeksen.js:\n- ' + fout.join('\n- ')); process.exit(1); }
console.log(`reeksen.js in orde: ${L.length} reeksen, ${home} op Home.`);
