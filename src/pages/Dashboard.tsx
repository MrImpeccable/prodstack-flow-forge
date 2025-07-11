
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Users, LayoutGrid, FileText, Edit, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import UserDropdown from '@/components/UserDropdown';

interface Workspace {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const navigate = useNavigate();
  const { toast } = useToast();

  const getFirstName = (fullName: string | null) => {
    if (!fullName) return 'User';
    return fullName.split(' ')[0];
  };

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    }
  }, [user]);

  const fetchWorkspaces = async () => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkspaces(data || []);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workspaces',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async () => {
    if (!createForm.name.trim()) {
      toast({
        title: 'Error',
        description: 'Workspace name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert([{ 
          name: createForm.name.trim(), 
          description: createForm.description.trim() || null,
          user_id: user?.id 
        }])
        .select()
        .single();

      if (error) throw error;

      setWorkspaces([data, ...workspaces]);
      setShowCreateDialog(false);
      setCreateForm({ name: '', description: '' });
      
      toast({
        title: 'Success',
        description: 'Workspace created successfully',
      });
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: 'Error',
        description: 'Failed to create workspace',
        variant: 'destructive',
      });
    }
  };

  const startEditing = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setEditForm({ name: workspace.name, description: workspace.description || '' });
  };

  const saveEdit = async () => {
    if (!editingWorkspace || !editForm.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .update({ 
          name: editForm.name.trim(), 
          description: editForm.description.trim() || null 
        })
        .eq('id', editingWorkspace.id)
        .select()
        .single();

      if (error) throw error;

      setWorkspaces(workspaces.map(w => 
        w.id === editingWorkspace.id ? data : w
      ));
      
      setEditingWorkspace(null);
      toast({
        title: 'Success',
        description: 'Workspace updated successfully',
      });
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast({
        title: 'Error',
        description: 'Failed to update workspace',
        variant: 'destructive',
      });
    }
  };

  const cancelEdit = () => {
    setEditingWorkspace(null);
    setEditForm({ name: '', description: '' });
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-6 pb-4 pl-4 sm:pt-4 sm:pb-4 sm:pl-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button 
                  onClick={handleLogoClick}
                  className="flex items-center space-x-4 hover:opacity-80 transition-opacity self-start"
                >
                  <img 
                    src="/lovable-uploads/3b4d22fa-d92b-49a4-9d92-263e24102342.png" 
                    alt="ProdStack Logo" 
                    className="h-auto w-[100px] sm:w-[80px]"
                  />
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    <span className="text-red-600">Prod</span>Stack
                  </h1>
                </button>
              </div>
              <div className="self-start sm:self-center">
                <UserDropdown />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8 pl-4 sm:pl-0">
          <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-white mb-2">
            Welcome back, {getFirstName(profile?.full_name)}
          </h2>
        </div>

        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-12">
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">Your Workspaces</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Manage your product discovery projects</p>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 shadow-lg text-white font-semibold px-6 py-3">
                  <Plus className="h-5 w-5 mr-2" />
                  New Workspace
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-xl text-gray-900 dark:text-white">Create New Workspace</DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    Create a new workspace to organize your product discovery work.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-900 dark:text-white">Name *</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter workspace name..."
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-gray-900 dark:text-white">Description</Label>
                    <Textarea
                      id="description"
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter workspace description..."
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createWorkspace} className="bg-red-600 hover:bg-red-700">
                    Create Workspace
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {workspaces.length === 0 ? (
            <Card className="text-center py-20 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent>
                <div className="text-gray-500 dark:text-gray-400 mb-8">
                  <FileText className="h-20 w-20 mx-auto mb-6 text-gray-400 dark:text-gray-500" />
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">No workspaces yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-lg">
                    Create your first workspace to start building user personas and problem canvases for your product discovery.
                  </p>
                </div>
                <Button 
                  onClick={() => setShowCreateDialog(true)} 
                  className="bg-red-600 hover:bg-red-700 shadow-lg text-white font-semibold px-8 py-3"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Workspace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {workspaces.map((workspace) => (
                <Card 
                  key={workspace.id} 
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transition-all duration-300 shadow-lg hover:shadow-xl group"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {editingWorkspace?.id === workspace.id ? (
                          <div className="space-y-3">
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold"
                              placeholder="Workspace name"
                            />
                            <Textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm"
                              placeholder="Workspace description"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={saveEdit} className="bg-green-600 hover:bg-green-700">
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <CardTitle className="text-xl text-gray-900 dark:text-white truncate mb-2 group-hover:text-red-600 transition-colors">
                              {workspace.name}
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                              {workspace.description || 'No description provided'}
                            </CardDescription>
                          </>
                        )}
                      </div>
                      {editingWorkspace?.id !== workspace.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(workspace)}
                          className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  {editingWorkspace?.id !== workspace.id && (
                    <CardContent>
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                        <span>Created {new Date(workspace.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/workspace/${workspace.id}/persona-builder`)}
                          className="w-full justify-start text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 hover:text-red-700 dark:hover:text-red-400 transition-all"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Build Personas
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/workspace/${workspace.id}/problem-canvas`)}
                          className="w-full justify-start text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 hover:text-red-700 dark:hover:text-red-400 transition-all"
                        >
                          <LayoutGrid className="h-4 w-4 mr-2" />
                          Problem Canvas
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/workspace/${workspace.id}/ai-docs`)}
                          className="w-full justify-start text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 hover:text-red-700 dark:hover:text-red-400 transition-all"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          AI Documents
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
