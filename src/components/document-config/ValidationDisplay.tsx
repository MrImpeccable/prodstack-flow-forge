
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationDisplayProps {
  message: string | null;
}

export function ValidationDisplay({ message }: ValidationDisplayProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <p className="text-sm text-amber-700">{message}</p>
    </div>
  );
}
