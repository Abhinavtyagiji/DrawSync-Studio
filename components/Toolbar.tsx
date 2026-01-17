'use client';

import { useStore } from '@/store/useStore';
import {
  MousePointer2,
  Pencil,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Type,
  Eraser,
  Download,
  Trash2,
  Undo2,
  Redo2,
} from 'lucide-react';
import type { Tool } from '@/types';

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000',
];

export default function Toolbar() {
  const {
    currentTool,
    color,
    strokeWidth,
    setTool,
    setColor,
    setStrokeWidth,
    clearCanvas,
    undo,
    redo,
    history,
    historyIndex,
  } = useStore();

  const tools: Array<{ tool: Tool; icon: React.ReactNode; label: string }> = [
    { tool: 'select', icon: <MousePointer2 size={20} />, label: 'Select' },
    { tool: 'draw', icon: <Pencil size={20} />, label: 'Draw' },
    { tool: 'rectangle', icon: <Square size={20} />, label: 'Rectangle' },
    { tool: 'circle', icon: <Circle size={20} />, label: 'Circle' },
    { tool: 'line', icon: <Minus size={20} />, label: 'Line' },
    { tool: 'arrow', icon: <ArrowRight size={20} />, label: 'Arrow' },
    { tool: 'text', icon: <Type size={20} />, label: 'Text' },
    { tool: 'eraser', icon: <Eraser size={20} />, label: 'Eraser' },
  ];

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      clearCanvas();
    }
  };

  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `drawsync-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleExportSVG = () => {
    const { objects } = useStore.getState();
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">`;

    objects.forEach((obj) => {
      if (!obj.visible) return;

      switch (obj.type) {
        case 'draw': {
          const drawObj = obj as any;
          if (drawObj.points.length < 2) break;
          let path = `M ${drawObj.points[0].x} ${drawObj.points[0].y}`;
          for (let i = 1; i < drawObj.points.length; i++) {
            path += ` L ${drawObj.points[i].x} ${drawObj.points[i].y}`;
          }
          svg += `<path d="${path}" stroke="${drawObj.color}" stroke-width="${drawObj.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
          break;
        }
        case 'rectangle': {
          const shapeObj = obj as any;
          svg += `<rect x="${shapeObj.x}" y="${shapeObj.y}" width="${shapeObj.width}" height="${shapeObj.height}" stroke="${shapeObj.color}" stroke-width="${shapeObj.strokeWidth}" fill="${shapeObj.fillColor || 'none'}"/>`;
          break;
        }
        case 'circle': {
          const shapeObj = obj as any;
          const centerX = shapeObj.x + shapeObj.width / 2;
          const centerY = shapeObj.y + shapeObj.height / 2;
          const radius = Math.min(Math.abs(shapeObj.width), Math.abs(shapeObj.height)) / 2;
          svg += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" stroke="${shapeObj.color}" stroke-width="${shapeObj.strokeWidth}" fill="${shapeObj.fillColor || 'none'}"/>`;
          break;
        }
        case 'line': {
          const lineObj = obj as any;
          svg += `<line x1="${lineObj.x1}" y1="${lineObj.y1}" x2="${lineObj.x2}" y2="${lineObj.y2}" stroke="${lineObj.color}" stroke-width="${lineObj.strokeWidth}"/>`;
          break;
        }
        case 'arrow': {
          const lineObj = obj as any;
          svg += `<line x1="${lineObj.x1}" y1="${lineObj.y1}" x2="${lineObj.x2}" y2="${lineObj.y2}" stroke="${lineObj.color}" stroke-width="${lineObj.strokeWidth}" marker-end="url(#arrowhead)"/>`;
          break;
        }
        case 'text': {
          const textObj = obj as any;
          svg += `<text x="${textObj.x}" y="${textObj.y}" font-family="${textObj.fontFamily}" font-size="${textObj.fontSize}" fill="${textObj.color}">${textObj.text}</text>`;
          break;
        }
      }
    });

    svg += '</svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `drawsync-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Check if undo/redo is available
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4 shadow-sm">
      {/* Tools */}
      <div className="flex flex-col gap-2">
        {tools.map(({ tool, icon, label }) => (
          <button
            key={tool}
            onClick={() => setTool(tool)}
            className={`p-2 rounded-lg transition-colors ${
              currentTool === tool
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title={label}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-200" />

      {/* Undo/Redo */}
      <div className="flex flex-col gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded-lg transition-colors ${
            canUndo ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={20} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded-lg transition-colors ${
            canRedo ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={20} />
        </button>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-200" />

      {/* Color Picker */}
      <div className="flex flex-col gap-2 w-full px-2">
        <label className="text-xs text-gray-500 text-center">Color</label>
        <div className="grid grid-cols-3 gap-1">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              onClick={() => setColor(presetColor)}
              className={`w-6 h-6 rounded border-2 ${
                color === presetColor ? 'border-blue-500' : 'border-gray-300'
              }`}
              style={{ backgroundColor: presetColor }}
              title={presetColor}
            />
          ))}
        </div>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-8 rounded border border-gray-300 cursor-pointer"
          title="Custom Color"
        />
      </div>

      {/* Brush Size */}
      <div className="flex flex-col gap-2 w-full px-2">
        <label className="text-xs text-gray-500 text-center">Size</label>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-center text-gray-600">{strokeWidth}px</div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-200" />

      {/* Actions */}
      <div className="flex flex-col gap-2 w-full px-2">
        <button
          onClick={handleExportPNG}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          title="Export as PNG"
        >
          <Download size={20} />
        </button>
        <button
          onClick={handleExportSVG}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          title="Export as SVG"
        >
          <Download size={20} />
        </button>
        <button
          onClick={handleClear}
          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          title="Clear Canvas"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}

