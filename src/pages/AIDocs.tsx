
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, FileText, Download, Wand2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const AIDocs = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [selectedCanvas, setSelectedCanvas] = useState<string>('');
  const [documentType, setDocumentType] = useState<'prd' | 'user_stories'>('prd');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');

  useEffect(() => {
    if (workspaceId) {
      fetchPersonas();
      fetchCanvases();
    }
  }, [workspaceId]);

  const fetchPersonas = async () => {
    try {
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (error) throw error;
      setPersonas(data || []);
    } catch (error) {
      console.error('Error fetching personas:', error);
    }
  };

  const fetchCanvases = async () => {
    try {
      const { data, error } = await supabase
        .from('problem_canvases')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (error) throw error;
      setCanvases(data || []);
    } catch (error) {
      console.error('Error fetching canvases:', error);
    }
  };

  const generateDocument = async () => {
    if (selectedPersonas.length === 0 && !selectedCanvas) {
      toast({
        title: 'Error',
        description: 'Please select at least one persona or canvas',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const selectedPersonaData = personas.filter(p => selectedPersonas.includes(p.id));
      const selectedCanvasData = canvases.find(c => c.id === selectedCanvas);

      const { data, error } = await supabase.functions.invoke('generate-documents', {
        body: {
          documentType,
          personas: selectedPersonaData,
          canvas: selectedCanvasData,
          workspaceId
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      setEditableContent(data.content);
      
      toast({
        title: 'Success',
        description: 'Document generated successfully',
      });
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate document',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDocument = async () => {
    if (!generatedContent) return;

    try {
      const { error } = await supabase
        .from('generated_documents')
        .insert([{
          workspace_id: workspaceId,
          title: `${documentType.toUpperCase()} - ${new Date().toLocaleDateString()}`,
          content: isEditing ? editableContent : generatedContent,
          document_type: documentType,
          source_personas: selectedPersonas,
          source_canvas: selectedCanvas || null
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Document saved successfully',
      });
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: 'Error',
        description: 'Failed to save document',
        variant: 'destructive',
      });
    }
  };

  const exportAsPDF = () => {
    const content = isEditing ? editableContent : generatedContent;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentType}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsMarkdown = () => {
    const content = isEditing ? editableContent : generatedContent;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentType}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const togglePersonaSelection = (personaId: string) => {
    setSelectedPersonas(prev => 
      prev.includes(personaId) 
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Docs Assistant
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Generate Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Document Type Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Document Type</label>
                  <div className="space-y-2">
                    <Button
                      variant={documentType === 'prd' ? 'default' : 'outline'}
                      onClick={() => setDocumentType('prd')}
                      className="w-full justify-start"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Product Requirements Document
                    </Button>
                    <Button
                      variant={documentType === 'user_stories' ? 'default' : 'outline'}
                      onClick={() => setDocumentType('user_stories')}
                      className="w-full justify-start"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      User Stories
                    </Button>
                  </div>
                </div>

                {/* Persona Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Personas</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {personas.map((persona) => (
                      <div
                        key={persona.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPersonas.includes(persona.id)
                            ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => togglePersonaSelection(persona.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{persona.name}</h4>
                            <p className="text-xs text-gray-600">{persona.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Canvas Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Canvas (Optional)</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {canvases.map((canvas) => (
                      <div
                        key={canvas.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedCanvas === canvas.id
                            ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedCanvas(selectedCanvas === canvas.id ? '' : canvas.id)}
                      >
                        <h4 className="font-medium text-sm">{canvas.name}</h4>
                        <p className="text-xs text-gray-600">
                          {canvas.pain_points?.length || 0} pain points, {canvas.opportunities?.length || 0} opportunities
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={generateDocument}
                  disabled={isGenerating}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Document'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Generated Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Generated Document</CardTitle>
                  {generatedContent && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {isEditing ? 'Preview' : 'Edit'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={saveDocument}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={exportAsMarkdown}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        MD
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={exportAsPDF}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        TXT
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="space-y-4">
                    {isEditing ? (
                      <Textarea
                        value={editableContent}
                        onChange={(e) => setEditableContent(e.target.value)}
                        className="min-h-[500px] font-mono text-sm"
                        placeholder="Edit your document here..."
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          {isEditing ? editableContent : generatedContent}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select personas and canvas, then click "Generate Document" to create AI-powered documentation.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIDocs;
