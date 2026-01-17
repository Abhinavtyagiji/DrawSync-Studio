export type Tool = 
  | 'select'
  | 'draw'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'text'
  | 'eraser';

export type CanvasObject = 
  | DrawObject
  | ShapeObject
  | TextObject
  | LineObject;

export interface DrawObject {
  id: string;
  type: 'draw';
  points: Array<{ x: number; y: number }>;
  color: string;
  strokeWidth: number;
  visible: boolean;
}

export interface ShapeObject {
  id: string;
  type: 'rectangle' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
  fillColor?: string;
  visible: boolean;
}

export interface LineObject {
  id: string;
  type: 'line' | 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  strokeWidth: number;
  visible: boolean;
}

export interface TextObject {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  visible: boolean;
}

export interface CanvasState {
  objects: CanvasObject[];
  selectedObjectId: string | null;
  currentTool: Tool;
  color: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  history: CanvasObject[][];
  historyIndex: number;
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  currentPage: number;
  pages: CanvasObject[][];
}

