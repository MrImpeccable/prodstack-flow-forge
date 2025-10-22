import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { exportPersonaToWord } from '@/utils/documentExports';
import { exportPersonaAsModernPNG } from '@/utils/modernPersonaExport';
import { toast } from 'sonner';

interface Persona {
  id?: string;
  name: string;
  avatar_url?: string;
  age?: number;
  role?: string;
  goals?: string[];
  frustrations?: string[];
  tools?: string[];
  bio?: string;
}

interface ExportPreviewModalProps {
  persona: Persona;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  persona,
  open,
  onOpenChange,
}) => {
  const [pngPreview, setPngPreview] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  useEffect(() => {
    if (open) {
      generatePngPreview();
    }
  }, [open]);

  const generatePngPreview = async () => {
    setIsGeneratingPreview(true);
    try {
      // Generate PNG preview by creating a canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 600;
      canvas.height = 800;

      // Simple preview rendering
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#1A1A1A';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText(persona.name, 30, 50);

      if (persona.role) {
        ctx.font = '16px Inter, sans-serif';
        ctx.fillStyle = '#6B7280';
        ctx.fillText(persona.role, 30, 80);
      }

      const previewUrl = canvas.toDataURL('image/png');
      setPngPreview(previewUrl);
    } catch (error) {
      console.error('Preview generation failed:', error);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleDownloadWord = () => {
    try {
      exportPersonaToWord(persona);
      toast.success('Word document downloaded successfully');
    } catch (error) {
      toast.error('Failed to download Word document');
    }
  };

  const handleDownloadPNG = async () => {
    try {
      await exportPersonaAsModernPNG(persona);
      toast.success('PNG image downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PNG image');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Export Preview</DialogTitle>
          <DialogDescription>
            Preview and download your persona in different formats
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="png" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="png" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              PNG Preview
            </TabsTrigger>
            <TabsTrigger value="word" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Word Format
            </TabsTrigger>
          </TabsList>

          <TabsContent value="png" className="space-y-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 min-h-[400px] flex items-center justify-center">
              {isGeneratingPreview ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generating preview...
                  </p>
                </div>
              ) : pngPreview ? (
                <img
                  src={pngPreview}
                  alt="PNG Preview"
                  className="max-w-full h-auto rounded shadow-lg"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Preview unavailable
                </p>
              )}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                High-resolution 1200x1600px professional export
              </p>
              <Button onClick={handleDownloadPNG} className="bg-red-600 hover:bg-red-700">
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="word" className="space-y-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 bg-gray-50 dark:bg-gray-900 min-h-[400px]">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl font-bold">
                    {persona.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {persona.name}
                    </h2>
                    {persona.role && (
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {persona.role}
                      </p>
                    )}
                    {persona.age && (
                      <p className="text-sm text-gray-500">Age: {persona.age}</p>
                    )}
                  </div>
                </div>

                {persona.bio && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                      Bio
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{persona.bio}</p>
                  </div>
                )}

                {persona.goals && persona.goals.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                      Goals
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {persona.goals.map((goal, idx) => (
                        <li key={idx} className="text-gray-700 dark:text-gray-300">
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {persona.frustrations && persona.frustrations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                      Frustrations
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {persona.frustrations.map((frustration, idx) => (
                        <li key={idx} className="text-gray-700 dark:text-gray-300">
                          {frustration}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Professional Word document with avatar and formatting
              </p>
              <Button onClick={handleDownloadWord} className="bg-red-600 hover:bg-red-700">
                <Download className="h-4 w-4 mr-2" />
                Download Word
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ExportPreviewModal;
