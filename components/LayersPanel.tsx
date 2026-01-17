'use client';

import { useStore } from '@/store/useStore';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

export default function LayersPanel() {
  const { objects, selectedObjectId, setSelectedObject, toggleObjectVisibility, deleteObject } = useStore();

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Layers</h2>
        <p className="text-xs text-gray-500 mt-1">{objects.length} objects</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {objects.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            No objects yet
          </div>
        ) : (
          <div className="space-y-1">
            {objects.slice().reverse().map((obj) => (
              <div
                key={obj.id}
                onClick={() => setSelectedObject(obj.id)}
                className={`p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${
                  selectedObjectId === obj.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleObjectVisibility(obj.id);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {obj.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700 truncate">
                      {obj.type.charAt(0).toUpperCase() + obj.type.slice(1)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {obj.type === 'text' ? (obj as any).text : `${obj.type} object`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteObject(obj.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

