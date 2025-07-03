
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Wand2, Loader2, AlertCircle } from 'lucide-react';
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
  // Check if generation is possible
  const canGenerate = () => {
    if (!selectedWorkspace) return false;
    
    if (documentType === 'user_story') {
      return selectedPersonas.length > 0;
    } else if (documentType === 'prd') {
      return selectedPersonas.length > 0 || selectedCanvas;
    }
    
    return false;
  };

  // Get validation message
  const getValidationMessage = () => {
    if (!selectedWorkspace) return 'Please select a workspace';
    
    if (documentType === 'user_story') {
      if (selectedPersonas.length === 0) {
        return 'User story generation requires at least one persona';
      }
    } else if (documentType === 'prd') {
      if (selectedPersonas.length === 0 && !selectedCanvas) {
        return 'PRD generation requires at least one persona or problem canvas';
      }
    }
    
    return null;
  };

  const validationMessage = getValidationMessage();

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
            disabled={loading}
          >
            <option value="">Choose a workspace...</option>
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
          {selectedWorkspace && (
            <p className="text-xs text-gray-500 mt-1">
              Selected: {workspaces.find(w => w.id === selectedWorkspace)?.name}
            </p>
          )}
        </div>

        {/* Document Type Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Document Type</label>
          <div className="space-y-2">
            <Button
              variant={documentType === 'prd' ? 'default' : 'outline'}
              onClick={() => onDocumentTypeChange('prd')}
              className="w-full justify-start"
              disabled={loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Product Requirements Document
            </Button>
            <Button
              variant={documentType === 'user_story' ? 'default' : 'outline'}
              onClick={() => onDocumentTypeChange('user_story')}
              className="w-full justify-start"
              disabled={loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              User Stories
            </Button>
          </div>
          
          {/* Show requirements for each document type */}
          <div className="mt-2 text-xs text-gray-600">
            {documentType === 'prd' && (
              <p>• Requires: At least one persona OR problem canvas</p>
            )}
            {documentType === 'user_story' && (
              <p>• Requires: At least one persona (canvas optional)</p>
            )}
          </div>
        </div>

        {/* Show data availability */}
        {selectedWorkspace && (
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
        )}

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

        {/* Validation Message */}
        {validationMessage && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <p className="text-sm text-amber-700">{validationMessage}</p>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={onGenerate}
          disabled={loading || !canGenerate()}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate {documentType === 'prd' ? 'PRD' : 'User Stories'}
            </>
          )}
        </Button>

        {/* Generation Status */}
        {loading && (
          <div className="text-center text-sm text-gray-600">
            <p>Processing your request...</p>
            <p className="text-xs mt-1">This may take 30-60 seconds</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
