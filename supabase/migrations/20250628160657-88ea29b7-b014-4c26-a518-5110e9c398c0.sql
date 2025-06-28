
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personas table
CREATE TABLE public.personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  age INTEGER,
  role TEXT,
  goals TEXT[],
  frustrations TEXT[],
  tools TEXT[],
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create problem canvases table
CREATE TABLE public.problem_canvases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  pain_points TEXT[],
  current_behaviors TEXT[],
  opportunities TEXT[],
  canvas_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generated documents table
CREATE TABLE public.generated_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('prd', 'user_story')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_personas UUID[] DEFAULT '{}',
  source_canvas UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  page_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_canvases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for workspaces
CREATE POLICY "Users can view their own workspaces" ON public.workspaces
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workspaces" ON public.workspaces
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workspaces" ON public.workspaces
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for personas
CREATE POLICY "Users can view personas in their workspaces" ON public.personas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = personas.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create personas in their workspaces" ON public.personas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = personas.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update personas in their workspaces" ON public.personas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = personas.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete personas in their workspaces" ON public.personas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = personas.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create RLS policies for problem canvases
CREATE POLICY "Users can view canvases in their workspaces" ON public.problem_canvases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = problem_canvases.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create canvases in their workspaces" ON public.problem_canvases
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = problem_canvases.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update canvases in their workspaces" ON public.problem_canvases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = problem_canvases.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete canvases in their workspaces" ON public.problem_canvases
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = problem_canvases.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create RLS policies for generated documents
CREATE POLICY "Users can view documents in their workspaces" ON public.generated_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = generated_documents.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create documents in their workspaces" ON public.generated_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = generated_documents.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update documents in their workspaces" ON public.generated_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = generated_documents.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete documents in their workspaces" ON public.generated_documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = generated_documents.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create RLS policies for feedback (allow all authenticated users to insert)
CREATE POLICY "Users can submit feedback" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view their own feedback" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
