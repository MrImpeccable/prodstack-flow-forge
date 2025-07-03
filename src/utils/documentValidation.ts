
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

interface ValidationParams {
  selectedWorkspace: string;
  documentType: 'prd' | 'user_story';
  selectedPersonas: string[];
  selectedCanvas: string;
  workspaces: Workspace[];
  personas: Persona[];
  canvases: Canvas[];
}

export function validateDocumentRequest({
  selectedWorkspace,
  documentType,
  selectedPersonas,
  selectedCanvas,
  workspaces,
  personas,
  canvases
}: ValidationParams) {
  // Check workspace selection
  if (!selectedWorkspace) {
    return { valid: false, error: 'Please select a workspace' };
  }

  // Validate workspace exists
  const workspace = workspaces.find(w => w.id === selectedWorkspace);
  if (!workspace) {
    return { valid: false, error: 'Selected workspace is invalid' };
  }

  // Document type specific validation
  if (documentType === 'user_story') {
    if (selectedPersonas.length === 0) {
      return { valid: false, error: 'User story generation requires at least one persona' };
    }
  } else if (documentType === 'prd') {
    if (selectedPersonas.length === 0 && !selectedCanvas) {
      return { valid: false, error: 'PRD generation requires at least one persona or problem canvas' };
    }
  }

  // Validate selected personas exist
  if (selectedPersonas.length > 0) {
    const validPersonas = selectedPersonas.filter(personaId => 
      personas.some(p => p.id === personaId)
    );
    if (validPersonas.length !== selectedPersonas.length) {
      return { valid: false, error: 'Some selected personas are invalid' };
    }
  }

  // Validate selected canvas exists
  if (selectedCanvas) {
    const canvas = canvases.find(c => c.id === selectedCanvas);
    if (!canvas) {
      return { valid: false, error: 'Selected canvas is invalid' };
    }
  }

  return { valid: true };
}

export function getValidationMessage(
  selectedWorkspace: string,
  documentType: 'prd' | 'user_story',
  selectedPersonas: string[],
  selectedCanvas: string
) {
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
}

export function canGenerate(
  selectedWorkspace: string,
  documentType: 'prd' | 'user_story',
  selectedPersonas: string[],
  selectedCanvas: string
) {
  if (!selectedWorkspace) return false;
  
  if (documentType === 'user_story') {
    return selectedPersonas.length > 0;
  } else if (documentType === 'prd') {
    return selectedPersonas.length > 0 || selectedCanvas;
  }
  
  return false;
}
