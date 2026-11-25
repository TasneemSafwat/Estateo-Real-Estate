import {
  Accessibility,
  BellRing,
  BookOpen,
  Boxes,
  Building2,
  Car,
  Cpu,
  Dog,
  Dumbbell,
  Eye,
  Flame,
  HelpCircle,
  MoveVertical,
  Play,
  ShieldCheck,
  Snowflake,
  Sofa,
  Sparkles,
  Sun,
  Trees,
  Utensils,
  Waves,
  Wifi,
  Wind,
  type LucideProps,
} from 'lucide-react';
import type { ComponentType } from 'react';

/**
 * Maps the string icon names stored in the amenity catalogue to Lucide
 * components, keeping the data layer free of React imports.
 */
const ICON_REGISTRY: Record<string, ComponentType<LucideProps>> = {
  Wifi,
  Car,
  Waves,
  Dumbbell,
  Trees,
  ShieldCheck,
  Snowflake,
  Flame,
  Building2,
  MoveVertical,
  Wind,
  Dog,
  Cpu,
  Sun,
  Eye,
  Play,
  BellRing,
  Boxes,
  Utensils,
  Accessibility,
  Sofa,
  BookOpen,
  Sparkles,
};

export interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Component = ICON_REGISTRY[name] ?? HelpCircle;
  return <Component aria-hidden="true" {...props} />;
}
