
import React from 'react';

interface Workspace {
  id: string;
  name: string;
  description: string | null;
}

interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  selectedWorkspace: string;
  onWorkspaceChange: (workspaceId: string) => void;
  loading: boolean;
}

export function WorkspaceSelector({
  workspaces,
  selectedWorkspace,
  onWorkspaceChange,
  loading
}: WorkspaceSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Select Workspace</label>
      <select
        value={selectedWorkspace}
        onChange={(e) => onWorkspaceChange(e.target.value)}
        className="w-full p-2 border rounded-lg"
        disabled={loading}
      >
        <option value="">Choose a workspace...</option>
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name}
          </option>
        ))}
      </select>
      {selectedWorkspace && (
        <p className="text-xs text-gray-500 mt-1">
          Selected: {workspaces.find(w => w.id === selectedWorkspace)?.name}
        </p>
      )}
    </div>
  );
}
