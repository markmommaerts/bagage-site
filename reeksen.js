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
    title:'De aarde vanuit de hemel', type:'Dossier · 4 reportages', soort:'dossier',
    href:'https://bagage.store1.revidd.video/nl/pages/goodplanet',
    image:'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/5c4e1722-7270-4edd-8ae0-d44750861627.jpg',
    partner:{ name:'GoodPlanet Belgium', plaats:'Brussel',
      logo:'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/8d7ee51c-65e7-4484-aad9-c7fdd66b4fe0.png',
      site:'https://www.goodplanet.be/nl/' },
    tekst:'Al bijna dertig jaar maakt GoodPlanet duurzaamheid toegankelijk. Samen met BAGAGE bundelen ze vier natuurreportages rond de blik van Yann Arthus-Bertrand.',
    home:true,
    ids:['6ab0f8ffef56438006256bae', '6ab0fc7ec29d6e96aee113a0', '6ab0f77fc29d6e96aee0f8ba', '6ab0fe6ec29d6e96aee117cf'] },

  { page:'edvard-munch', anker:'museum-de-reede',
    title:'Edvard Munch', type:'Documentaire', soort:'documentaire',
    /* nog geen eigen pagina: de kaart linkt naar de documentaire zelf */
    href:'https://bagage.store1.revidd.video/nl/movies/edvard-munch-un-cri-dans-la-nature-6a9d5ca4b65cd631559e4698',
    image:'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/0d5f901c-5789-4e70-a73d-4d1c77cee466.jpg',
    partner:{ name:'Museum De Reede', plaats:'Antwerpen',
      logo:'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/3cecacfb-22c3-4dbc-966a-daf02ee9eca8.png',
      site:'https://museum-dereede.com/' },
    tekst:'Het Antwerpse museum voor grafiek, met werk van Goya, Rops en Munch, brengt samen met BAGAGE deze documentaire over Munch.',
    home:false },

  { page:'de-boom-die-het-bos-verbergt',
    title:'De boom die het bos verbergt', type:'Reeks · 6 delen', soort:'reeks',
    href:'https://bagage.store1.revidd.video/nl/pages/de-boom-die-het-bos-verbergt',
    image:'https://1577787583.rsc.cdn77.org/6a951185e6ab34ccc82b94a6/images/528383b5-96ab-4dd2-a311-e297931b5834.jpg',
    tekst:'Zes iconische bomen, zes bossen over de hele wereld. Telkens één opmerkelijke boom, maar het bos als geheel speelt de hoofdrol.',
    home:true,
    ids:['6aaa9359ef56438006250b3f'] }

];
