import type { Amenity } from '@/types';

/**
 * Master amenity catalogue. `icon` maps to a key in `@/utils/iconRegistry`.
 */
export const AMENITIES: Amenity[] = [
  { id: 'wifi', label: 'High-speed WiFi', labelAr: 'واي فاي عالي السرعة', category: 'utilities', icon: 'Wifi' },
  { id: 'parking', label: 'Covered parking', labelAr: 'موقف سيارات مغطى', category: 'exterior', icon: 'Car' },
  { id: 'pool', label: 'Swimming pool', labelAr: 'مسبح', category: 'exterior', icon: 'Waves' },
  { id: 'gym', label: 'Fitness centre', labelAr: 'صالة رياضية', category: 'building', icon: 'Dumbbell' },
  { id: 'garden', label: 'Private garden', labelAr: 'حديقة خاصة', category: 'exterior', icon: 'Trees' },
  { id: 'security', label: '24/7 security', labelAr: 'أمن على مدار الساعة', category: 'building', icon: 'ShieldCheck' },
  { id: 'ac', label: 'Central air conditioning', labelAr: 'تكييف مركزي', category: 'utilities', icon: 'Snowflake' },
  { id: 'heating', label: 'Underfloor heating', labelAr: 'تدفئة أرضية', category: 'utilities', icon: 'Flame' },
  { id: 'balcony', label: 'Private balcony', labelAr: 'شرفة خاصة', category: 'exterior', icon: 'Building2' },
  { id: 'elevator', label: 'Elevator access', labelAr: 'مصعد', category: 'building', icon: 'MoveVertical' },
  { id: 'fireplace', label: 'Fireplace', labelAr: 'مدفأة', category: 'interior', icon: 'Flame' },
  { id: 'laundry', label: 'Laundry room', labelAr: 'غرفة غسيل', category: 'interior', icon: 'Wind' },
  { id: 'pets', label: 'Pet friendly', labelAr: 'يسمح بالحيوانات', category: 'building', icon: 'Dog' },
  { id: 'smart-home', label: 'Smart home system', labelAr: 'نظام منزل ذكي', category: 'utilities', icon: 'Cpu' },
  { id: 'solar', label: 'Solar panels', labelAr: 'ألواح شمسية', category: 'utilities', icon: 'Sun' },
  { id: 'sea-view', label: 'Sea view', labelAr: 'إطلالة على البحر', category: 'exterior', icon: 'Eye' },
  { id: 'city-view', label: 'Panoramic city view', labelAr: 'إطلالة بانورامية على المدينة', category: 'exterior', icon: 'Eye' },
  { id: 'waterfront', label: 'Waterfront access', labelAr: 'وصول مباشر للمياه', category: 'exterior', icon: 'Waves' },
  { id: 'playground', label: "Children's playground", labelAr: 'ملعب أطفال', category: 'building', icon: 'Play' },
  { id: 'concierge', label: 'Concierge service', labelAr: 'خدمة الكونسيرج', category: 'building', icon: 'BellRing' },
  { id: 'storage', label: 'Storage room', labelAr: 'غرفة تخزين', category: 'interior', icon: 'Boxes' },
  { id: 'bbq', label: 'Outdoor BBQ area', labelAr: 'منطقة شواء خارجية', category: 'exterior', icon: 'Utensils' },
  { id: 'accessible', label: 'Step-free access', labelAr: 'وصول بدون درجات', category: 'building', icon: 'Accessibility' },
  { id: 'furnished', label: 'Fully furnished', labelAr: 'مفروش بالكامل', category: 'interior', icon: 'Sofa' },
  { id: 'study', label: 'Dedicated study', labelAr: 'غرفة دراسة', category: 'interior', icon: 'BookOpen' },
  { id: 'spa', label: 'Spa & sauna', labelAr: 'سبا وساونا', category: 'building', icon: 'Sparkles' },
];

export const AMENITY_MAP: Record<string, Amenity> = Object.fromEntries(
  AMENITIES.map((amenity) => [amenity.id, amenity]),
);

export const AMENITY_BY_CATEGORY = AMENITIES.reduce<Record<string, Amenity[]>>(
  (acc, amenity) => {
    acc[amenity.category] = [...(acc[amenity.category] ?? []), amenity];
    return acc;
  },
  {},
);
