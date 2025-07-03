
import React from 'react';

interface Persona {
  id: string;
  name: string;
  role: string;
  goals: string[];
  frustrations: string[];
  tools: string[];
}

interface Canvas {
  id: string;
  name: string;
  pain_points: string[];
  opportunities: string[];
  current_behaviors: string[];
}

interface DataAvailabilityDisplayProps {
  selectedWorkspace: string;
  personas: Persona[];
  canvases: Canvas[];
}

export function DataAvailabilityDisplay({
  selectedWorkspace,
  personas,
  canvases
}: DataAvailabilityDisplayProps) {
  if (!selectedWorkspace) return null;

  return (
    <div className="bg-blue-50 p-3 rounded-lg text-sm">
      <h4 className="font-medium mb-1">Available Data:</h4>
      <p>• {personas.length} persona{personas.length !== 1 ? 's' : ''}</p>
      <p>• {canvases.length} problem canvas{canvases.length !== 1 ? 'es' : ''}</p>
      {personas.length === 0 && canvases.length === 0 && (
        <p className="text-amber-600 mt-1">
          ⚠️ No personas or canvases found. Create some first to generate documents.
        </p>
      )}
    </div>
  );
}
