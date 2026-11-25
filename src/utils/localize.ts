import type { Agent, Language, Property } from '@/types';

/* -------------------------------------------------------------------------- */
/* Place names                                                                 */
/* -------------------------------------------------------------------------- */
export const CITY_AR: Record<string, string> = {
  'San Francisco': 'سان فرانسيسكو',
  'Los Angeles': 'لوس أنجلوس',
  'New York': 'نيويورك',
  Miami: 'ميامي',
  Dubai: 'دبي',
  Riyadh: 'الرياض',
  Cairo: 'القاهرة',
  Barcelona: 'برشلونة',
};

export const COUNTRY_AR: Record<string, string> = {
  'United States': 'الولايات المتحدة',
  'United Arab Emirates': 'الإمارات العربية المتحدة',
  'Saudi Arabia': 'المملكة العربية السعودية',
  Egypt: 'مصر',
  Spain: 'إسبانيا',
};

export const DISTRICT_AR: Record<string, string> = {
  'Pacific Heights': 'باسيفيك هايتس',
  SoMa: 'سوما',
  'Mission District': 'حي ميشن',
  'Beverly Hills': 'بيفرلي هيلز',
  'Santa Monica': 'سانتا مونيكا',
  'Silver Lake': 'سيلفر ليك',
  Tribeca: 'تريبيكا',
  'Upper West Side': 'أبر ويست سايد',
  'Brooklyn Heights': 'بروكلين هايتس',
  'South Beach': 'ساوث بيتش',
  Brickell: 'بريكل',
  'Coral Gables': 'كورال غيبلز',
  'Palm Jumeirah': 'نخلة جميرا',
  'Downtown Dubai': 'وسط مدينة دبي',
  'Jumeirah Village Circle': 'قرية جميرا الدائرية',
  'Al Olaya': 'العليا',
  'Diplomatic Quarter': 'الحي الدبلوماسي',
  'Al Malqa': 'الملقا',
  'New Cairo': 'القاهرة الجديدة',
  Zamalek: 'الزمالك',
  'Sheikh Zayed': 'الشيخ زايد',
  Eixample: 'إيشامبل',
  'Gràcia': 'غراسيا',
  Poblenou: 'بوبلينو',
};

const LANGUAGE_NAME_AR: Record<string, string> = {
  English: 'الإنجليزية',
  Arabic: 'العربية',
  French: 'الفرنسية',
  Spanish: 'الإسبانية',
  Italian: 'الإيطالية',
  German: 'الألمانية',
  Yoruba: 'اليوروبا',
  Japanese: 'اليابانية',
};

/** Translate a place name when Arabic is active and the name is known. */
export function placeName(
  kind: 'city' | 'country' | 'district',
  value: string,
  language: Language,
): string {
  if (language !== 'ar') return value;
  const table = kind === 'city' ? CITY_AR : kind === 'country' ? COUNTRY_AR : DISTRICT_AR;
  return table[value] ?? value;
}

/** "123 Pacific Heights Avenue" becomes "123 شارع باسيفيك هايتس". */
function translateAddress(address: string): string {
  const match = /^(\d+)\s+(.+?)\s+Avenue$/i.exec(address.trim());
  if (!match) return address;
  const [, number, district] = match;
  return `${number} شارع ${DISTRICT_AR[district] ?? district}`;
}

/* -------------------------------------------------------------------------- */
/* Properties                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Returns the property with its display copy in the active language. Fields
 * without a translation (for example text typed by an admin in English) are
 * shown as written. Identifiers and numbers are never touched.
 */
export function localizeProperty(property: Property, language: Language): Property {
  if (language !== 'ar') return property;

  const translation = property.translations?.ar;
  // Only trust the stored Arabic while the English it was written for is unchanged.
  const titleFresh = translation && translation.source.title === property.title;
  const descriptionFresh = translation && translation.source.description === property.description;

  return {
    ...property,
    title: titleFresh ? translation.title : property.title,
    description: descriptionFresh ? translation.description : property.description,
    location: {
      ...property.location,
      address: translateAddress(property.location.address),
      city: placeName('city', property.location.city, language),
      district: placeName('district', property.location.district, language),
      country: placeName('country', property.location.country, language),
    },
  };
}

/** Arabic strings used so search works in either language. */
export function searchableTranslations(property: Property): string[] {
  const translation = property.translations?.ar;
  const location = property.location;
  return [
    translation?.title ?? '',
    translation?.description ?? '',
    CITY_AR[location.city] ?? '',
    DISTRICT_AR[location.district] ?? '',
    COUNTRY_AR[location.country] ?? '',
  ];
}

/* -------------------------------------------------------------------------- */
/* Agents                                                                      */
/* -------------------------------------------------------------------------- */
interface AgentArabic {
  name: string;
  title: string;
  bio: string;
}

const AGENT_AR: Record<string, AgentArabic> = {
  'Layla Haddad': {
    name: 'ليلى حداد',
    title: 'مستشارة عقارات فاخرة أولى',
    bio: 'متخصصة في الفلل المطلة على الواجهات البحرية وإعادة بيع البنتهاوس، بخبرة تتجاوز عشر سنوات في إتمام الصفقات عالية القيمة.',
  },
  'Marcus Bennett': {
    name: 'ماركوس بينيت',
    title: 'رئيس المبيعات السكنية',
    bio: 'يقدّم المشورة للعائلات والمستثمرين في أسواق المدن الكبرى، مع تركيز على المشاريع الجديدة.',
  },
  'Noor Al Farsi': {
    name: 'نور الفارسي',
    title: 'أخصائية العقارات الاستثمارية',
    bio: 'تصمّم عمليات استحواذ قائمة على العائد لعملاء المحافظ الاستثمارية في الخليج وجنوب أوروبا.',
  },
  'Sofia Marchetti': {
    name: 'صوفيا ماركيتي',
    title: 'رئيسة التصميم والعمارة',
    bio: 'تربط المشترين أصحاب الذوق الرفيع بمنازل ذات قيمة معمارية وفرص الترميم.',
  },
  'Daniel Okafor': {
    name: 'دانيال أوكافور',
    title: 'مدير الإيجارات',
    bio: 'يدير قسم الإيجارات طويلة الأجل، من انتقال الشركات إلى الشقق الفندقية المُدارة بالكامل.',
  },
  'Hana Kimura': {
    name: 'هانا كيمورا',
    title: 'مستشارة العقارات التجارية',
    bio: 'ترافق المؤسسين والمشغّلين في استراتيجيات تأجير المكاتب والمشاريع متعددة الاستخدامات.',
  },
};

export function localizeAgent(agent: Agent, language: Language): Agent {
  if (language !== 'ar') return agent;
  const arabic = AGENT_AR[agent.name];
  return {
    ...agent,
    name: arabic?.name ?? agent.name,
    title: arabic?.title ?? agent.title,
    bio: arabic?.bio ?? agent.bio,
    languages: agent.languages.map((item) => LANGUAGE_NAME_AR[item] ?? item),
  };
}
