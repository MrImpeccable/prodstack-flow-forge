import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePersonaAvatar = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAvatar = async (personaId: string): Promise<string | null> => {
    setIsGenerating(true);
    const toastId = toast.loading('Generating AI avatar...');

    try {
      const { data, error } = await supabase.functions.invoke('generate-persona-avatar', {
        body: { personaId },
      });

      if (error) {
        console.error('Avatar generation error:', error);
        
        if (error.message?.includes('429')) {
          toast.error('Too many requests. Please try again in a moment.', { id: toastId });
        } else if (error.message?.includes('402')) {
          toast.error('AI credits exhausted. Please add credits to continue.', { id: toastId });
        } else {
          toast.error('Failed to generate avatar. Using default instead.', { id: toastId });
        }
        return null;
      }

      toast.success('Avatar generated successfully!', { id: toastId });
      return data?.avatar_url || null;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Failed to generate avatar', { id: toastId });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateAvatar, isGenerating };
};
