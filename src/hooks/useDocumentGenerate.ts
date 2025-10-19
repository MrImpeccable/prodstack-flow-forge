import { useState } from 'react';
import { generateDocument } from '@/services/documentGenerationService';
import { useToast } from '@/hooks/use-toast';

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

interface UseDocumentGenerateParams {
  selectedWorkspace: string;
  documentType: 'prd' | 'user_story';
  selectedPersonas: string[];
  selectedCanvas: string;
  workspaces: Workspace[];
  personas: Persona[];
  canvases: Canvas[];
}

export function useDocumentGenerate() {
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const { toast } = useToast();

  const handleGenerate = async (params: UseDocumentGenerateParams) => {
    setLoading(true);
    
    try {
      const content = await generateDocument(params);
      setGeneratedText(content);
      
      toast({
        title: 'Success',
        description: `${params.documentType === 'prd' ? 'PRD' : 'User Stories'} generated successfully`,
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

  return {
    loading,
    generatedText,
    handleGenerate,
    setGeneratedText
  };
}
