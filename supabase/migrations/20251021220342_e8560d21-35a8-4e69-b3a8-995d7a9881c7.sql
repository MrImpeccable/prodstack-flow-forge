-- Create persona-avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('persona-avatars', 'persona-avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload persona avatars
CREATE POLICY "Users can upload persona avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'persona-avatars');

-- Allow public read access to persona avatars
CREATE POLICY "Anyone can view persona avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'persona-avatars');

-- Allow users to update their own persona avatars
CREATE POLICY "Users can update persona avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'persona-avatars');

-- Allow users to delete their own persona avatars
CREATE POLICY "Users can delete persona avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'persona-avatars');