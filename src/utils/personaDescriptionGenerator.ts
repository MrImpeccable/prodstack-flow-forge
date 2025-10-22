import { Persona } from '@/components/PersonaCard';

export interface PersonaDescription {
  description: string;
  keywords: string[];
}

export function generatePersonaDescription(persona: Persona): PersonaDescription {
  const name = persona.name;
  const role = persona.role || 'individual';
  
  // Extract primary goal and frustration
  const primaryGoal = persona.goals?.[0] || 'achieve their objectives';
  const primaryFrustration = persona.frustrations?.[0] || 'current challenges';
  
  // Build concise description
  let description = '';
  
  if (persona.bio && persona.bio.length > 0) {
    // Use bio if available, but keep it concise
    const shortBio = persona.bio.split('.')[0] + '.';
    description = `${name}: ${shortBio}`;
  } else {
    // Generate from role and goals
    description = `${name}: A ${role} who wants to ${primaryGoal}.`;
  }
  
  // Add frustration or motivation
  if (primaryFrustration) {
    description += ` Currently facing challenges with ${primaryFrustration.toLowerCase()}.`;
  }
  
  // Keep it under 50 words
  const words = description.split(' ');
  if (words.length > 50) {
    description = words.slice(0, 50).join(' ') + '...';
  }
  
  // Identify keywords to highlight
  const keywords: string[] = [];
  
  // Add goal-related keywords
  if (primaryGoal) {
    keywords.push(primaryGoal);
  }
  
  // Add frustration-related keywords
  if (primaryFrustration && primaryFrustration !== 'current challenges') {
    keywords.push(primaryFrustration);
  }
  
  // Add role if it's specific
  if (role && role !== 'individual') {
    keywords.push(role);
  }
  
  return {
    description,
    keywords,
  };
}
