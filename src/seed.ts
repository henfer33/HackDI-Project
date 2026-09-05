import { Request, Message, Profile, Wali } from './types';

export const SEED_PROFILES: Profile[] = [
  {
    id: 'm1',
    role: 'man',
    name: 'Yusuf Adeyemi',
    age: 28,
    location: 'London, UK',
    education: "BSc Computer Science, UCL",
    career: 'Backend engineer',
    timeline: 'Within 6 months',
    about:
      'Born and raised in London. Family originally from Lagos. Looking to marry soon and settle here, close to both families insha Allah.',
  },
  {
    id: 'w1',
    role: 'woman',
    name: 'Maryam Siddiqui',
    age: 25,
    location: 'Birmingham, UK',
    education: 'MPharm, University of Birmingham',
    career: 'Pharmacist',
    timeline: 'Within 6 months',
    about:
      'Close to my family and hoping to build something similar. I would like to keep working after marriage insha Allah.',
    waliId: 'g1',
  },
  {
    id: 'w2',
    role: 'woman',
    name: 'Aisha Rahman',
    age: 27,
    location: 'London, UK',
    education: 'LLB Law, KCL',
    career: 'Solicitor',
    timeline: '6-12 months',
    about: 'Practising, family-oriented, and happy to relocate within the UK for the right person.',
    waliId: 'g2',
  },
  {
    id: 'w3',
    role: 'woman',
    name: 'Fatima Osman',
    age: 24,
    location: 'Toronto, Canada',
    education: 'BEd, University of Toronto',
    career: 'Primary school teacher',
    timeline: '1-2 years',
    about: 'Somali-Canadian, teaching full time. Want to finish my masters before marriage insha Allah.',
    waliId: 'g3',
  },
  {
    id: 'w4',
    role: 'woman',
    name: 'Khadija Malik',
    age: 30,
    location: 'Manchester, UK',
    education: 'MBBS, University of Manchester',
    career: 'GP registrar',
    timeline: 'Within 6 months',
    about: 'Looking for someone settled and serious. Family is in Manchester and I would like to stay nearby.',
    waliId: 'g4',
  },
];

export const SEED_WALIS: Wali[] = [
  { id: 'g1', name: 'Imran Siddiqui', relationship: 'Father', contact: '+44 7700 900321', wardId: 'w1' },
  { id: 'g2', name: 'Bilal Rahman', relationship: 'Brother', contact: 'bilal.rahman@example.com', wardId: 'w2' },
  { id: 'g3', name: 'Abdi Osman', relationship: 'Father', contact: '+1 416 555 0142', wardId: 'w3' },
  { id: 'g4', name: 'Tariq Malik', relationship: 'Uncle', contact: '+44 7700 900884', wardId: 'w4' },
];

export const SEED_REQUESTS: Request[] = [];
export const SEED_MESSAGES: Message[] = [];
