
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  documentType: 'prd' | 'user_story';
  loading: boolean;
  canGenerate: boolean;
  onGenerate: () => void;
}

export function GenerateButton({
  documentType,
  loading,
  canGenerate,
  onGenerate
}: GenerateButtonProps) {
  return (
    <div className="space-y-3">
      <Button
        onClick={onGenerate}
        disabled={loading || !canGenerate}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4 mr-2" />
            Generate {documentType === 'prd' ? 'PRD' : 'User Stories'}
          </>
        )}
      </Button>

      {/* Generation Status */}
      {loading && (
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="font-medium">AI is generating your document...</p>
          <p className="text-xs">This typically takes 30-60 seconds</p>
        </div>
      )}
    </div>
  );
}
