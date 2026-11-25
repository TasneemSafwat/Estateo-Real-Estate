import { buildAvatar } from '@/utils/images';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  avatar: string;
  rating: number;
  quote: string;
  quoteAr: string;
}

const seed: Array<Omit<Testimonial, 'id' | 'avatar'>> = [
  {
    name: 'Elena Petrova',
    role: 'Relocated buyer',
    city: 'Miami',
    rating: 5,
    quote:
      'Estateo narrowed 240 listings down to the six that actually matched my brief. The side-by-side comparison saved me weeks of viewings.',
    quoteAr:
      'ساعدتني Estateo في تقليص ٢٤٠ عرضاً إلى ستة خيارات تناسب احتياجاتي بالضبط. المقارنة الجانبية وفّرت عليّ أسابيع من المعاينات.',
  },
  {
    name: 'Tariq Mansour',
    role: 'Portfolio investor',
    city: 'Dubai',
    rating: 5,
    quote:
      'The analytics view shows exactly what I need — price per square foot, yield cues and how long each listing has been live.',
    quoteAr:
      'تعرض لوحة التحليلات ما أحتاجه بالضبط: سعر القدم المربع ومؤشرات العائد ومدة بقاء كل عرض على المنصة.',
  },
  {
    name: 'Grace Whitfield',
    role: 'First-time buyer',
    city: 'Seattle',
    rating: 4,
    quote:
      'Shortlisting favourites in one place and sharing them with my partner made the whole decision feel calm and organised.',
    quoteAr:
      'جمع المفضلة في مكان واحد ومشاركتها مع شريكي جعل قرار الشراء أكثر هدوءاً وتنظيماً.',
  },
  {
    name: 'Yousef Al Harbi',
    role: 'Family buyer',
    city: 'Riyadh',
    rating: 5,
    quote:
      'The Arabic experience is genuinely excellent — proper right-to-left layout, not a stretched English template.',
    quoteAr:
      'التجربة العربية ممتازة فعلاً — تصميم من اليمين إلى اليسار بشكل صحيح، وليست نسخة ممدودة من قالب إنجليزي.',
  },
  {
    name: 'Marta Ruiz',
    role: 'Second-home buyer',
    city: 'Barcelona',
    rating: 5,
    quote:
      'Agent profiles, mapping and instant contact made a cross-border purchase feel surprisingly straightforward.',
    quoteAr:
      'ملفات الوكلاء والخرائط والتواصل الفوري جعلت الشراء عبر الحدود سهلاً بشكل مفاجئ.',
  },
  {
    name: 'Nathan Cole',
    role: 'Property manager',
    city: 'New York',
    rating: 4,
    quote:
      'Managing listings from the dashboard is fast, and the confirmation dialogs mean I never delete the wrong record.',
    quoteAr:
      'إدارة العروض من لوحة التحكم سريعة، ونوافذ التأكيد تمنعني من حذف السجل الخطأ.',
  },
];

export const TESTIMONIALS: Testimonial[] = seed.map((item, index) => ({
  ...item,
  id: `testimonial-${index + 1}`,
  avatar: buildAvatar(item.name, index),
}));
