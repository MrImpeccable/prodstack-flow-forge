
import React from 'react';

interface Canvas {
  id: string;
  name: string;
  pain_points: string[];
  opportunities: string[];
  current_behaviors: string[];
}

interface CanvasSelectorProps {
  canvases: Canvas[];
  selectedCanvas: string;
  onSelectCanvas: (canvasId: string) => void;
}

export function CanvasSelector({ canvases, selectedCanvas, onSelectCanvas }: CanvasSelectorProps) {
  if (canvases.length === 0) return null;

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Select Canvas (Optional)</label>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {canvases.map((canvas) => (
          <div
            key={canvas.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedCanvas === canvas.id
                ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelectCanvas(selectedCanvas === canvas.id ? '' : canvas.id)}
          >
            <h4 className="font-medium text-sm">{canvas.name}</h4>
            <p className="text-xs text-gray-600">
              {canvas.pain_points?.length || 0} pain points, {canvas.opportunities?.length || 0} opportunities
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
