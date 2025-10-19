
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, CheckCircle, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase-helpers';
import { useAuth } from '@/contexts/AuthContext';

const Feedback = () => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 2MB.',
        variant: 'destructive',
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/') || (!file.type.includes('jpeg') && !file.type.includes('jpg') && !file.type.includes('png'))) {
      toast({
        title: 'Invalid file format',
        description: 'Please select a JPG or PNG image.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your feedback message.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // Upload image if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('feedback-images')
          .upload(fileName, selectedFile);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Continue without image if upload fails
        } else {
          const { data: urlData } = supabase.storage
            .from('feedback-images')
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }

      // Save feedback to database
      const { error: dbError } = await fromTable('feedback')
        .insert([{
          message: message.trim(),
          user_id: user?.id || null,
          user_agent: navigator.userAgent,
          page_url: window.location.href,
        }]);

      if (dbError) throw dbError;

      // Send email to admin
      const { error: emailError } = await supabase.functions.invoke('send-feedback-email', {
        body: {
          message: message.trim(),
          userEmail: user?.email || null,
          userAgent: navigator.userAgent,
          pageUrl: window.location.href,
          imageUrl: imageUrl,
        }
      });

      if (emailError) {
        console.error('Error sending feedback email:', emailError);
        // Don't throw here - feedback was saved, email is bonus
      }

      setIsSubmitted(true);
      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted successfully.',
      });
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Thank You!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              Your feedback has been submitted successfully. We appreciate you taking the time to help us improve ProdStack.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
              >
                Back to Home
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-red-600 hover:bg-red-700"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/3b4d22fa-d92b-49a4-9d92-263e24102342.png" 
                alt="ProdStack Logo" 
                className="h-auto w-[100px]"
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                <span className="text-red-600">Prod</span>Stack Feedback
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">We'd Love Your Feedback</CardTitle>
            <CardDescription className="text-lg">
              Help us improve ProdStack by sharing your thoughts, suggestions, or reporting any issues you've encountered.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Feedback *
                </Label>
                <Textarea
                  id="feedback"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please share your thoughts about ProdStack. What features do you love? What could be improved? Any bugs or issues you've encountered?"
                  rows={8}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <Label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Attach Screenshot (Optional)
                </Label>
                <div className="space-y-3">
                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-600 mb-2">
                        Upload an image to help us understand your feedback better
                      </div>
                      <Input
                        id="image"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileSelect}
                        className="max-w-xs mx-auto"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        JPG or PNG, max 2MB
                      </p>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <img
                              src={URL.createObjectURL(selectedFile)}
                              alt="Preview"
                              className="h-12 w-12 object-cover rounded"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Feedback;
