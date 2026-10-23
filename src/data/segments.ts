import hotel from '../assets/images/hotel-exterior.webp';
import pension from '../assets/images/pension-exterior.webp';
import cottage from '../assets/images/cottage-exterior.webp';
import gastro from '../assets/images/gastro-exterior.webp';

// Reused project imagery is illustrative, not evidence of a client relationship.
// `textiles` is proposed copy: the owner has not yet confirmed which items the laundry accepts.
// Flip `textilesVerified` per segment once confirmed (it only documents the state; nothing is hidden).
export const segments = [
  {
    id: 'hotely', category: 'Ubytování', title: 'Hotely / wellness', inquiry: 'Hotel / wellness',
    lead: 'Čisté prádlo připravené na další hosty.',
    text: 'Od pokojů po wellness. Postaráme se o hotelové prádlo a svoz přizpůsobíme chodu vašeho provozu.',
    textiles: ['Ložní prádlo', 'Ručníky', 'Osušky', 'Župany', 'Wellness textil'], textilesVerified: false,
    cta: 'Poptat praní pro hotel',
    image: hotel, alt: 'Ilustrační fotografie hotelové budovy v horském městě',
  },
  {
    id: 'penziony', category: 'Menší ubytování', title: 'Penziony / apartmány', inquiry: 'Penzion / apartmány',
    lead: 'Méně starostí mezi jednotlivými pobyty.',
    text: 'Postaráme se o prádlo z pokojů a apartmánů, abyste měli více času na přípravu ubytování a péči o hosty.',
    textiles: ['Povlečení', 'Prostěradla', 'Ručníky', 'Osušky', 'Koupelnové předložky'], textilesVerified: false,
    cta: 'Poptat praní pro penzion',
    image: pension, alt: 'Ilustrační fotografie horského penzionu s dřevěným balkonem',
  },
  {
    id: 'chaty', category: 'Rekreační objekty', title: 'Chaty / chalupy', inquiry: 'Chata / chalupa',
    lead: 'Výměna hostů bez hromady prádla.',
    text: 'Ať pronajímáte jednu chalupu, nebo spravujete více objektů, pomůžeme vám zvládnout praní textilu mezi pobyty.',
    textiles: ['Povlečení', 'Prostěradla', 'Ručníky', 'Osušky', 'Kuchyňské utěrky'], textilesVerified: false,
    cta: 'Poptat praní pro chalupu',
    image: cottage, alt: 'Ilustrační fotografie dřevěné horské chalupy',
  },
  {
    id: 'gastro', category: 'Gastronomie', title: 'Gastro', inquiry: 'Gastro provoz',
    lead: 'Čistý textil pro každé prostření.',
    text: 'Profesionální praní restauračního textilu, aby vaše stoly i provoz působily upraveně každý den.',
    textiles: ['Ubrusy', 'Látkové ubrousky', 'Prostírání', 'Kuchyňské utěrky', 'Zástěry'], textilesVerified: false,
    cta: 'Poptat praní pro gastro',
    image: gastro, alt: 'Ilustrační fotografie restaurace s venkovní zahrádkou',
  },
];
