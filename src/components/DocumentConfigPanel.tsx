
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Wand2, Loader2 } from 'lucide-react';
import { PersonaSelector } from './PersonaSelector';
import { CanvasSelector } from './CanvasSelector';

interface Workspace {
  id: string;
  name: string;
  description: string | null;
}

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

interface DocumentConfigPanelProps {
  workspaces: Workspace[];
  personas: Persona[];
  canvases: Canvas[];
  selectedWorkspace: string;
  selectedPersonas: string[];
  selectedCanvas: string;
  documentType: 'prd' | 'user_story';
  loading: boolean;
  onWorkspaceChange: (workspaceId: string) => void;
  onDocumentTypeChange: (type: 'prd' | 'user_story') => void;
  onTogglePersona: (personaId: string) => void;
  onSelectCanvas: (canvasId: string) => void;
  onGenerate: () => void;
}

export function DocumentConfigPanel({
  workspaces,
  personas,
  canvases,
  selectedWorkspace,
  selectedPersonas,
  selectedCanvas,
  documentType,
  loading,
  onWorkspaceChange,
  onDocumentTypeChange,
  onTogglePersona,
  onSelectCanvas,
  onGenerate
}: DocumentConfigPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Workspace Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Select Workspace</label>
          <select
            value={selectedWorkspace}
            onChange={(e) => onWorkspaceChange(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Choose a workspace...</option>
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>

        {/* Document Type Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Document Type</label>
          <div className="space-y-2">
            <Button
              variant={documentType === 'prd' ? 'default' : 'outline'}
              onClick={() => onDocumentTypeChange('prd')}
              className="w-full justify-start"
            >
              <FileText className="h-4 w-4 mr-2" />
              Product Requirements Document
            </Button>
            <Button
              variant={documentType === 'user_story' ? 'default' : 'outline'}
              onClick={() => onDocumentTypeChange('user_story')}
              className="w-full justify-start"
            >
              <FileText className="h-4 w-4 mr-2" />
              User Stories
            </Button>
          </div>
        </div>

        {/* Persona Selection */}
        <PersonaSelector
          personas={personas}
          selectedPersonas={selectedPersonas}
          onTogglePersona={onTogglePersona}
        />

        {/* Canvas Selection */}
        <CanvasSelector
          canvases={canvases}
          selectedCanvas={selectedCanvas}
          onSelectCanvas={onSelectCanvas}
        />

        <Button
          onClick={onGenerate}
          disabled={loading || !selectedWorkspace || (selectedPersonas.length === 0 && !selectedCanvas)}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
