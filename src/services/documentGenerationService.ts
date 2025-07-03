
import { supabase } from '@/integrations/supabase/client';
import { validateDocumentRequest } from '@/utils/documentValidation';

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

interface GenerateDocumentParams {
  selectedWorkspace: string;
  documentType: 'prd' | 'user_story';
  selectedPersonas: string[];
  selectedCanvas: string;
  workspaces: Workspace[];
  personas: Persona[];
  canvases: Canvas[];
}

export async function generateDocument({
  selectedWorkspace,
  documentType,
  selectedPersonas,
  selectedCanvas,
  workspaces,
  personas,
  canvases
}: GenerateDocumentParams) {
  // Check authentication first
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication Required: Please sign in to generate documents');
  }

  // Validate request
  const validation = validateDocumentRequest({
    selectedWorkspace,
    documentType,
    selectedPersonas,
    selectedCanvas,
    workspaces,
    personas,
    canvases
  });
  
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Prepare request data
  const requestData = {
    workspaceId: selectedWorkspace,
    documentType: documentType,
    selectedPersonas: selectedPersonas,
    selectedCanvas: selectedCanvas || null
  };
  
  // Debug logging
  console.log('=== DOCUMENT GENERATION REQUEST ===');
  console.log('User authenticated:', !!user);
  console.log('Request payload:', JSON.stringify(requestData, null, 2));
  console.log('Workspace details:', workspaces.find(w => w.id === selectedWorkspace));
  console.log('Selected personas details:', personas.filter(p => selectedPersonas.includes(p.id)));
  console.log('Selected canvas details:', selectedCanvas ? canvases.find(c => c.id === selectedCanvas) : null);
  console.log('====================================');

  const { data, error } = await supabase.functions.invoke('generate-documents', {
    body: requestData
  });

  console.log('=== EDGE FUNCTION RESPONSE ===');
  console.log('Response data:', data);
  console.log('Response error:', error);
  console.log('==============================');

  if (error) {
    console.error('Supabase function error details:', error);
    
    let errorMessage = 'Failed to generate document';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error.details) {
      errorMessage = error.details;
    }

    // Check for specific error types
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      throw new Error('The requested data was not found. Please check your selections.');
    } else if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      throw new Error('Authentication failed. Please sign in again.');
    } else if (errorMessage.includes('validation') || errorMessage.includes('400')) {
      throw new Error('Invalid request data. Please check your inputs.');
    } else if (errorMessage.includes('API key') || errorMessage.includes('503')) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    }

    throw new Error(errorMessage);
  }

  if (!data) {
    console.error('No data received from edge function');
    throw new Error('No response received from AI service');
  }

  if (!data.success) {
    console.error('Edge function returned unsuccessful response:', data);
    throw new Error(data.error || 'Unknown error occurred');
  }

  if (!data.document || !data.document.content) {
    console.error('No document content in response:', data);
    throw new Error('No content received from AI service');
  }

  console.log('Successfully generated document:', data.document);
  return data.document.content;
}
