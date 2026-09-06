import { Message, Profile, Request, Wali } from './types';

export const SEED_PROFILES: Profile[] = [
  // Men
  {
    id: 'm1', role: 'man', name: 'Yusuf Adeyemi', age: 28, location: 'London, UK',
    education: 'BSc Computer Science, UCL', career: 'Backend engineer',
    timeline: 'Within 6 months', email: 'yusuf.adeyemi@example.com', photo: 'm1',
    about: 'Born and raised in London. Family originally from Lagos. Looking to marry soon and settle here, close to both families insha Allah.',
  },
  {
    id: 'm2', role: 'man', name: 'Bilal Chaudhry', age: 31, location: 'Manchester, UK',
    education: 'MEng Civil Engineering, Leeds', career: 'Structural engineer',
    timeline: 'Within 6 months', email: 'bilal.chaudhry@example.com', photo: 'm2',
    about: 'Settled in Manchester with my own place. Hoping for someone who wants a family and is close to hers.',
  },
  {
    id: 'm3', role: 'man', name: 'Omar Benali', age: 26, location: 'Birmingham, UK',
    education: 'BA Accounting, Aston', career: 'Trainee accountant',
    timeline: '6-12 months', email: 'omar.benali@example.com', photo: 'm3',
    about: 'Moroccan family, born here. Finishing my qualification next year and want to marry after that insha Allah.',
  },
  {
    id: 'm4', role: 'man', name: 'Ibrahim Sesay', age: 34, location: 'Toronto, Canada',
    education: 'MD, McMaster University', career: 'Family physician',
    timeline: 'Within 6 months', email: 'ibrahim.sesay@example.com', photo: 'm4',
    about: 'Practice in Toronto. Widowed two years ago, no children. Looking to build a home again.',
  },
  {
    id: 'm5', role: 'man', name: 'Hamza Qureshi', age: 29, location: 'New York, USA',
    education: 'JD, Fordham Law', career: 'Immigration lawyer',
    timeline: '1-2 years', email: 'hamza.qureshi@example.com', photo: 'm5',
    about: 'Work mostly with asylum cases. Want someone patient with the hours, and family close by.',
  },
  {
    id: 'm6', role: 'man', name: 'Suleiman Farah', age: 27, location: 'Melbourne, Australia',
    education: 'BCom, Monash', career: 'Data analyst',
    timeline: '6-12 months', email: 'suleiman.farah@example.com', photo: 'm6',
    about: 'Somali-Australian. Quiet, close to my mother and sisters, hoping for something similar.',
  },

  // Women
  {
    id: 'w1', role: 'woman', name: 'Maryam Siddiqui', age: 25, location: 'Birmingham, UK',
    education: 'MPharm, University of Birmingham', career: 'Pharmacist',
    timeline: 'Within 6 months', email: 'maryam.siddiqui@example.com', waliId: 'g1',
    about: 'Close to my family and hoping to build something similar. I would like to keep working after marriage insha Allah.',
  },
  {
    id: 'w2', role: 'woman', name: 'Aisha Rahman', age: 27, location: 'London, UK',
    education: 'LLB Law, KCL', career: 'Solicitor',
    timeline: '6-12 months', email: 'aisha.rahman@example.com', waliId: 'g2',
    about: 'Practising, family-oriented, and happy to relocate within the UK for the right person.',
  },
  {
    id: 'w3', role: 'woman', name: 'Fatima Osman', age: 24, location: 'Toronto, Canada',
    education: 'BEd, University of Toronto', career: 'Primary school teacher',
    timeline: '1-2 years', email: 'fatima.osman@example.com', waliId: 'g3',
    about: 'Somali-Canadian, teaching full time. Want to finish my masters before marriage insha Allah.',
  },
  {
    id: 'w4', role: 'woman', name: 'Khadija Malik', age: 30, location: 'Manchester, UK',
    education: 'MBBS, University of Manchester', career: 'GP registrar',
    timeline: 'Within 6 months', email: 'khadija.malik@example.com', waliId: 'g4',
    about: 'Looking for someone settled and serious. Family is in Manchester and I would like to stay nearby.',
  },
  {
    id: 'w5', role: 'woman', name: 'Zaynab Hussein', age: 26, location: 'London, UK',
    education: 'BSc Architecture, Bath', career: 'Architectural assistant',
    timeline: '6-12 months', email: 'zaynab.hussein@example.com', waliId: 'g5',
    about: 'Working towards my Part 3. Family is in east London and I would rather stay close to them.',
  },
  {
    id: 'w6', role: 'woman', name: 'Safiyyah Ahmed', age: 23, location: 'Leicester, UK',
    education: 'BSc Biomedical Science, Leicester', career: 'Laboratory technician',
    timeline: '1-2 years', email: 'safiyyah.ahmed@example.com', waliId: 'g6',
    about: 'Youngest of four. Considering a masters, and want to marry someone who supports that.',
  },
  {
    id: 'w7', role: 'woman', name: 'Halima Toure', age: 29, location: 'Paris, France',
    education: 'Master Finance, Sorbonne', career: 'Risk analyst',
    timeline: 'Within 6 months', email: 'halima.toure@example.com', waliId: 'g7',
    about: 'Malian family, raised in Paris. Open to moving to the UK or Canada for the right person.',
  },
  {
    id: 'w8', role: 'woman', name: 'Ruqayyah Patel', age: 28, location: 'Leeds, UK',
    education: 'MSc Data Science, Leeds', career: 'Data scientist',
    timeline: '6-12 months', email: 'ruqayyah.patel@example.com', waliId: 'g8',
    about: 'Gujarati family. I work remotely most days, so I could live anywhere with good family nearby.',
  },
  {
    id: 'w9', role: 'woman', name: 'Sumayyah Nur', age: 22, location: 'Minneapolis, USA',
    education: 'BA Psychology, University of Minnesota', career: 'Support worker',
    timeline: 'Exploring', email: 'sumayyah.nur@example.com', waliId: 'g9',
    about: 'Just graduated. Not in a rush, but I would like to meet someone serious rather than drift.',
  },
  {
    id: 'w10', role: 'woman', name: 'Amina Diallo', age: 31, location: 'Montreal, Canada',
    education: 'PhD Chemistry, McGill', career: 'Research scientist',
    timeline: 'Within 6 months', email: 'amina.diallo@example.com', waliId: 'g10',
    about: 'Guinean family. Finished my doctorate last year and feel ready to settle now.',
  },
  {
    id: 'w11', role: 'woman', name: 'Yasmin Kaya', age: 25, location: 'Berlin, Germany',
    education: 'BSc Nursing, Charite', career: 'Paediatric nurse',
    timeline: '6-12 months', email: 'yasmin.kaya@example.com', waliId: 'g11',
    about: 'Turkish-German. I work nights sometimes and need someone who understands that.',
  },
  {
    id: 'w12', role: 'woman', name: 'Nadia Ahmadi', age: 33, location: 'Sydney, Australia',
    education: 'MBA, UNSW', career: 'Operations manager',
    timeline: 'Within 6 months', email: 'nadia.ahmadi@example.com', waliId: 'g12',
    about: 'Afghan family, came here as a child. Established in my work and looking for the same.',
  },
  {
    id: 'w13', role: 'woman', name: 'Hafsa Iqbal', age: 24, location: 'Bradford, UK',
    education: 'BA Islamic Studies, Markfield', career: 'Islamic studies teacher',
    timeline: 'Within 6 months', email: 'hafsa.iqbal@example.com', waliId: 'g13',
    about: 'Teach at a girls school locally. Family is everything to me and I hope to stay near them.',
  },
  {
    id: 'w14', role: 'woman', name: 'Layla Mansour', age: 27, location: 'Dearborn, USA',
    education: 'DDS, University of Michigan', career: 'Dentist',
    timeline: '6-12 months', email: 'layla.mansour@example.com', waliId: 'g14',
    about: 'Lebanese family, large and loud. I would like a husband who enjoys that rather than endures it.',
  },
  {
    id: 'w15', role: 'woman', name: 'Iman Abdi', age: 26, location: 'Ottawa, Canada',
    education: 'BSc Public Health, Ottawa', career: 'Health policy officer',
    timeline: '1-2 years', email: 'iman.abdi@example.com', waliId: 'g15',
    about: 'Somali-Canadian. Want to be settled in my career before marriage, but happy to start talking.',
  },
  {
    id: 'w16', role: 'woman', name: 'Mariam Bello', age: 29, location: 'London, UK',
    education: 'MSc Economics, LSE', career: 'Economist',
    timeline: 'Within 6 months', email: 'mariam.bello@example.com', waliId: 'g16',
    about: 'Nigerian family. Practising, straightforward, and hoping to meet someone with the same intent.',
  },
];

/**
 * Demo escape hatch. Set EXPO_PUBLIC_DEMO_WALI_EMAIL in .env (gitignored) and
 * Maryam's wali is reachable at that address, so the email can be sent on stage
 * without editing anything live or committing a real address to the repo.
 */
const demoWaliContact = process.env.EXPO_PUBLIC_DEMO_WALI_EMAIL || '+44 7700 900321';

export const SEED_WALIS: Wali[] = [
  { id: 'g1', name: 'Imran Siddiqui', relationship: 'Father', contact: demoWaliContact, wardId: 'w1' },
  { id: 'g2', name: 'Bilal Rahman', relationship: 'Brother', contact: 'bilal.rahman@example.com', wardId: 'w2' },
  { id: 'g3', name: 'Abdi Osman', relationship: 'Father', contact: '+1 416 555 0142', wardId: 'w3' },
  { id: 'g4', name: 'Tariq Malik', relationship: 'Uncle', contact: '+44 7700 900884', wardId: 'w4' },
  { id: 'g5', name: 'Mahmoud Hussein', relationship: 'Father', contact: '+44 7700 900115', wardId: 'w5' },
  { id: 'g6', name: 'Rashid Ahmed', relationship: 'Father', contact: 'rashid.ahmed@example.com', wardId: 'w6' },
  { id: 'g7', name: 'Sekou Toure', relationship: 'Brother', contact: '+33 6 12 34 56 78', wardId: 'w7' },
  { id: 'g8', name: 'Yusuf Patel', relationship: 'Father', contact: '+44 7700 900447', wardId: 'w8' },
  { id: 'g9', name: 'Abdirahman Nur', relationship: 'Father', contact: '+1 612 555 0188', wardId: 'w9' },
  { id: 'g10', name: 'Mamadou Diallo', relationship: 'Uncle', contact: 'm.diallo@example.com', wardId: 'w10' },
  { id: 'g11', name: 'Mehmet Kaya', relationship: 'Father', contact: '+49 151 2345 6789', wardId: 'w11' },
  { id: 'g12', name: 'Karim Ahmadi', relationship: 'Brother', contact: '+61 4 1234 5678', wardId: 'w12' },
  { id: 'g13', name: 'Naeem Iqbal', relationship: 'Father', contact: '+44 7700 900992', wardId: 'w13' },
  { id: 'g14', name: 'Hassan Mansour', relationship: 'Father', contact: 'h.mansour@example.com', wardId: 'w14' },
  { id: 'g15', name: 'Ahmed Abdi', relationship: 'Grandfather', contact: '+1 613 555 0104', wardId: 'w15' },
  { id: 'g16', name: 'Tunde Bello', relationship: 'Father', contact: '+44 7700 900556', wardId: 'w16' },
];

export const SEED_REQUESTS: Request[] = [];
export const SEED_MESSAGES: Message[] = [];
