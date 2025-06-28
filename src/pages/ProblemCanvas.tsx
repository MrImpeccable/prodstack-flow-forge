import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X, Save, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CanvasItem {
  id: string;
  type: 'pain_point' | 'current_behavior' | 'opportunity';
  content: string;
}

interface Persona {
  id: string;
  name: string;
  role: string;
  goals: string[];
  frustrations: string[];
}

const ProblemCanvas = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [canvasName, setCanvasName] = useState('');
  const [painPoints, setPainPoints] = useState<string[]>(['']);
  const [currentBehaviors, setCurrentBehaviors] = useState<string[]>(['']);
  const [opportunities, setOpportunities] = useState<string[]>(['']);
  const [linkedPersonas, setLinkedPersonas] = useState<string[]>([]);
  const [availablePersonas, setAvailablePersonas] = useState<Persona[]>([]);
  const [existingCanvases, setExistingCanvases] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setAvailablePersonas(data || []);
    } catch (error) {
      console.error('Error fetching personas:', error);
    }
  };

  const fetchCanvases = async () => {
    try {
      const { data, error } = await supabase
        .from('problem_canvases')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExistingCanvases(data || []);
    } catch (error) {
      console.error('Error fetching canvases:', error);
    }
  };

  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const updateArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!canvasName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a canvas name',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const canvasData = {
        workspace_id: workspaceId,
        name: canvasName,
        pain_points: painPoints.filter(p => p.trim()),
        current_behaviors: currentBehaviors.filter(b => b.trim()),
        opportunities: opportunities.filter(o => o.trim()),
        canvas_data: {
          linked_personas: linkedPersonas
        }
      };

      if (editingId) {
        const { error } = await supabase
          .from('problem_canvases')
          .update(canvasData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('problem_canvases')
          .insert([canvasData]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Canvas ${editingId ? 'updated' : 'created'} successfully`,
      });

      // Reset form
      setCanvasName('');
      setPainPoints(['']);
      setCurrentBehaviors(['']);
      setOpportunities(['']);
      setLinkedPersonas([]);
      setEditingId(null);
      
      fetchCanvases();
    } catch (error) {
      console.error('Error saving canvas:', error);
      toast({
        title: 'Error',
        description: 'Failed to save canvas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const editCanvas = (canvas: any) => {
    setCanvasName(canvas.name);
    setPainPoints(canvas.pain_points?.length > 0 ? canvas.pain_points : ['']);
    setCurrentBehaviors(canvas.current_behaviors?.length > 0 ? canvas.current_behaviors : ['']);
    setOpportunities(canvas.opportunities?.length > 0 ? canvas.opportunities : ['']);
    setLinkedPersonas(canvas.canvas_data?.linked_personas || []);
    setEditingId(canvas.id);
  };

  const togglePersonaLink = (personaId: string) => {
    setLinkedPersonas(prev => 
      prev.includes(personaId) 
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    );
  };

  const renderArrayField = (
    items: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    label: string,
    placeholder: string,
    colorClass: string
  ) => (
    <div className={`p-4 rounded-lg border-2 ${colorClass}`}>
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <Textarea
            value={item}
            onChange={(e) => updateArrayItem(setter, index, e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-h-[60px]"
          />
          {items.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeArrayItem(setter, index)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addArrayItem(setter)}
        className="mt-1"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add {label.slice(0, -1)}
      </Button>
    </div>
  );

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
              Problem Space Canvas
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Canvas Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingId ? 'Edit Canvas' : 'Create Problem Space Canvas'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="canvasName">Canvas Name *</Label>
                  <Input
                    id="canvasName"
                    value={canvasName}
                    onChange={(e) => setCanvasName(e.target.value)}
                    placeholder="e.g., E-commerce User Journey"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {renderArrayField(
                    painPoints,
                    setPainPoints,
                    'Pain Points',
                    'What problems do users face?',
                    'border-red-200 bg-red-50 dark:bg-red-950/20'
                  )}
                  
                  {renderArrayField(
                    currentBehaviors,
                    setCurrentBehaviors,
                    'Current Behaviors',
                    'How do users currently handle this?',
                    'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
                  )}
                  
                  {renderArrayField(
                    opportunities,
                    setOpportunities,
                    'Opportunities',
                    'What opportunities exist?',
                    'border-green-200 bg-green-50 dark:bg-green-950/20'
                  )}
                </div>

                {/* Link Personas */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Link Personas</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {availablePersonas.map((persona) => (
                      <div
                        key={persona.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          linkedPersonas.includes(persona.id)
                            ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => togglePersonaLink(persona.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{persona.name}</h4>
                            <p className="text-sm text-gray-600">{persona.role}</p>
                          </div>
                          <Users className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSave} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : (editingId ? 'Update Canvas' : 'Save Canvas')}
                </Button>

                {editingId && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCanvasName('');
                      setPainPoints(['']);
                      setCurrentBehaviors(['']);
                      setOpportunities(['']);
                      setLinkedPersonas([]);
                      setEditingId(null);
                    }}
                    className="w-full"
                  >
                    Cancel Edit
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Existing Canvases */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Existing Canvases ({existingCanvases.length})
            </h3>
            <div className="space-y-4">
              {existingCanvases.map((canvas) => (
                <Card key={canvas.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{canvas.name}</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editCanvas(canvas)}
                      >
                        Edit
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {canvas.pain_points?.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-red-600">Pain Points:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {canvas.pain_points.slice(0, 2).map((point: string, i: number) => (
                              <Badge key={i} variant="destructive" className="text-xs">
                                {point.length > 20 ? `${point.substring(0, 20)}...` : point}
                              </Badge>
                            ))}
                            {canvas.pain_points.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{canvas.pain_points.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {canvas.opportunities?.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-green-600">Opportunities:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {canvas.opportunities.slice(0, 2).map((opp: string, i: number) => (
                              <Badge key={i} className="text-xs bg-green-100 text-green-800">
                                {opp.length > 20 ? `${opp.substring(0, 20)}...` : opp}
                              </Badge>
                            ))}
                            {canvas.opportunities.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{canvas.opportunities.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProblemCanvas;
