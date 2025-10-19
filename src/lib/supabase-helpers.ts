import { supabase } from '@/integrations/supabase/client';

// Helper to bypass strict generated types until types are synced with the backend
export const fromTable = (table: string) => (supabase as any).from(table);
