
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase-helpers';
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

export function useDocumentGeneration() {
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
      const { data, error } = await fromTable('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const list = ((data as any) || []) as Workspace[];
      setWorkspaces(list);
      if (list.length > 0) {
        setSelectedWorkspace(list[0].id);
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
      const { data, error } = await fromTable('personas')
        .select('*')
        .eq('workspace_id', selectedWorkspace);

      if (error) throw error;
      setPersonas(((data as any) || []) as Persona[]);
    } catch (error) {
      console.error('Error fetching personas:', error);
    }
  };

  const fetchCanvases = async () => {
    if (!selectedWorkspace) return;

    try {
      const { data, error } = await fromTable('problem_canvases')
        .select('*')
        .eq('workspace_id', selectedWorkspace);

      if (error) throw error;
      setCanvases(((data as any) || []) as Canvas[]);
    } catch (error) {
      console.error('Error fetching canvases:', error);
    }
  };

  return {
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
  };
}
