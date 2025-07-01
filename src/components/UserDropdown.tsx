
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, Image, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const UserDropdown = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showPictureDialog, setShowPictureDialog] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || ''
  });
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getFirstName = (fullName: string | null) => {
    if (!fullName) return 'User';
    return fullName.split(' ')[0];
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleProfileSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name.trim(),
          email: profileForm.email.trim()
        })
        .eq('id', profile?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setShowProfileDialog(false);
      window.location.reload(); // Refresh to update profile data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 2MB',
        variant: 'destructive',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select a valid image file',
        variant: 'destructive',
      });
      return;
    }

    setUploadingPicture(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', profile?.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
      });
      
      setShowPictureDialog(false);
      window.location.reload(); // Refresh to show new avatar
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload picture',
        variant: 'destructive',
      });
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    const root = window.document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (systemTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    toast({
      title: 'Theme Updated',
      description: `Switched to ${newTheme} mode`,
    });
  };

  return (
    <>
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
          Welcome back, {getFirstName(profile?.full_name)}
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
                <AvatarFallback className="bg-red-100 text-red-600 text-xs font-medium">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium text-gray-900 dark:text-white">{profile?.full_name || 'User'}</p>
                <p className="w-[200px] truncate text-sm text-muted-foreground dark:text-gray-400">
                  {profile?.email}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
            <DropdownMenuItem onClick={() => setShowProfileDialog(true)} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowSettingsDialog(true)} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowPictureDialog(true)} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Image className="mr-2 h-4 w-4" />
              <span>Add Picture</span>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Sun className="mr-2 h-4 w-4" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <DropdownMenuItem onClick={() => handleThemeChange('light')} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light Mode</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange('dark')} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark Mode</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange('system')} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System Default</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
            <DropdownMenuItem onClick={handleSignOut} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Edit Profile</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update your profile information here.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-gray-900 dark:text-white">Full Name</Label>
              <Input
                id="fullName"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-900 dark:text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleProfileSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Settings</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Manage your account settings and preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Receive notifications via email</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Privacy Settings</h4>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Manage your privacy preferences</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Picture Dialog */}
      <Dialog open={showPictureDialog} onOpenChange={setShowPictureDialog}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Add Profile Picture</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Upload a new profile picture to personalize your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
                <AvatarFallback className="bg-red-100 text-red-600 text-2xl">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center">
              <Input 
                type="file" 
                accept="image/*" 
                className="mb-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" 
                onChange={handlePictureUpload}
                disabled={uploadingPicture}
              />
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                Upload a JPG or PNG image (max 2MB)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPictureDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserDropdown;
