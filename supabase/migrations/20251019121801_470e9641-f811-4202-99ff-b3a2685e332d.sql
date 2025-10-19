-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workspaces"
  ON public.workspaces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workspaces"
  ON public.workspaces FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workspaces"
  ON public.workspaces FOR DELETE
  USING (auth.uid() = user_id);

-- Create personas table
CREATE TABLE public.personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  role TEXT,
  bio TEXT,
  goals TEXT[] DEFAULT '{}',
  frustrations TEXT[] DEFAULT '{}',
  tools TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view personas in their workspaces"
  ON public.personas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = personas.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create personas in their workspaces"
  ON public.personas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = personas.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update personas in their workspaces"
  ON public.personas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = personas.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete personas in their workspaces"
  ON public.personas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = personas.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create problem_canvases table
CREATE TABLE public.problem_canvases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  name TEXT NOT NULL,
  pain_points TEXT[] DEFAULT '{}',
  current_behaviors TEXT[] DEFAULT '{}',
  opportunities TEXT[] DEFAULT '{}',
  canvas_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.problem_canvases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view canvases in their workspaces"
  ON public.problem_canvases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = problem_canvases.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create canvases in their workspaces"
  ON public.problem_canvases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = problem_canvases.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update canvases in their workspaces"
  ON public.problem_canvases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = problem_canvases.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete canvases in their workspaces"
  ON public.problem_canvases FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = problem_canvases.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create generated_documents table
CREATE TABLE public.generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT NOT NULL,
  source_personas TEXT[] DEFAULT '{}',
  source_canvas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents in their workspaces"
  ON public.generated_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = generated_documents.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents in their workspaces"
  ON public.generated_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = generated_documents.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update documents in their workspaces"
  ON public.generated_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = generated_documents.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents in their workspaces"
  ON public.generated_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = generated_documents.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  user_agent TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.personas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.problem_canvases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create profile automatically on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for feedback images
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-images', 'feedback-images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for feedback images
CREATE POLICY "Users can upload their own feedback images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'feedback-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own feedback images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'feedback-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own feedback images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'feedback-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );