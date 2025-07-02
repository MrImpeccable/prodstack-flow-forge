
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface GeneratedDocumentDisplayProps {
  generatedText: string;
}

export function GeneratedDocumentDisplay({ generatedText }: GeneratedDocumentDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Document</CardTitle>
      </CardHeader>
      <CardContent>
        {generatedText ? (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <Textarea
                value={generatedText}
                readOnly
                className="min-h-[500px] font-mono text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Configure your settings and click "Generate Document" to create AI-powered documentation.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
