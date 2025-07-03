
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DocumentConfigPanel } from './DocumentConfigPanel';
import { GeneratedDocumentDisplay } from './GeneratedDocumentDisplay';

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

interface Workspace {
  id: string;
  name: string;
  description: string | null;
}

export function DocumentGenerator() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [selectedCanvas, setSelectedCanvas] = useState<string>('');
  const [documentType, setDocumentType] = useState<'prd' | 'user_story'>('prd');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchPersonas();
      fetchCanvases();
    }
  }, [selectedWorkspace]);

  const fetchWorkspaces = async () => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkspaces(data || []);
      
      if (data && data.length > 0) {
        setSelectedWorkspace(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch workspaces',
        variant: 'destructive',
      });
    }
  };

  const fetchPersonas = async () => {
    if (!selectedWorkspace) return;

    try {
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('workspace_id', selectedWorkspace);

      if (error) throw error;
      setPersonas(data || []);
    } catch (error) {
      console.error('Error fetching personas:', error);
    }
  };

  const fetchCanvases = async () => {
    if (!selectedWorkspace) return;

    try {
      const { data, error } = await supabase
        .from('problem_canvases')
        .select('*')
        .eq('workspace_id', selectedWorkspace);

      if (error) throw error;
      setCanvases(data || []);
    } catch (error) {
      console.error('Error fetching canvases:', error);
    }
  };

  const validateRequest = () => {
    // Check authentication
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
  };

  const handleGenerate = async () => {
    // Check authentication first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to generate documents',
        variant: 'destructive',
      });
      return;
    }

    // Validate request
    const validation = validateRequest();
    if (!validation.valid) {
      toast({
        title: 'Validation Error',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
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

    try {
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
        let errorDetails = '';
        
        if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.details) {
          errorMessage = error.details;
        }

        // Check for specific error types
        if (errorMessage.includes('not found') || errorMessage.includes('404')) {
          errorDetails = 'The requested data was not found. Please check your selections.';
        } else if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
          errorDetails = 'Authentication failed. Please sign in again.';
        } else if (errorMessage.includes('validation') || errorMessage.includes('400')) {
          errorDetails = 'Invalid request data. Please check your inputs.';
        } else if (errorMessage.includes('API key') || errorMessage.includes('503')) {
          errorDetails = 'AI service is temporarily unavailable. Please try again later.';
        }

        toast({
          title: 'Generation Failed',
          description: errorDetails || errorMessage,
          variant: 'destructive',
        });
        return;
      }

      if (!data) {
        console.error('No data received from edge function');
        toast({
          title: 'Generation Failed',
          description: 'No response received from AI service',
          variant: 'destructive',
        });
        return;
      }

      if (!data.success) {
        console.error('Edge function returned unsuccessful response:', data);
        toast({
          title: 'Generation Failed',
          description: data.error || 'Unknown error occurred',
          variant: 'destructive',
        });
        return;
      }

      if (!data.document || !data.document.content) {
        console.error('No document content in response:', data);
        toast({
          title: 'Generation Failed',
          description: 'No content received from AI service',
          variant: 'destructive',
        });
        return;
      }

      console.log('Successfully generated document:', data.document);
      setGeneratedText(data.document.content);
      
      toast({
        title: 'Success',
        description: `${documentType === 'prd' ? 'PRD' : 'User Stories'} generated successfully`,
      });

    } catch (error) {
      console.error('Unexpected error during document generation:', error);
      
      let errorMessage = 'Failed to generate document';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePersonaSelection = (personaId: string) => {
    setSelectedPersonas(prev => 
      prev.includes(personaId) 
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Document Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate PRDs and User Stories using AI powered by Gemini
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DocumentConfigPanel
          workspaces={workspaces}
          personas={personas}
          canvases={canvases}
          selectedWorkspace={selectedWorkspace}
          selectedPersonas={selectedPersonas}
          selectedCanvas={selectedCanvas}
          documentType={documentType}
          loading={loading}
          onWorkspaceChange={setSelectedWorkspace}
          onDocumentTypeChange={setDocumentType}
          onTogglePersona={togglePersonaSelection}
          onSelectCanvas={setSelectedCanvas}
          onGenerate={handleGenerate}
        />

        <GeneratedDocumentDisplay generatedText={generatedText} />
      </div>
    </div>
  );
}
