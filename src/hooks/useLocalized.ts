import { useMemo } from 'react';
import type { Agent, Language, Property } from '@/types';
import { useAppSelector } from '@/store/hooks';
import { localizeAgent, localizeProperty } from '@/utils/localize';

/** Active UI language from the preferences store. */
function useLanguageCode(): Language {
  return useAppSelector((state) => state.preferences.language);
}

/** Property with title, description and location in the active language. */
export function useLocalizedProperty(property: Property): Property {
  const language = useLanguageCode();
  return useMemo(() => localizeProperty(property, language), [property, language]);
}

/** Agent with name, title, bio and languages in the active language. */
export function useLocalizedAgent(agent: Agent): Agent;
export function useLocalizedAgent(agent: Agent | undefined): Agent | undefined;
export function useLocalizedAgent(agent: Agent | undefined): Agent | undefined {
  const language = useLanguageCode();
  return useMemo(() => (agent ? localizeAgent(agent, language) : undefined), [agent, language]);
}

/** Returns a stable function that localizes any property (for lists and tables). */
export function useLocalizeProperty(): (property: Property) => Property {
  const language = useLanguageCode();
  return useMemo(() => (property: Property) => localizeProperty(property, language), [language]);
}
