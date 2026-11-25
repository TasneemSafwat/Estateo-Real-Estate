import type {
  CurrencyCode,
  ListingType,
  Property,
  PropertyStatus,
  PropertyType,
} from '@/types';
import { buildPropertyGallery } from '@/utils/images';
import { CITY_AR, DISTRICT_AR } from '@/utils/localize';

/* -------------------------------------------------------------------------- */
/* Deterministic pseudo random generator so the catalogue is stable            */
/* -------------------------------------------------------------------------- */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface DistrictSeed {
  name: string;
  priceIndex: number;
  lat: number;
  lng: number;
}

interface CitySeed {
  city: string;
  country: string;
  currency: CurrencyCode;
  basePricePerSqft: number;
  districts: DistrictSeed[];
}

const CITY_SEEDS: CitySeed[] = [
  {
    city: 'San Francisco',
    country: 'United States',
    currency: 'USD',
    basePricePerSqft: 1080,
    districts: [
      { name: 'Pacific Heights', priceIndex: 1.35, lat: 37.7925, lng: -122.4382 },
      { name: 'SoMa', priceIndex: 1.05, lat: 37.7785, lng: -122.4056 },
      { name: 'Mission District', priceIndex: 0.92, lat: 37.7599, lng: -122.4148 },
    ],
  },
  {
    city: 'Los Angeles',
    country: 'United States',
    currency: 'USD',
    basePricePerSqft: 760,
    districts: [
      { name: 'Beverly Hills', priceIndex: 1.55, lat: 34.0736, lng: -118.4004 },
      { name: 'Santa Monica', priceIndex: 1.2, lat: 34.0195, lng: -118.4912 },
      { name: 'Silver Lake', priceIndex: 0.95, lat: 34.0869, lng: -118.2702 },
    ],
  },
  {
    city: 'New York',
    country: 'United States',
    currency: 'USD',
    basePricePerSqft: 1320,
    districts: [
      { name: 'Tribeca', priceIndex: 1.5, lat: 40.7163, lng: -74.0086 },
      { name: 'Upper West Side', priceIndex: 1.25, lat: 40.787, lng: -73.9754 },
      { name: 'Brooklyn Heights', priceIndex: 1.05, lat: 40.6962, lng: -73.9962 },
    ],
  },
  {
    city: 'Miami',
    country: 'United States',
    currency: 'USD',
    basePricePerSqft: 700,
    districts: [
      { name: 'South Beach', priceIndex: 1.3, lat: 25.7826, lng: -80.1341 },
      { name: 'Brickell', priceIndex: 1.1, lat: 25.7617, lng: -80.1918 },
      { name: 'Coral Gables', priceIndex: 0.98, lat: 25.7215, lng: -80.2684 },
    ],
  },
  {
    city: 'Dubai',
    country: 'United Arab Emirates',
    currency: 'AED',
    basePricePerSqft: 640,
    districts: [
      { name: 'Palm Jumeirah', priceIndex: 1.6, lat: 25.1124, lng: 55.139 },
      { name: 'Downtown Dubai', priceIndex: 1.25, lat: 25.1972, lng: 55.2744 },
      { name: 'Jumeirah Village Circle', priceIndex: 0.72, lat: 25.0603, lng: 55.2087 },
    ],
  },
  {
    city: 'Riyadh',
    country: 'Saudi Arabia',
    currency: 'SAR',
    basePricePerSqft: 420,
    districts: [
      { name: 'Al Olaya', priceIndex: 1.3, lat: 24.6949, lng: 46.6853 },
      { name: 'Diplomatic Quarter', priceIndex: 1.45, lat: 24.6824, lng: 46.6224 },
      { name: 'Al Malqa', priceIndex: 1.05, lat: 24.7907, lng: 46.6294 },
    ],
  },
  {
    city: 'Cairo',
    country: 'Egypt',
    currency: 'EGP',
    basePricePerSqft: 215,
    districts: [
      { name: 'New Cairo', priceIndex: 1.2, lat: 30.0076, lng: 31.4913 },
      { name: 'Zamalek', priceIndex: 1.35, lat: 30.0606, lng: 31.2197 },
      { name: 'Sheikh Zayed', priceIndex: 1.05, lat: 30.0455, lng: 30.9756 },
    ],
  },
  {
    city: 'Barcelona',
    country: 'Spain',
    currency: 'EUR',
    basePricePerSqft: 560,
    districts: [
      { name: 'Eixample', priceIndex: 1.2, lat: 41.3918, lng: 2.1649 },
      { name: 'Gràcia', priceIndex: 1.0, lat: 41.4028, lng: 2.1565 },
      { name: 'Poblenou', priceIndex: 1.1, lat: 41.3995, lng: 2.2035 },
    ],
  },
];

const TYPE_CYCLE: PropertyType[] = [
  'apartment',
  'villa',
  'house',
  'penthouse',
  'townhouse',
  'studio',
  'office',
  'land',
  'apartment',
  'penthouse',
  'house',
  'apartment',
];

const TYPE_AREA: Record<PropertyType, [number, number]> = {
  apartment: [820, 2150],
  villa: [3100, 7200],
  house: [1750, 4100],
  penthouse: [2200, 4650],
  townhouse: [1450, 2750],
  studio: [380, 690],
  office: [900, 5800],
  land: [5200, 38000],
};

const TYPE_PRICE_MULTIPLIER: Record<PropertyType, number> = {
  apartment: 1,
  villa: 1.22,
  house: 1.08,
  penthouse: 1.62,
  townhouse: 0.98,
  studio: 1.05,
  office: 0.86,
  land: 0.34,
};

const TYPE_TITLE: Record<PropertyType, string> = {
  apartment: 'Apartment',
  villa: 'Villa',
  house: 'House',
  penthouse: 'Penthouse',
  townhouse: 'Townhouse',
  studio: 'Studio',
  office: 'Office Space',
  land: 'Development Plot',
};

const QUALIFIERS = [
  'Sunlit',
  'Panoramic',
  'Architect-Designed',
  'Serene',
  'Light-Filled',
  'Impeccably Renovated',
  'Corner',
  'Landmark',
  'Boutique',
  'Skyline',
  'Garden-Facing',
  'Contemporary',
];

const HIGHLIGHTS = [
  'floor-to-ceiling glazing that frames the horizon',
  'a rare double-aspect layout with cross ventilation',
  'bespoke joinery finished by local craftsmen',
  'a chef-grade kitchen with integrated appliances',
  'a private lift lobby opening directly into the residence',
  'warm oak flooring throughout the principal rooms',
  'a landscaped terrace designed for year-round entertaining',
  'restored architectural details paired with modern systems',
];

const CLOSERS = [
  'Moments from cafés, galleries and the waterfront promenade.',
  'Within walking distance of top-rated schools and transit links.',
  'Set on a quiet, tree-lined street yet minutes from the financial district.',
  'Positioned to capture the best light of the day from every principal room.',
  'A short drive from the international airport and private aviation terminal.',
  'Steps from the neighbourhood park, farmers market and boutique retail.',
];

const AMENITY_POOL = [
  'wifi',
  'parking',
  'pool',
  'gym',
  'garden',
  'security',
  'ac',
  'heating',
  'balcony',
  'elevator',
  'fireplace',
  'laundry',
  'pets',
  'smart-home',
  'solar',
  'sea-view',
  'city-view',
  'waterfront',
  'playground',
  'concierge',
  'storage',
  'bbq',
  'accessible',
  'furnished',
  'study',
  'spa',
];


/* -------------------------------------------------------------------------- */
/* Arabic copy. Every array is index-aligned with its English twin above.      */
/* -------------------------------------------------------------------------- */
const TYPE_TITLE_AR: Record<PropertyType, { word: string; feminine: boolean }> = {
  apartment: { word: 'شقة', feminine: true },
  villa: { word: 'فيلا', feminine: true },
  house: { word: 'منزل', feminine: false },
  penthouse: { word: 'بنتهاوس', feminine: false },
  townhouse: { word: 'تاون هاوس', feminine: false },
  studio: { word: 'استوديو', feminine: false },
  office: { word: 'مساحة مكتبية', feminine: true },
  land: { word: 'قطعة أرض للتطوير', feminine: true },
};

/** [masculine, feminine, isPhrase]. Phrases ("with a view") do not change with gender. */
const QUALIFIERS_AR: Array<[string, string, boolean]> = [
  ['مشمس', 'مشمسة', false],
  ['بإطلالة بانورامية', 'بإطلالة بانورامية', true],
  ['بتصميم معماري', 'بتصميم معماري', true],
  ['هادئ', 'هادئة', false],
  ['غامر بالضوء', 'غامرة بالضوء', false],
  ['مجدَّد بإتقان', 'مجدَّدة بإتقان', false],
  ['ركني', 'ركنية', false],
  ['بارز', 'بارزة', false],
  ['على طراز البوتيك', 'على طراز البوتيك', true],
  ['بإطلالة على الأفق', 'بإطلالة على الأفق', true],
  ['مطل على الحديقة', 'مطلة على الحديقة', false],
  ['عصري', 'عصرية', false],
];

const OPENNESS = ['welcoming', 'generous', 'effortless', 'quietly luxurious', 'unmistakably refined'];
const OPENNESS_AR = ['مرحِّبة', 'رحبة', 'سلسة', 'فاخرة بهدوء', 'راقية بلا منازع'];

const HIGHLIGHTS_AR = [
  'واجهات زجاجية من الأرض إلى السقف تؤطّر الأفق',
  'تصميم نادر بواجهتين مع تهوية متقاطعة',
  'أعمال نجارة مصمّمة خصيصًا نفّذها حرفيون محليون',
  'مطبخ بمواصفات الطهاة مع أجهزة مدمجة',
  'مدخل مصعد خاص يفتح مباشرة على المسكن',
  'أرضيات من خشب البلوط الدافئ في الغرف الرئيسية',
  'تراس مُنسَّق الحدائق صُمّم للاستضافة على مدار العام',
  'تفاصيل معمارية مرمَّمة تجمعها أنظمة حديثة',
];

const CLOSERS_AR = [
  'على بُعد دقائق من المقاهي والمعارض الفنية وكورنيش الواجهة البحرية.',
  'على مسافة قريبة سيرًا على الأقدام من أفضل المدارس وخطوط المواصلات.',
  'تقع على شارع هادئ تصطف الأشجار على جانبيه، وعلى بُعد دقائق من الحي المالي.',
  'موقع يلتقط أفضل إضاءة في اليوم من كل غرفة رئيسية.',
  'على بُعد مسافة قصيرة بالسيارة من المطار الدولي ومحطة الطيران الخاص.',
  'خطوات من حديقة الحي وسوق المزارعين ومتاجر البوتيك.',
];

const BEDROOM_WORDS_AR: Record<number, string> = {
  1: 'بغرفة نوم واحدة',
  2: 'بغرفتي نوم',
  3: 'بثلاث غرف نوم',
  4: 'بأربع غرف نوم',
  5: 'بخمس غرف نوم',
  6: 'بست غرف نوم',
};

function bedroomsAr(count: number): string {
  return BEDROOM_WORDS_AR[count] ?? `بـ${count.toLocaleString('ar-EG')} غرف نوم`;
}

function buildTitleAr(type: PropertyType, qualifierIndex: number, bedrooms: number): string {
  const { word, feminine } = TYPE_TITLE_AR[type];
  const [masculine, femininePhrase, isPhrase] = QUALIFIERS_AR[qualifierIndex];
  const qualifier = feminine ? femininePhrase : masculine;
  if (bedrooms <= 0) return `${word} ${qualifier}`;
  // A phrase qualifier already starts with "ب", so join the bedrooms with "و".
  return `${word} ${qualifier} ${isPhrase ? 'و' : ''}${bedroomsAr(bedrooms)}`;
}

/** Draws an index so the English and Arabic twin arrays stay aligned. */
function pickIndex(length: number, random: () => number): number {
  return Math.floor(random() * length);
}

function pickMany<T>(list: readonly T[], count: number, random: () => number): T[] {
  const pool = [...list];
  const output: T[] = [];
  while (output.length < count && pool.length > 0) {
    const index = Math.floor(random() * pool.length);
    output.push(pool.splice(index, 1)[0]);
  }
  return output;
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

interface DescriptionPair {
  en: string;
  ar: string;
}

function buildDescription(
  title: string,
  titleAr: string,
  location: string,
  locationAr: string,
  type: PropertyType,
  highlightIndex: number,
  closerIndex: number,
  random: () => number,
): DescriptionPair {
  const opennessIndex = pickIndex(OPENNESS.length, random);
  const typeName = TYPE_TITLE[type].toLowerCase();
  const highlight = HIGHLIGHTS[highlightIndex];
  const highlightAr = HIGHLIGHTS_AR[highlightIndex];

  // Plots and offices have no "living space" or "bedrooms", so they get their own copy.
  if (type === 'land') {
    const closer =
      closerIndex === 3 ? 'Positioned to capture the best light of the day across the whole site.' : CLOSERS[closerIndex];
    const closerAr = closerIndex === 3 ? 'موقع يلتقط أفضل إضاءة في اليوم على امتداد الموقع كله.' : CLOSERS_AR[closerIndex];
    const en = [
      `${title} is a ${OPENNESS[opennessIndex]} ${typeName} in ${location}, with generous frontage and open sightlines.`,
      'The plot is level, fully surveyed and ready for planning, with road access and utilities close to the boundary.',
      closer,
    ].join(' ');
    const ar = [
      `${titleAr} في ${locationAr}، بأجواء ${OPENNESS_AR[opennessIndex]} وواجهة رحبة وخطوط رؤية مفتوحة.`,
      'القطعة مستوية ومُدقَّقة المساحة وجاهزة للتخطيط، مع طريق مباشر ومرافق قريبة من حدودها.',
      closerAr,
    ].join(' ');
    return { en, ar };
  }

  if (type === 'office') {
    const en = [
      `${title} is a ${OPENNESS[opennessIndex]} ${typeName} in ${location}, arranged to make the most of natural light and long sightlines.`,
      `The main floor plate is flexible, with ${highlight} and meeting rooms and quiet focus areas that are easy to arrange.`,
      CLOSERS[closerIndex],
    ].join(' ');
    const ar = [
      `${titleAr} في ${locationAr}، بأجواء ${OPENNESS_AR[opennessIndex]} وتصميم يستثمر الضوء الطبيعي وخطوط الرؤية الممتدة إلى أقصى حد.`,
      `مسطح الطابق الرئيسي مرن، مع ${highlightAr}، وسهولة في ترتيب غرف الاجتماعات ومناطق التركيز الهادئة.`,
      CLOSERS_AR[closerIndex],
    ].join(' ');
    return { en, ar };
  }

  const en = [
    `${title} is a ${OPENNESS[opennessIndex]} ${typeName} in ${location}, arranged to make the most of natural light and long sightlines.`,
    `The principal living space features ${highlight}, while the sleeping quarters are zoned for privacy and calm.`,
    CLOSERS[closerIndex],
  ].join(' ');
  const ar = [
    `${titleAr} في ${locationAr}، بأجواء ${OPENNESS_AR[opennessIndex]} وتصميم يستثمر الضوء الطبيعي وخطوط الرؤية الممتدة إلى أقصى حد.`,
    `تتميّز مساحة المعيشة الرئيسية ب${highlightAr}، بينما خُصّصت غرف النوم لتوفير الخصوصية والهدوء.`,
    CLOSERS_AR[closerIndex],
  ].join(' ');
  return { en, ar };
}

function statusFor(index: number, random: () => number): PropertyStatus {
  if (index % 17 === 0) return 'sold';
  if (index % 11 === 0) return 'pending';
  if (index % 23 === 0) return 'draft';
  return random() > 0.94 ? 'pending' : 'active';
}

export function generateProperties(): Property[] {
  const random = mulberry32(20260124);
  const properties: Property[] = [];
  let index = 0;

  CITY_SEEDS.forEach((citySeed) => {
    citySeed.districts.forEach((district, districtIndex) => {
      const listingsPerDistrict = districtIndex === 0 ? 3 : 2;
      for (let slot = 0; slot < listingsPerDistrict; slot += 1) {
        const type = TYPE_CYCLE[index % TYPE_CYCLE.length];
        const [minArea, maxArea] = TYPE_AREA[type];
        const area = roundTo(minArea + random() * (maxArea - minArea), 10);

        const listingType: ListingType = random() > 0.66 ? 'rent' : 'sale';
        const salePrice = roundTo(
          area *
            citySeed.basePricePerSqft *
            district.priceIndex *
            TYPE_PRICE_MULTIPLIER[type],
          500,
        );
        const price =
          listingType === 'rent' ? roundTo(salePrice / 260, 25) : salePrice;

        const bedrooms =
          type === 'studio'
            ? 0
            : type === 'land'
              ? 0
              : Math.max(1, Math.min(6, Math.round(area / 620) + (type === 'villa' ? 1 : 0)));
        const bathrooms = Math.max(
          type === 'land' ? 0 : 1,
          Math.min(5, Math.ceil(bedrooms * 0.8) + (type === 'villa' || type === 'penthouse' ? 1 : 0)),
        );

        const qualifierIndex = pickIndex(QUALIFIERS.length, random);
        const qualifier = QUALIFIERS[qualifierIndex];
        const titleAr = buildTitleAr(type, qualifierIndex, bedrooms);
        const title = `${qualifier} ${bedrooms > 0 ? `${bedrooms}-Bedroom ` : ''}${TYPE_TITLE[type]}`;
        const location = `${district.name}, ${citySeed.city}`;
        const locationAr = `${DISTRICT_AR[district.name] ?? district.name}، ${CITY_AR[citySeed.city] ?? citySeed.city}`;
        let description: DescriptionPair = { en: '', ar: '' };

        const amenityCount = type === 'land' ? 4 : 6 + Math.floor(random() * 6);
        const amenities = pickMany(AMENITY_POOL, amenityCount, random);

        const yearBuilt =
          type === 'land' ? 0 : 1975 + Math.floor(random() * 50);
        const floors =
          type === 'villa' || type === 'house' || type === 'townhouse'
            ? 2 + Math.floor(random() * 2)
            : type === 'land'
              ? 0
              : 1 + Math.floor(random() * 30);

        const createdAt = new Date(
          Date.UTC(2025, 0, 1) + Math.floor(random() * 330) * 86_400_000,
        ).toISOString();

        const heroImage = buildPropertyGallery(type, index, 7);

        properties.push({
          id: `prop-${String(index + 1).padStart(3, '0')}`,
          title,
          // Assigned inline so random draws keep their original order.
          description: (description = buildDescription(
            title,
            titleAr,
            location,
            locationAr,
            type,
            pickIndex(HIGHLIGHTS.length, random),
            pickIndex(CLOSERS.length, random),
            random,
          )).en,
          type,
          listingType,
          status: statusFor(index, random),
          price,
          currency: citySeed.currency,
          pricePeriod: listingType === 'rent' ? 'month' : 'total',
          area,
          bedrooms,
          bathrooms,
          garages: type === 'land' ? 0 : Math.floor(random() * 3),
          yearBuilt,
          floors,
          furnished: random() > 0.62,
          amenities,
          location: {
            address: `${100 + Math.floor(random() * 880)} ${district.name} Avenue`,
            city: citySeed.city,
            district: district.name,
            country: citySeed.country,
            coordinates: {
              lat: Number((district.lat + (random() - 0.5) * 0.03).toFixed(5)),
              lng: Number((district.lng + (random() - 0.5) * 0.03).toFixed(5)),
            },
          },
          images: heroImage,
          coverImage: heroImage[0],
          agentId: `agent-${(index % 6) + 1}`,
          featured: index % 5 === 0,
          rating: Number((3.8 + random() * 1.2).toFixed(1)),
          reviewsCount: Math.floor(random() * 180) + 3,
          views: Math.floor(random() * 5400) + 120,
          createdAt,
          updatedAt: createdAt,
          ownerId: 'user-admin',
          translations: {
            ar: {
              title: titleAr,
              description: description.ar,
              source: { title, description: description.en },
            },
          },
        });

        index += 1;
      }
    });
  });

  return properties;
}

export const SEED_PROPERTIES: Property[] = generateProperties();
