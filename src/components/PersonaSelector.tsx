
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Persona {
  id: string;
  name: string;
  role: string;
  goals: string[];
  frustrations: string[];
  tools: string[];
}

interface PersonaSelectorProps {
  personas: Persona[];
  selectedPersonas: string[];
  onTogglePersona: (personaId: string) => void;
}

export function PersonaSelector({ personas, selectedPersonas, onTogglePersona }: PersonaSelectorProps) {
  if (personas.length === 0) return null;

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Select Personas</label>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {personas.map((persona) => (
          <div
            key={persona.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedPersonas.includes(persona.id)
                ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTogglePersona(persona.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm">{persona.name}</h4>
                <p className="text-xs text-gray-600">{persona.role}</p>
              </div>
              {selectedPersonas.includes(persona.id) && (
                <Badge className="bg-red-500">Selected</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
