
import { supabase } from '@/integrations/supabase/client';

export const ensureAvatarsBucket = async () => {
  try {
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarsBucket = buckets?.find(bucket => bucket.id === 'avatars');
    
    if (!avatarsBucket) {
      // Create the bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 2097152, // 2MB
      });
      
      if (error) {
        console.error('Error creating avatars bucket:', error);
        return false;
      }
      
      console.log('Avatars bucket created successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up avatars bucket:', error);
    return false;
  }
};
