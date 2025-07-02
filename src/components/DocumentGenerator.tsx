
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Wand2, FileText, Loader2 } from 'lucide-react';
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
    if (!selectedWorkspace || (selectedPersonas.length === 0 && !selectedCanvas)) {
      toast({
        title: 'Error',
        description: 'Please select at least one persona or canvas',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-documents', {
        body: {
          workspaceId: selectedWorkspace,
          documentType: documentType,
          selectedPersonas: selectedPersonas,
          selectedCanvas: selectedCanvas || null
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate document');
      }

      if (!data || !data.document) {
        throw new Error('No content received from AI service');
      }

      setGeneratedText(data.document.content);
      
      toast({
        title: 'Success',
        description: 'Document generated successfully',
      });
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate document',
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
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Document Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Workspace Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Workspace</label>
              <select
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Choose a workspace...</option>
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </div>

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
                  variant={documentType === 'user_story' ? 'default' : 'outline'}
                  onClick={() => setDocumentType('user_story')}
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  User Stories
                </Button>
              </div>
            </div>

            {/* Persona Selection */}
            {personas.length > 0 && (
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
                        {selectedPersonas.includes(persona.id) && (
                          <Badge className="bg-red-500">Selected</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Canvas Selection */}
            {canvases.length > 0 && (
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
            )}

            <Button
              onClick={handleGenerate}
              disabled={loading || !selectedWorkspace || (selectedPersonas.length === 0 && !selectedCanvas)}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Document
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Content */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Document</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedText ? (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <Textarea
                    value={generatedText}
                    readOnly
                    className="min-h-[500px] font-mono text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure your settings and click "Generate Document" to create AI-powered documentation.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
