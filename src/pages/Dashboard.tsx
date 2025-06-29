
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, LayoutGrid, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Workspace {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    const name = prompt('Enter workspace name:');
    if (!name) return;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert([{ name, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      setWorkspaces([data, ...workspaces]);
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/lovable-uploads/3b4d22fa-d92b-49a4-9d92-263e24102342.png" 
                alt="ProdStack Logo" 
                className="h-auto w-[140px] md:w-[100px] sm:w-[80px]"
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                <span className="text-red-600">Prod</span>Stack
              </h1>
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Welcome, {user?.email}
              </span>
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Your Workspaces</h2>
            <Button onClick={createWorkspace} className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              New Workspace
            </Button>
          </div>

          {workspaces.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No workspaces yet</h3>
                  <p>Create your first workspace to start building user personas and problem canvases.</p>
                </div>
                <Button onClick={createWorkspace} className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Workspace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <Card key={workspace.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {workspace.name}
                      <FileText className="h-5 w-5 text-gray-400" />
                    </CardTitle>
                    <CardDescription>
                      {workspace.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span>Created {new Date(workspace.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/workspace/${workspace.id}/persona-builder`)}
                        className="text-xs"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        Personas
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/workspace/${workspace.id}/problem-canvas`)}
                        className="text-xs"
                      >
                        <LayoutGrid className="h-3 w-3 mr-1" />
                        Canvas
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/workspace/${workspace.id}/ai-docs`)}
                        className="text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        AI Docs
                      </Button>
                    </div>
                  </CardContent>
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
