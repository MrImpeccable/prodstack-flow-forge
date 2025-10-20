
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedDocumentDisplayProps {
  generatedText: string;
}

export function GeneratedDocumentDisplay({ generatedText }: GeneratedDocumentDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Document copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const wordCount = generatedText ? generatedText.split(/\s+/).filter(word => word.length > 0).length : 0;
  const charCount = generatedText ? generatedText.length : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Generated Document</CardTitle>
          {generatedText && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {wordCount} words · {charCount} characters
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {generatedText ? (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <Textarea
                value={generatedText}
                readOnly
                className="min-h-[500px] font-mono text-sm whitespace-pre-wrap resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-base font-medium mb-2">Ready to Generate</p>
            <p className="text-sm">Configure your settings and click "Generate Document" to create AI-powered documentation.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
