
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

export async function generateDocument(
  params: GenerateDocumentParams,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const {
    selectedWorkspace,
    documentType,
    selectedPersonas,
    selectedCanvas,
    workspaces,
    personas,
    canvases
  } = params;
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

  // Use fetch for streaming support
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Authentication Required: Please sign in to generate documents');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-document-ai`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(requestData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Edge function error:', errorData);

    // Check for specific error codes
    if (errorData.code === 'RATE_LIMIT' || response.status === 429) {
      throw new Error('RATE_LIMIT_ERROR');
    }
    if (errorData.code === 'PAYMENT_REQUIRED' || response.status === 402) {
      throw new Error('AI usage limit reached. Please check your workspace credits.');
    }

    throw new Error(errorData.error || 'Failed to generate document');
  }

  // Handle streaming response
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  if (!reader) {
    throw new Error('No response body received');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              // Call the callback with each chunk
              if (onChunk) {
                onChunk(parsed.content);
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error('Streaming error:', error);
    throw new Error('Failed to process streaming response');
  }

  if (!fullContent) {
    throw new Error('No content received from AI service');
  }

  console.log('Document generated successfully, length:', fullContent.length);
  return fullContent;
}
