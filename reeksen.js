/* =========================================================
   BAGAGE — REEKSEN & DOSSIERS
   Eén lijst voor Home (blok "Reeksen & dossiers"), de pagina Reeksen & dossiers
   en het blok "Meer reeksen & dossiers" onderaan elke reeks- of partnerpagina.

   Nieuwe reeks of dossier: kopieer één blok { … }, pas het aan, sla op. Klaar.
   Volgorde in de lijst = volgorde op de site
   (op Reeksen & dossiers komen partnerkaarten automatisch eerst).

   page    laatste deel van het pagina-adres (…/nl/pages/<page>)
   title   titel van de reeks
   type    label op het beeld, bv. 'Reeks · 6 delen'
   soort   reeks · dossier · documentaire
   href    waar de kaart naartoe linkt
   image   beeld (zonder ?width=…)
   partner { name, plaats, logo, site }  — weglaten = eigen BAGAGE-selectie
   tekst   korte beschrijving (pagina Reeksen & dossiers)
   home    true = tonen op Home (maximaal 3, in volgorde van deze lijst)
   ids     Revidd-id's van de titels: links naar die titels gaan dan naar deze pagina
   anker   optioneel: ankernaam op Reeksen & dossiers (…/partnerkeuze#anker)
   shorts  optioneel: media-id's van de shorts (reels in de mediabibliotheek), in volgorde;
           ze verschijnen naast elkaar in het tabblad De shorts van de reekspagina
   shortsBeeld optioneel: staand beeld (1080×1920) voor de kaart "De shorts" zolang de reeks geen eigen shorts heeft
   kaders  optioneel: beelden voor de vierkante contextkaarten van de partner (bv. Collectie · Verdieping ·
           Museum · Bezoek), in volgorde, zonder ?width=…; leeg ('') = huidig beeld laten staan.
           Formaat: 1000 × 1000 px JPEG (Image Processor: 1:1 · Contextkaart)
   hero    optioneel, voor de grote dia bovenaan Home: { title, subtitle, tekst, image, type, beschikbaar }
           — enkel invullen wat anders moet dan hierboven

   Home-hero: zet in Revidd de tag UITGELICHT (of UITGELICHT 1, 2 … voor de volgorde) op een titel van
   de reeks. Optioneel tag BESCHIKBAAR TOT 31/12/2027. Tag weg = dia weg.
   ========================================================= */
window.BAGAGE_REEKSEN = [

  { page:'apocalyps-wo1', anker:'in-flanders-fields',
    title:'Apocalyps WOI', type:'Reeks · 5 delen', soort:'reeks',
    href:'https://bagage.store1.revidd.video/nl/pages/apocalyps-wo1',
    image:'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/075d02cb-ff0e-4e60-94a1-689c37ba6557.png',
    partner:{ name:'In Flanders Fields Museum', plaats:'Ieper',
      logo:'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/bfffc150-63be-45ce-8373-ee92c0bafcb1.png',
      site:'https://www.inflandersfields.be/' },
    tekst:'Het museum over de Eerste Wereldoorlog brengt samen met BAGAGE deze reeks, vanuit de mensen die de oorlog meemaakten. Met extra context via tentoonstellingen en getuigenissen.',
    home:true,
    ids:['6acbbe9bf75648400cbb0473', '6a996b9cb6a6cc4adaee6a8b'] },

  { page:'goodplanet',
    title:'De aarde vanuit de hemel', type:'Dossier · 4 documentaires', soort:'dossier',
    href:'https://bagage.store1.revidd.video/nl/pages/goodplanet',
    image:'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/5c4e1722-7270-4edd-8ae0-d44750861627.jpg',
    partner:{ name:'GoodPlanet Belgium', plaats:'Brussel',
      logo:'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/8d7ee51c-65e7-4484-aad9-c7fdd66b4fe0.png',
      site:'https://www.goodplanet.be/nl/' },
    tekst:'Al bijna dertig jaar maakt GoodPlanet duurzaamheid toegankelijk. Samen met BAGAGE bundelen ze vier natuurdocumentaires rond de blik van Yann Arthus-Bertrand.',
    home:true,
    ids:['6afec0f2a8754e911817345d'] },

  { page:'edvard-munch', anker:'museum-de-reede',
    title:'Edvard Munch - Een schreeuw in de natuur', type:'Documentaire', soort:'documentaire',
    href:'https://bagage.store1.revidd.video/nl/pages/edvard-munch',
    image:'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/0d5f901c-5789-4e70-a73d-4d1c77cee466.jpg',
    partner:{ name:'Museum De Reede', plaats:'Antwerpen',
      logo:'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/3cecacfb-22c3-4dbc-966a-daf02ee9eca8.png',
      site:'https://museum-dereede.com/' },
    tekst:'Het Antwerpse museum voor grafiek, met werk van Goya, Rops en Munch, brengt samen met BAGAGE deze documentaire over Munch.',
    home:false,
    ids:['6b06f24e7e3ae5e03eabd820'],
    shorts:[ /* media-id's van de Munch-shorts, zodra ze in de mediabibliotheek staan */ ],
    kaders:[ /* Collectie · Verdieping · Museum · Bezoek */
      'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/6aa75838-7b1a-4444-8f25-0a16a9817009.jpg',
      'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/36713eea-7af4-44ac-825b-81add13b73da.jpg',
      'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/0bf44417-f743-42b1-a85e-1f3b0ee1350d.jpg',
      'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/8f068759-c4d2-489d-b66b-afa701820b08.jpg' ] },

  { page:'de-boom-die-het-bos-verbergt',
    title:'De boom die het bos verbergt', type:'Reeks · 6 delen', soort:'reeks',
    href:'https://bagage.store1.revidd.video/nl/pages/de-boom-die-het-bos-verbergt',
    image:'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/01929e84-afd9-4441-88c9-637113ebc549.jpg',
    tekst:'Zes iconische bomen, zes bossen over de hele wereld. Telkens één opmerkelijke boom, maar het bos als geheel speelt de hoofdrol.',
    home:true,
    ids:['6af6df3a79f5c64d284f364c', '6aaa9359ef56438006250b3f'] },

  { page:'heilige-oorden',
    title:'Heilige Oorden', type:'Reeks · aflevering 1', soort:'reeks',
    href:'https://bagage.store1.revidd.video/nl/pages/heilige-oorden',
    image:'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/6270a665-ff99-458e-ac44-0adf9df28f97.jpg',
    tekst:'Van Jeruzalem tot Moskou: iconische christelijke bouwwerken en de bouwmeesters die telkens de grenzen van de techniek verlegden, op zoek naar hoogte en licht.',
    home:false,
    ids:['6ae5d76d7e11c8a635c0f059', '6ae5d8a67e11c8a635c0f49a'],
    shorts:['3746542', '3746545', '3746543', '3746544', '3746546'] }

];
