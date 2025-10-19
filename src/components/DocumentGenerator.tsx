import React from 'react';
import { useDocumentGeneration } from '@/hooks/useDocumentGeneration';
import { generateDocument } from '@/services/documentGenerationService';
import { DocumentConfigPanel } from './DocumentConfigPanel';
import { GeneratedDocumentDisplay } from './GeneratedDocumentDisplay';

export function DocumentGenerator() {
  const {
    workspaces,
    personas,
    canvases,
    selectedWorkspace,
    selectedPersonas,
    selectedCanvas,
    documentType,
    generatedText,
    loading,
    setSelectedWorkspace,
    setSelectedPersonas,
    setSelectedCanvas,
    setDocumentType,
    setGeneratedText,
    setLoading,
    toast
  } = useDocumentGeneration();

  const handleGenerate = async () => {
    setLoading(true);
    
    try {
      const content = await generateDocument({
        selectedWorkspace,
        documentType,
        selectedPersonas,
        selectedCanvas,
        workspaces,
        personas,
        canvases
      });

      setGeneratedText(content);
      
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
