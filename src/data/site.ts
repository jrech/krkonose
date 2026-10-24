// Contact details carried from the previous project. Owner confirmation is required before launch.
export const site = {
  name: 'Prádelna Krkonoše',
  phone: '+420 773 798 008',
  phoneHref: 'tel:+420773798008',
  email: 'info@pradelnakrkonose.cz',
  area: 'Vrchlabí · Krkonoše',
  // IČO taken from the Refresh 02 design. Confirm against the business register before launch.
  companyId: '05593034',
  credit: 'Jonas Rech',
  creditUrl: 'https://www.jonasrech.com',
  description: 'Prádelenský servis pro hotely, penziony, apartmány, chaty a gastro provozy. Domluvte si praní a svoz prádla v Krkonoších.',
};

export const navigation = [
  { label: 'Služby', href: '#sluzby' },
  { label: 'Pro koho pereme', short: 'Pro koho', href: '#pro-koho' },
  { label: 'Svozová oblast', href: '#svozova-oblast' },
  { label: 'Jak to funguje', href: '#jak-to-funguje' },
  { label: 'Kontakt', href: '/kontakt/' },
];

export const services = [
  { title: 'Svoz a rozvoz', icon: 'truck', text: 'Režim svozu domluvíme podle vašeho provozu. Sezónní vytížení a případné navýšení kapacity probereme předem.' },
  { title: 'Praní a mandlování', icon: 'shirt', text: 'Prádlo pravidelně vypereme, usušíme a vyžehlíme na mandlu, aby bylo připravené k použití.' },
  { title: 'Připravené prádlo', icon: 'package-check', text: 'Prádlo vracíme přehledně složené a připravené pro další hosty i provoz. Ušetří čas personálu při přípravě.' },
] as const;

export const process = [
  { title: 'Řeknete nám, co potřebujete', text: 'Probereme typ prádla, množství a četnost svozu.' },
  { title: 'Domluvíme svoz', text: 'Nastavíme režim, který bude vyhovovat vašemu provozu.' },
  { title: 'O prádlo se postaráme', text: 'Vyzvedneme ho, vypereme, upravíme a přivezeme zpět.' },
];

// Neutral wording until the owner confirms which textiles are accepted and what seasonal capacity exists.
// Audit suggestions to use once confirmed: "Od ložního prádla až po ručníky a další textil." and
// "Řešení podle sezóny: možnosti spolupráce přizpůsobíme vašemu vytížení."
export const quality = [
  { title: 'Domluvený režim svozu', icon: 'clipboard-check', text: 'Předem víte, jak bude spolupráce fungovat.' },
  { title: 'Péče o provozní prádlo', icon: 'shirt', text: 'Při praní dodržujeme hygienické standardy.' },
  { title: 'Domluva na sezónu', icon: 'calendar-clock', text: 'Vytížení v hlavní sezóně probereme ještě před ní.' },
] as const;

// No unverified turnaround times, prices, service days or coverage claims.
export const faqs = [
  { question: 'Jak často svážíte a kdy prádlo vrátíte?', answer: 'Frekvenci svozu a dobu zpracování potvrdíme podle typu provozu, adresy a aktuální kapacity při poptávce. Napište nám, kdy prádlo potřebujete zpět.' },
  { question: 'Obsluhujete i naši obec?', answer: 'Pošlete nám obec nebo adresu vašeho provozu. Možnost a režim svozu je potřeba potvrdit pro konkrétní místo; samotná blízkost Vrchlabí dostupnost nezaručuje.' },
  { question: 'Je stanovené minimální množství?', answer: 'Minimální objem i podmínky svozu potvrdíme podle místa předání, přibližného množství a zamýšlené frekvence. Uveďte je prosím v poptávce.' },
  { question: 'Podle čeho se stanovuje cena?', answer: 'Nabídku připravíme podle druhu a množství textilu, požadované úpravy a svozu. Proto potřebujeme základní údaje o vašem provozu.' },
  { question: 'Jak probíhá předání prádla?', answer: 'Místo a způsob předání, evidenci kusů i postup pro případ ztráty nebo poškození si projdeme před první zakázkou.' },
  { question: 'Mohu se zeptat na sezónní spolupráci?', answer: 'Ano. V poptávce uveďte období, lokalitu a očekávané množství prádla. Konkrétní kapacitu a podmínky je nutné potvrdit předem.' },
];
