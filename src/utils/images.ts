import type { PropertyType } from '@/types';

/**
 * Estateo uses real photography only (Unsplash, free to use under the Unsplash
 * licence). Nothing is generated: every picture is a fixed, curated photo id,
 * so the same listing always shows the same images across reloads.
 *
 * To work fully offline, download the photos into `public/photos/` and point
 * `photo()` below at the local copies.
 */
const PHOTO_HOST = 'https://images.unsplash.com';

export type PhotoId = string;

/** Build a sized, compressed CDN url for a curated photo id. */
export function photo(id: PhotoId, width = 1200, height?: number): string {
  const crop = height ? `&h=${height}` : '';
  return `${PHOTO_HOST}/photo-${id}?auto=format&fit=crop&q=75&w=${width}${crop}`;
}

/* -------------------------------------------------------------------------- */
/* Property exteriors, one pool per property type                              */
/* -------------------------------------------------------------------------- */
const EXTERIORS: Record<PropertyType, PhotoId[]> = {
  apartment: ['1545324418-cc1a3fa10c00', '1460317442991-0ec209397118', '1486325212027-8081e485255e'],
  house: ['1564013799919-ab600027ffc6', '1568605114967-8130f3a36994', '1570129477492-45c003edd2be', '1518780664697-55e3ad937233'],
  villa: ['1600596542815-ffad4c1539a9', '1613490493576-7fde63acd811', '1613977257363-707ba9348227', '1512917774080-9991f1c4c750', '1580587771525-78b9dba3b914'],
  penthouse: ['1512918728675-ed5a9ecdebfd', '1567496898669-ee935f5f647a', '1600585154340-be6161a56a0c'],
  studio: ['1522708323590-d24dbb6b0267', '1502672260266-1c1ef2d93688', '1560448204-e02f11c3d0e2'],
  townhouse: ['1449844908441-8829872d2607', '1523217582562-09d0def993a6', '1572120360610-d971b9d7767c'],
  office: ['1497366216548-37526070297c', '1486406146926-c627a92ad1ab', '1497366811353-6870744d04b2'],
  land: ['1500382017468-9049fed747ef', '1501785888041-af3ef285b470', '1472214103451-9374bd1c798e'],
};

/* -------------------------------------------------------------------------- */
/* Interior / detail shots                                                     */
/* -------------------------------------------------------------------------- */
const RESIDENTIAL_ROOMS: PhotoId[] = [
  '1600607687939-ce8a6c25118c', // living room
  '1556909114-f6e7ad7d3136', // kitchen
  '1616594039964-ae9021a400a0', // bedroom
  '1584622650111-993a426fbf0a', // bathroom
  '1617806118233-18e1de247200', // dining area
  '1600210492486-724fe5c67fb0', // lounge
  '1572120360610-d971b9d7767c', // pool and terrace
  '1600566753190-17f0baa2a6c3', // facade at dusk
  '1586023492125-27b2c045efd7', // reading corner
  '1558997519-83ea9252edf8', // wardrobe
  '1600585154340-be6161a56a0c', // modern exterior
  '1512918728675-ed5a9ecdebfd', // skyline view
];

const OFFICE_ROOMS: PhotoId[] = [
  '1497366216548-37526070297c',
  '1497366811353-6870744d04b2',
  '1497215728101-856f4ea42174',
  '1504384308090-c894fdcc538d',
  '1524758631624-e2822e304c36',
  '1486406146926-c627a92ad1ab',
];

const LAND_VIEWS: PhotoId[] = [
  '1500382017468-9049fed747ef',
  '1501785888041-af3ef285b470',
  '1472214103451-9374bd1c798e',
  '1470071459604-3b5ec3a7fe05',
  '1506744038136-46273834b3fb',
  '1441974231531-c6227db76b6e',
];

function rotate<T>(list: T[], offset: number, count: number): T[] {
  const output: T[] = [];
  for (let i = 0; i < count; i += 1) {
    output.push(list[(offset + i) % list.length]);
  }
  return output;
}

/**
 * Deterministically build a gallery for a property so the same listing always
 * receives the same imagery. The cover is an exterior of the right type and the
 * remaining frames match the property (land shows landscapes, offices show work
 * spaces, homes show interiors).
 */
export function buildPropertyGallery(type: PropertyType, seed: number, count = 7): string[] {
  const exteriors = EXTERIORS[type];
  const cover = exteriors[seed % exteriors.length];
  const pool = type === 'land' ? LAND_VIEWS : type === 'office' ? OFFICE_ROOMS : RESIDENTIAL_ROOMS;

  const extras = rotate(pool, seed * 3, count + 2)
    .filter((id) => id !== cover)
    .slice(0, count);

  return [photo(cover, 1600, 900), ...extras.map((id) => photo(id, 1200, 900))];
}

/** Category tile image (first exterior of that property type). */
export function categoryPhoto(type: PropertyType): string {
  return photo(EXTERIORS[type][0], 900, 1100);
}

/* -------------------------------------------------------------------------- */
/* Cities                                                                      */
/* -------------------------------------------------------------------------- */
const CITY_PHOTOS: Record<string, PhotoId> = {
  'San Francisco': '1501594907352-04cda38ebc29',
  'Los Angeles': '1534190760961-74e8c1c5c3da',
  'New York': '1496442226666-8d4d0e62e6e9',
  Miami: '1506966953602-c20cc11f75e3',
  Dubai: '1512453979798-5ea266f8880c',
  Riyadh: '1586724237569-f3d0c1dee8c6',
  Cairo: '1572252009286-268acec5ca0a',
  Barcelona: '1583422409516-2895a77efded',
};

export function cityPhoto(city: string): string {
  return photo(CITY_PHOTOS[city] ?? '1480714378408-67cf0d13bc1b', 900, 1100);
}

/* -------------------------------------------------------------------------- */
/* People: real portrait photos for agents, reviewers and demo accounts        */
/* -------------------------------------------------------------------------- */
const WOMEN: PhotoId[] = [
  '1494790108377-be9c29b29330',
  '1438761681033-6461ffad8d80',
  '1544005313-94ddf0286df2',
  '1534528741775-53994a69daeb',
  '1580489944761-15a19d654956',
  '1573496359142-b8d87734a5a2',
  '1487412720507-e7ab37603c6f',
  '1508214751196-bcfd4ca60f91',
];

const MEN: PhotoId[] = [
  '1507003211169-0a1dd7228f2d',
  '1472099645785-5658abf4ff4e',
  '1500648767791-00dcc994a43e',
  '1506794778202-cad84cf45f1d',
  '1519085360753-af0119f7cbe7',
  '1560250097-0b93528c311a',
  '1531427186611-ecfd6d936c79',
  '1519345182560-3f2917c472ef',
];

/** Known demo people get a fixed, gender-appropriate portrait. */
const PORTRAIT_BY_NAME: Record<string, PhotoId> = {
  'Layla Haddad': WOMEN[0],
  'Marcus Bennett': MEN[1],
  'Noor Al Farsi': WOMEN[5],
  'Sofia Marchetti': WOMEN[1],
  'Daniel Okafor': MEN[2],
  'Hana Kimura': WOMEN[3],
  'Amira Saleh': WOMEN[2],
  'Omar Khalil': MEN[0],
  'Priya Raman': WOMEN[4],
  'Jonas Weber': MEN[3],
  'Chen Wei': MEN[4],
  'Isabella Rossi': WOMEN[6],
  'Elena Petrova': WOMEN[7],
  'Tariq Mansour': MEN[5],
  'Grace Whitfield': WOMEN[0],
  'Yousef Al Harbi': MEN[6],
  'Marta Ruiz': WOMEN[3],
  'Nathan Cole': MEN[7],
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Portrait for any person. Known names map to a fixed photo; anyone else (for
 * example a newly registered user) gets a stable portrait derived from the name.
 */
export function buildAvatar(name: string, index = 0): string {
  const known = PORTRAIT_BY_NAME[name];
  if (known) return photo(known, 320, 320);
  const pool = (hashString(name) + index) % 2 === 0 ? WOMEN : MEN;
  return photo(pool[hashString(name) % pool.length], 320, 320);
}

/* -------------------------------------------------------------------------- */
/* Editorial photos used by banners and marketing sections                     */
/* -------------------------------------------------------------------------- */
export const PHOTOS = {
  hero: photo('1600596542815-ffad4c1539a9', 2000, 1200),
  heroInterior: photo('1600607687939-ce8a6c25118c', 1000, 1300),
  heroExterior: photo('1613490493576-7fde63acd811', 1000, 1300),
  auth: photo('1600607687939-ce8a6c25118c', 1400, 1800),
  newsletter: photo('1564013799919-ab600027ffc6', 1800, 1000),
  why: photo('1560518883-ce09059eeffa', 1100, 1400),
} as const;

/* -------------------------------------------------------------------------- */
/* Fallbacks                                                                   */
/* -------------------------------------------------------------------------- */
const FALLBACK_IDS: PhotoId[] = [
  '1564013799919-ab600027ffc6',
  '1600596542815-ffad4c1539a9',
  '1600585154340-be6161a56a0c',
  '1600607687939-ce8a6c25118c',
];

/**
 * A different real photo to show if a source fails to load. Deterministic per
 * source so a broken card never flickers between pictures.
 */
export function fallbackPhoto(src: string): string {
  return photo(FALLBACK_IDS[hashString(src) % FALLBACK_IDS.length], 1200, 900);
}
