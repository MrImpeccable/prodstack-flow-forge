import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X, Save, Download, FileText, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase-helpers';
import { useToast } from '@/hooks/use-toast';
import { generatePersonaWordDoc, downloadFile } from '@/utils/documentExports';
import { exportPersonaAsModernPNG } from '@/utils/modernPersonaExport';
import { usePersonaAvatar } from '@/hooks/usePersonaAvatar';

interface Persona {
  id?: string;
  name: string;
  age: number | null;
  role: string;
  bio: string;
  goals: string[];
  frustrations: string[];
  tools: string[];
  avatar_url?: string;
}

const PersonaBuilder = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { generateAvatar, isGenerating } = usePersonaAvatar();
  
  const [persona, setPersona] = useState<Persona>({
    name: '',
    age: null,
    role: '',
    bio: '',
    goals: [''],
    frustrations: [''],
    tools: [''],
  });
  
  const [existingPersonas, setExistingPersonas] = useState<Persona[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      fetchPersonas();
    }
  }, [workspaceId]);

  const fetchPersonas = async () => {
    try {
      const { data, error } = await fromTable('personas')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExistingPersonas(data || []);
    } catch (error) {
      console.error('Error fetching personas:', error);
      toast({
        title: 'Error',
        description: 'Failed to load personas',
        variant: 'destructive',
      });
    }
  };

  const addArrayItem = (field: keyof Pick<Persona, 'goals' | 'frustrations' | 'tools'>) => {
    setPersona(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayItem = (field: keyof Pick<Persona, 'goals' | 'frustrations' | 'tools'>, index: number, value: string) => {
    setPersona(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayItem = (field: keyof Pick<Persona, 'goals' | 'frustrations' | 'tools'>, index: number) => {
    setPersona(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!persona.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a persona name',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const personaData = {
        workspace_id: workspaceId,
        name: persona.name,
        age: persona.age,
        role: persona.role,
        bio: persona.bio,
        goals: persona.goals.filter(g => g.trim()),
        frustrations: persona.frustrations.filter(f => f.trim()),
        tools: persona.tools.filter(t => t.trim()),
      };

      let newPersonaId: string | null = null;

      if (editingId) {
        const { error } = await fromTable('personas')
          .update(personaData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { data: insertData, error } = await fromTable('personas')
          .insert([personaData])
          .select('id')
          .single();

        if (error) throw error;
        newPersonaId = insertData?.id;
      }

      toast({
        title: 'Success',
        description: `Persona ${editingId ? 'updated' : 'created'} successfully`,
      });

      // Generate AI avatar for new personas
      if (newPersonaId && !editingId) {
        generateAvatar(newPersonaId).then(() => {
          fetchPersonas(); // Refresh to show the new avatar
        });
      }

      // Reset form
      setPersona({
        name: '',
        age: null,
        role: '',
        bio: '',
        goals: [''],
        frustrations: [''],
        tools: [''],
      });
      setEditingId(null);
      
      // Refresh personas list
      fetchPersonas();
    } catch (error) {
      console.error('Error saving persona:', error);
      toast({
        title: 'Error',
        description: 'Failed to save persona',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const editPersona = (personaToEdit: Persona) => {
    setPersona({
      name: personaToEdit.name,
      age: personaToEdit.age,
      role: personaToEdit.role,
      bio: personaToEdit.bio,
      goals: personaToEdit.goals.length > 0 ? personaToEdit.goals : [''],
      frustrations: personaToEdit.frustrations.length > 0 ? personaToEdit.frustrations : [''],
      tools: personaToEdit.tools.length > 0 ? personaToEdit.tools : [''],
    });
    setEditingId(personaToEdit.id || null);
  };

  const exportPersonaAsWord = async (personaToExport: Persona) => {
    try {
      const blob = await generatePersonaWordDoc(personaToExport);
      downloadFile(blob, `persona-${personaToExport.name.replace(/\s+/g, '-').toLowerCase()}.docx`);
      
      toast({
        title: 'Success',
        description: 'Persona exported as Word document successfully',
      });
    } catch (error) {
      console.error('Error exporting persona as Word:', error);
      toast({
        title: 'Error',
        description: 'Failed to export persona as Word document',
        variant: 'destructive',
      });
    }
  };

  const exportPersonaAsModernImage = async (personaToExport: Persona & { id?: string }) => {
    try {
      await exportPersonaAsModernPNG(personaToExport);
      toast({
        title: 'Success',
        description: 'Persona exported as modern PNG successfully',
      });
    } catch (error) {
      console.error('Error exporting persona as modern PNG:', error);
      toast({
        title: 'Error',
        description: 'Failed to export persona as modern PNG',
        variant: 'destructive',
      });
    }
  };

  const exportPersonaAsImage = (personaToExport: Persona) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('PERSONA CARD', 50, 80);

    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#dc2626';
    ctx.fillText(personaToExport.name, 50, 130);

    ctx.font = '20px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(`${personaToExport.role || 'Role not specified'} | Age: ${personaToExport.age || 'Not specified'}`, 50, 160);

    if (personaToExport.bio) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#374151';
      const bioLines = personaToExport.bio.match(/.{1,80}(\s|$)/g) || [personaToExport.bio];
      bioLines.forEach((line, index) => {
        ctx.fillText(line.trim(), 50, 200 + (index * 20));
      });
    }

    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#059669';
    ctx.fillText('Goals:', 50, 280);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#374151';
    personaToExport.goals.slice(0, 4).forEach((goal, index) => {
      ctx.fillText(`• ${goal.substring(0, 60)}${goal.length > 60 ? '...' : ''}`, 70, 305 + (index * 20));
    });

    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#dc2626';
    ctx.fillText('Frustrations:', 50, 410);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#374151';
    personaToExport.frustrations.slice(0, 4).forEach((frustration, index) => {
      ctx.fillText(`• ${frustration.substring(0, 60)}${frustration.length > 60 ? '...' : ''}`, 70, 435 + (index * 20));
    });

    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#7c3aed';
    ctx.fillText('Tools:', 50, 540);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#374151';
    const toolsText = personaToExport.tools.join(', ');
    ctx.fillText(toolsText.substring(0, 80) + (toolsText.length > 80 ? '...' : ''), 70, 565);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `persona-${personaToExport.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: 'Success',
          description: 'Persona exported as image successfully',
        });
      }
    }, 'image/png');
  };

  const renderArrayField = (field: keyof Pick<Persona, 'goals' | 'frustrations' | 'tools'>, label: string, placeholder: string) => (
    <div>
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      {persona[field].map((item, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <Input
            value={item}
            onChange={(e) => updateArrayItem(field, index, e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
          {persona[field].length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeArrayItem(field, index)}
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
        onClick={() => addArrayItem(field)}
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
              Persona Builder
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Persona Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingId ? 'Edit Persona' : 'Create New Persona'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={persona.name}
                  onChange={(e) => setPersona(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Sarah Johnson"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={persona.age || ''}
                    onChange={(e) => setPersona(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : null }))}
                    placeholder="32"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={persona.role}
                    onChange={(e) => setPersona(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Product Manager"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={persona.bio}
                  onChange={(e) => setPersona(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Brief description of the persona..."
                  rows={3}
                />
              </div>

              {renderArrayField('goals', 'Goals', 'What does this persona want to achieve?')}
              {renderArrayField('frustrations', 'Frustrations', 'What problems does this persona face?')}
              {renderArrayField('tools', 'Tools', 'What tools does this persona use?')}

              <Button onClick={handleSave} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : (editingId ? 'Update Persona' : 'Save Persona')}
              </Button>

              {editingId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setPersona({
                      name: '',
                      age: null,
                      role: '',
                      bio: '',
                      goals: [''],
                      frustrations: [''],
                      tools: [''],
                    });
                    setEditingId(null);
                  }}
                  className="w-full"
                >
                  Cancel Edit
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Existing Personas */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Existing Personas ({existingPersonas.length})
            </h3>
            <div className="space-y-4">
              {existingPersonas.map((p) => (
                <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{p.name}</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editPersona(p)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportPersonaAsWord(p)}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Word
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportPersonaAsModernImage(p)}
                          title="Export as modern professional PNG"
                        >
                          <Image className="h-3 w-3 mr-1" />
                          PNG
                        </Button>
                      </div>
                    </div>
                    {p.role && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{p.role}</p>}
                    {p.age && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Age: {p.age}</p>}
                    {p.bio && <p className="text-sm mb-3">{p.bio}</p>}
                    
                    <div className="space-y-2">
                      {p.goals.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">Goals:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.goals.map((goal, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {goal}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {p.frustrations.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-red-600 dark:text-red-400">Frustrations:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.frustrations.map((frustration, i) => (
                              <Badge key={i} variant="destructive" className="text-xs">
                                {frustration}
                              </Badge>
                            ))}
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

export default PersonaBuilder;
