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
    setGeneratedText(''); // Clear previous content
    
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptGeneration = async (): Promise<void> => {
      try {
        await generateDocument(params, (chunk) => {
          // Update text in real-time as chunks arrive
          setGeneratedText((prev) => prev + chunk);
        });
        
        toast({
          title: 'Success',
          description: `${params.documentType === 'prd' ? 'PRD' : 'User Stories'} generated successfully`,
        });
      } catch (error) {
        console.error('Document generation error:', error);
        
        let errorMessage = 'Failed to generate document';
        
        if (error instanceof Error) {
          errorMessage = error.message;
          
          // Retry on rate limit errors with exponential backoff
          if (errorMessage === 'RATE_LIMIT_ERROR' && retryCount < maxRetries) {
            retryCount++;
            const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
            
            console.log(`Retrying in ${delay}ms (attempt ${retryCount}/${maxRetries})...`);
            
            toast({
              title: 'Retrying...',
              description: `Rate limit hit. Retrying in ${delay / 1000} seconds...`,
            });
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return attemptGeneration(); // Recursive retry
          }
          
          // Replace internal error code with user-friendly message
          if (errorMessage === 'RATE_LIMIT_ERROR') {
            errorMessage = 'Too many requests. Please try again in a moment.';
          }
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        
        throw error;
      }
    };
    
    try {
      await attemptGeneration();
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
