import type { Agent } from '@/types';
import { buildAvatar } from '@/utils/images';

const agentSeed: Array<Omit<Agent, 'id' | 'avatar'>> = [
  {
    name: 'Layla Haddad',
    title: 'Senior Luxury Advisor',
    phone: '+1 (415) 555-0117',
    email: 'layla.haddad@estateo.app',
    rating: 4.9,
    listingsCount: 34,
    bio: 'Specialises in waterfront villas and penthouse resales with over a decade of experience closing high-value transactions.',
    languages: ['English', 'Arabic', 'French'],
  },
  {
    name: 'Marcus Bennett',
    title: 'Head of Residential Sales',
    phone: '+1 (212) 555-0184',
    email: 'marcus.bennett@estateo.app',
    rating: 4.8,
    listingsCount: 41,
    bio: 'Advises families and investors across metropolitan markets with a focus on new-build developments.',
    languages: ['English', 'Spanish'],
  },
  {
    name: 'Noor Al Farsi',
    title: 'Investment Property Specialist',
    phone: '+971 50 555 0192',
    email: 'noor.alfarsi@estateo.app',
    rating: 4.9,
    listingsCount: 28,
    bio: 'Structures yield-driven acquisitions for portfolio clients across the Gulf and Southern Europe.',
    languages: ['Arabic', 'English'],
  },
  {
    name: 'Sofia Marchetti',
    title: 'Design & Architecture Lead',
    phone: '+39 06 555 0143',
    email: 'sofia.marchetti@estateo.app',
    rating: 4.7,
    listingsCount: 22,
    bio: 'Matches discerning buyers with architecturally significant homes and restoration opportunities.',
    languages: ['Italian', 'English', 'German'],
  },
  {
    name: 'Daniel Okafor',
    title: 'Rentals Manager',
    phone: '+44 20 5550 0166',
    email: 'daniel.okafor@estateo.app',
    rating: 4.8,
    listingsCount: 57,
    bio: 'Runs the long-let desk, from corporate relocation to fully managed serviced apartments.',
    languages: ['English', 'Yoruba'],
  },
  {
    name: 'Hana Kimura',
    title: 'Commercial Advisor',
    phone: '+81 3 5550 0121',
    email: 'hana.kimura@estateo.app',
    rating: 4.6,
    listingsCount: 19,
    bio: 'Guides founders and operators through office and mixed-use leasing strategy.',
    languages: ['Japanese', 'English'],
  },
];

export const AGENTS: Agent[] = agentSeed.map((agent, index) => ({
  ...agent,
  id: `agent-${index + 1}`,
  avatar: buildAvatar(agent.name, index),
}));

export const AGENT_MAP: Record<string, Agent> = Object.fromEntries(
  AGENTS.map((agent) => [agent.id, agent]),
);
