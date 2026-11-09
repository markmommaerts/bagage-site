# bagage-site

Gedeelde code voor de eigen pagina's van Bagage op Revidd.
Elke pagina laadt `bagage-site.js` via GitHub Pages:

    <script src="https://markmommaerts.github.io/bagage-site/bagage-site.js"></script>

Een wijziging in dit bestand geldt na enkele minuten voor alle pagina's.

## Reeksen & dossiers

`reeksen.js` bevat de lijst van alle reeksen en dossiers. Home, de pagina
Reeksen & dossiers en het blok "Meer reeksen & dossiers" op elke reekspagina
bouwen hun kaarten uit deze lijst:

    <script src="https://markmommaerts.github.io/bagage-site/reeksen.js"></script>

Een nieuwe reeks: één blok toevoegen in `reeksen.js`. De uitleg staat bovenaan het bestand.

## Sjablonen

`templates/reekspagina.html` is de meest recente reekspagina (De boom die het bos verbergt)
en dient als vertrekpunt voor een nieuwe reeks- of partnerpagina.

## Automatische controle

Bij elke wijziging kijkt GitHub de code na (map `controle/`, instellingen in `.github/workflows/controle.yml`):
de lijst in `reeksen.js` (verplichte velden, dubbels, max. 3 op Home, links), de JavaScript en de HTML van de sjablonen.
Loopt er iets mis, dan krijg je een mail en staat er een rood kruisje bij de wijziging op GitHub.
