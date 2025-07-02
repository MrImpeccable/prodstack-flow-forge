
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

    // Validate required fields
    if (!selectedWorkspace) {
      toast({
        title: 'Missing Workspace',
        description: 'Please select a workspace',
        variant: 'destructive',
      });
      return;
    }

    if (selectedPersonas.length === 0 && !selectedCanvas) {
      toast({
        title: 'Missing Data',
        description: 'Please select at least one persona or canvas',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    // Debug logging
    const requestData = {
      workspaceId: selectedWorkspace,
      documentType: documentType,
      selectedPersonas: selectedPersonas,
      selectedCanvas: selectedCanvas || null
    };
    
    console.log('Sending request to generate-documents function:', requestData);
    console.log('Selected workspace:', selectedWorkspace);
    console.log('Selected personas:', selectedPersonas);
    console.log('Selected canvas:', selectedCanvas);
    console.log('Document type:', documentType);

    try {
      // Use proper Supabase function invocation with correct function name (plural)
      const { data, error } = await supabase.functions.invoke('generate-documents', {
        body: requestData
      });

      console.log('Edge function response:', data);
      console.log('Edge function error:', error);

      if (error) {
        console.error('Supabase function error:', error);
        
        // Show specific error messages
        let errorMessage = 'Failed to generate document';
        
        if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.details) {
          errorMessage = error.details;
        }

        toast({
          title: 'Generation Failed',
          description: errorMessage,
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
        description: 'Document generated successfully',
      });

    } catch (error) {
      console.error('Error generating document:', error);
      
      // Handle different types of errors
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
