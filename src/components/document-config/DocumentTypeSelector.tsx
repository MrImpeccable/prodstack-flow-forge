
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface DocumentTypeSelectorProps {
  documentType: 'prd' | 'user_story';
  onDocumentTypeChange: (type: 'prd' | 'user_story') => void;
  loading: boolean;
}

export function DocumentTypeSelector({
  documentType,
  onDocumentTypeChange,
  loading
}: DocumentTypeSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Document Type</label>
      <div className="space-y-2">
        <Button
          variant={documentType === 'prd' ? 'default' : 'outline'}
          onClick={() => onDocumentTypeChange('prd')}
          className="w-full justify-start"
          disabled={loading}
        >
          <FileText className="h-4 w-4 mr-2" />
          Product Requirements Document
        </Button>
        <Button
          variant={documentType === 'user_story' ? 'default' : 'outline'}
          onClick={() => onDocumentTypeChange('user_story')}
          className="w-full justify-start"
          disabled={loading}
        >
          <FileText className="h-4 w-4 mr-2" />
          User Stories
        </Button>
      </div>
      
      {/* Show requirements for each document type */}
      <div className="mt-2 text-xs text-gray-600">
        {documentType === 'prd' && (
          <p>• Requires: At least one persona OR problem canvas</p>
        )}
        {documentType === 'user_story' && (
          <p>• Requires: At least one persona (canvas optional)</p>
        )}
      </div>
    </div>
  );
}
