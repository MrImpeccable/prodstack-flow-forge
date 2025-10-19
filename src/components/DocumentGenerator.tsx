import React from 'react';
import { useDocumentGeneration } from '@/hooks/useDocumentGeneration';
import { useDocumentGenerate } from '@/hooks/useDocumentGenerate';
import { togglePersonaInArray } from '@/utils/personaSelection';
import { DocumentConfigPanel } from './DocumentConfigPanel';
import { GeneratedDocumentDisplay } from './GeneratedDocumentDisplay';
import { DocumentGeneratorHeader } from './document-generator/DocumentGeneratorHeader';

export function DocumentGenerator() {
  const {
    workspaces,
    personas,
    canvases,
    selectedWorkspace,
    selectedPersonas,
    selectedCanvas,
    documentType,
    setSelectedWorkspace,
    setSelectedPersonas,
    setSelectedCanvas,
    setDocumentType,
  } = useDocumentGeneration();

  const { loading, generatedText, handleGenerate, setGeneratedText } = useDocumentGenerate();

  const onGenerate = () => {
    handleGenerate({
      selectedWorkspace,
      documentType,
      selectedPersonas,
      selectedCanvas,
      workspaces,
      personas,
      canvases
    });
  };

  const togglePersonaSelection = (personaId: string) => {
    setSelectedPersonas(prev => togglePersonaInArray(prev, personaId));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <DocumentGeneratorHeader />

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
          onGenerate={onGenerate}
        />

        <GeneratedDocumentDisplay generatedText={generatedText} />
      </div>
    </div>
  );
}
