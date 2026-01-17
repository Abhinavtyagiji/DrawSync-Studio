'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { History, Settings, Grid3x3 } from 'lucide-react';
import type { CanvasObject } from '@/types';

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState<'history' | 'properties' | 'grid'>('properties');
  
  const {
    objects,
    selectedObjectId,
    history,
    historyIndex,
    gridEnabled,
    snapToGrid,
    gridSize,
    toggleGrid,
    toggleSnapToGrid,
    setGridSize,
    updateObject,
    setColor,
    setStrokeWidth,
    setFontSize,
    setFontFamily,
    color,
    strokeWidth,
    fontSize,
    fontFamily,
  } = useStore();

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-sm">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 p-3 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <History size={16} className="inline mr-2" />
          History
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 p-3 text-sm font-medium transition-colors ${
            activeTab === 'properties'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings size={16} className="inline mr-2" />
          Properties
        </button>
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex-1 p-3 text-sm font-medium transition-colors ${
            activeTab === 'grid'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Grid3x3 size={16} className="inline mr-2" />
          Grid
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'history' && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Drawing History</h3>
            <div className="space-y-1">
              {history.map((state, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                    index === historyIndex
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="font-medium">
                    {index === 0 ? 'Initial State' : `Step ${index}`}
                  </div>
                  <div className="text-gray-500">{state.length} objects</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Current: Step {historyIndex} of {history.length - 1}
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="space-y-4">
            {selectedObject ? (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Object Properties</h3>
                  <div className="text-xs text-gray-500 mb-3">
                    Type: {selectedObject.type}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={selectedObject.color}
                    onChange={(e) => {
                      updateObject(selectedObjectId!, { color: e.target.value });
                      setColor(e.target.value);
                    }}
                    className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                  />
                </div>

                {/* Stroke Width */}
                {(selectedObject.type === 'draw' ||
                  selectedObject.type === 'rectangle' ||
                  selectedObject.type === 'circle' ||
                  selectedObject.type === 'line' ||
                  selectedObject.type === 'arrow') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Stroke Width: {(selectedObject as any).strokeWidth}px
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={(selectedObject as any).strokeWidth}
                      onChange={(e) => {
                        const width = Number(e.target.value);
                        updateObject(selectedObjectId!, { strokeWidth: width } as any);
                        setStrokeWidth(width);
                      }}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Text Properties */}
                {selectedObject.type === 'text' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Font Size: {(selectedObject as any).fontSize}px
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="72"
                        value={(selectedObject as any).fontSize}
                        onChange={(e) => {
                          const size = Number(e.target.value);
                          updateObject(selectedObjectId!, { fontSize: size } as any);
                          setFontSize(size);
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Font Family
                      </label>
                      <select
                        value={(selectedObject as any).fontFamily}
                        onChange={(e) => {
                          updateObject(selectedObjectId!, { fontFamily: e.target.value } as any);
                          setFontFamily(e.target.value);
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Georgia">Georgia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Text
                      </label>
                      <input
                        type="text"
                        value={(selectedObject as any).text}
                        onChange={(e) => {
                          updateObject(selectedObjectId!, { text: e.target.value } as any);
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  </>
                )}

                {/* Fill Color for Shapes */}
                {(selectedObject.type === 'rectangle' || selectedObject.type === 'circle') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Fill Color (optional)
                    </label>
                    <input
                      type="color"
                      value={(selectedObject as any).fillColor || '#ffffff'}
                      onChange={(e) => {
                        updateObject(selectedObjectId!, { fillColor: e.target.value } as any);
                      }}
                      className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-400 text-sm py-8">
                <Settings size={32} className="mx-auto mb-2 opacity-50" />
                <p>Select an object to edit properties</p>
              </div>
            )}

            {/* Global Properties */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Default Properties</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Default Color
                  </label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Default Stroke Width: {strokeWidth}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Default Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Default Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grid' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Grid Settings</h3>
            
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gridEnabled}
                  onChange={toggleGrid}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show Grid</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={toggleSnapToGrid}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Snap to Grid</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Grid Size: {gridSize}px
              </label>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Enable the grid to help align objects. When snap-to-grid is enabled, objects will automatically align to grid points.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

