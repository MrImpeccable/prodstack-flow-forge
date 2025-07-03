
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonaSelector } from './PersonaSelector';
import { CanvasSelector } from './CanvasSelector';
import { WorkspaceSelector } from './document-config/WorkspaceSelector';
import { DocumentTypeSelector } from './document-config/DocumentTypeSelector';
import { DataAvailabilityDisplay } from './document-config/DataAvailabilityDisplay';
import { ValidationDisplay } from './document-config/ValidationDisplay';
import { GenerateButton } from './document-config/GenerateButton';
import { canGenerate, getValidationMessage } from '@/utils/documentValidation';

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
  // Check if generation is possible using the utility function
  const canGenerateDocument: boolean = canGenerate(
    selectedWorkspace,
    documentType,
    selectedPersonas,
    selectedCanvas
  );

  // Get validation message using the utility function
  const validationMessage: string | null = getValidationMessage(
    selectedWorkspace,
    documentType,
    selectedPersonas,
    selectedCanvas
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <WorkspaceSelector
          workspaces={workspaces}
          selectedWorkspace={selectedWorkspace}
          onWorkspaceChange={onWorkspaceChange}
          loading={loading}
        />

        <DocumentTypeSelector
          documentType={documentType}
          onDocumentTypeChange={onDocumentTypeChange}
          loading={loading}
        />

        <DataAvailabilityDisplay
          selectedWorkspace={selectedWorkspace}
          personas={personas}
          canvases={canvases}
        />

        {/* Persona Selection */}
        {selectedWorkspace && personas.length > 0 && (
          <PersonaSelector
            personas={personas}
            selectedPersonas={selectedPersonas}
            onTogglePersona={onTogglePersona}
          />
        )}

        {/* Canvas Selection */}
        {selectedWorkspace && canvases.length > 0 && (
          <CanvasSelector
            canvases={canvases}
            selectedCanvas={selectedCanvas}
            onSelectCanvas={onSelectCanvas}
          />
        )}

        <ValidationDisplay message={validationMessage} />

        <GenerateButton
          documentType={documentType}
          loading={loading}
          canGenerate={canGenerateDocument}
          onGenerate={onGenerate}
        />
      </CardContent>
    </Card>
  );
}
