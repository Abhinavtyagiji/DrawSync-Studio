'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import type { CanvasObject, DrawObject, ShapeObject, LineObject, TextObject } from '@/types';

type TempShapeObject = Partial<Pick<ShapeObject, 'x' | 'y' | 'width' | 'height'>>;
type TempLineObject = Partial<Pick<LineObject, 'x1' | 'y1' | 'x2' | 'y2'>>;

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);
  const [tempObject, setTempObject] = useState<TempShapeObject | TempLineObject | null>(null);

  const {
    objects,
    currentTool,
    color,
    strokeWidth,
    fontSize,
    fontFamily,
    selectedObjectId,
    setSelectedObject,
    addObject,
    updateObject,
    deleteObject,
    gridEnabled,
    snapToGrid,
    gridSize,
  } = useStore();

  // Snap coordinate to grid
  const snapCoordinate = useCallback((coord: number) => {
    if (snapToGrid) {
      return Math.round(coord / gridSize) * gridSize;
    }
    return coord;
  }, [snapToGrid, gridSize]);

  // Get mouse position relative to canvas
  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    return {
      x: snapCoordinate(x),
      y: snapCoordinate(y),
    };
  }, [snapCoordinate]);

  // Draw grid
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!gridEnabled) return;
    
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [gridEnabled, gridSize]);

  // Draw objects
  const drawObjects = useCallback((ctx: CanvasRenderingContext2D) => {
    objects.forEach((obj) => {
      if (!obj.visible) return;

      ctx.save();

      if (obj.id === selectedObjectId) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
      }

      switch (obj.type) {
        case 'draw': {
          const drawObj = obj as DrawObject;
          if (drawObj.points.length < 2) break;
          
          ctx.strokeStyle = drawObj.color;
          ctx.lineWidth = drawObj.strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.setLineDash([]);
          
          ctx.beginPath();
          ctx.moveTo(drawObj.points[0].x, drawObj.points[0].y);
          for (let i = 1; i < drawObj.points.length; i++) {
            ctx.lineTo(drawObj.points[i].x, drawObj.points[i].y);
          }
          ctx.stroke();
          break;
        }

        case 'rectangle': {
          const shapeObj = obj as ShapeObject;
          ctx.strokeStyle = shapeObj.color;
          ctx.lineWidth = shapeObj.strokeWidth;
          ctx.setLineDash([]);
          if (shapeObj.fillColor) {
            ctx.fillStyle = shapeObj.fillColor;
            ctx.fillRect(shapeObj.x, shapeObj.y, shapeObj.width, shapeObj.height);
          }
          ctx.strokeRect(shapeObj.x, shapeObj.y, shapeObj.width, shapeObj.height);
          break;
        }

        case 'circle': {
          const shapeObj = obj as ShapeObject;
          ctx.strokeStyle = shapeObj.color;
          ctx.lineWidth = shapeObj.strokeWidth;
          ctx.setLineDash([]);
          const centerX = shapeObj.x + shapeObj.width / 2;
          const centerY = shapeObj.y + shapeObj.height / 2;
          const radius = Math.min(Math.abs(shapeObj.width), Math.abs(shapeObj.height)) / 2;
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          if (shapeObj.fillColor) {
            ctx.fillStyle = shapeObj.fillColor;
            ctx.fill();
          }
          ctx.stroke();
          break;
        }

        case 'line':
        case 'arrow': {
          const lineObj = obj as LineObject;
          ctx.strokeStyle = lineObj.color;
          ctx.lineWidth = lineObj.strokeWidth;
          ctx.setLineDash([]);
          
          ctx.beginPath();
          ctx.moveTo(lineObj.x1, lineObj.y1);
          ctx.lineTo(lineObj.x2, lineObj.y2);
          ctx.stroke();
          
          if (lineObj.type === 'arrow') {
            // Draw arrowhead
            const angle = Math.atan2(lineObj.y2 - lineObj.y1, lineObj.x2 - lineObj.x1);
            const arrowLength = 10;
            const arrowAngle = Math.PI / 6;
            
            ctx.beginPath();
            ctx.moveTo(lineObj.x2, lineObj.y2);
            ctx.lineTo(
              lineObj.x2 - arrowLength * Math.cos(angle - arrowAngle),
              lineObj.y2 - arrowLength * Math.sin(angle - arrowAngle)
            );
            ctx.moveTo(lineObj.x2, lineObj.y2);
            ctx.lineTo(
              lineObj.x2 - arrowLength * Math.cos(angle + arrowAngle),
              lineObj.y2 - arrowLength * Math.sin(angle + arrowAngle)
            );
            ctx.stroke();
          }
          break;
        }

        case 'text': {
          const textObj = obj as TextObject;
          ctx.fillStyle = textObj.color;
          ctx.font = `${textObj.fontSize}px ${textObj.fontFamily}`;
          ctx.setLineDash([]);
          ctx.fillText(textObj.text, textObj.x, textObj.y);
          break;
        }
      }

      ctx.restore();
    });
  }, [objects, selectedObjectId]);

  // Render canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

    // Draw grid
    drawGrid(ctx, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

    // Draw objects
    drawObjects(ctx);

    // Draw temporary object (while drawing)
    if (tempObject && isDrawing) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.setLineDash([5, 5]);
      
      if ('x' in tempObject && 'y' in tempObject && 'width' in tempObject && 'height' in tempObject) {
        if (currentTool === 'rectangle') {
          ctx.strokeRect(tempObject.x!, tempObject.y!, tempObject.width!, tempObject.height!);
        } else if (currentTool === 'circle') {
          const centerX = tempObject.x! + tempObject.width! / 2;
          const centerY = tempObject.y! + tempObject.height! / 2;
          const radius = Math.min(Math.abs(tempObject.width!), Math.abs(tempObject.height!)) / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      } else if ('x1' in tempObject && 'y1' in tempObject && 'x2' in tempObject && 'y2' in tempObject) {
        ctx.beginPath();
        ctx.moveTo(tempObject.x1!, tempObject.y1!);
        ctx.lineTo(tempObject.x2!, tempObject.y2!);
        ctx.stroke();
        
        if (currentTool === 'arrow') {
          const angle = Math.atan2(tempObject.y2! - tempObject.y1!, tempObject.x2! - tempObject.x1!);
          const arrowLength = 10;
          const arrowAngle = Math.PI / 6;
          
          ctx.beginPath();
          ctx.moveTo(tempObject.x2!, tempObject.y2!);
          ctx.lineTo(
            tempObject.x2! - arrowLength * Math.cos(angle - arrowAngle),
            tempObject.y2! - arrowLength * Math.sin(angle - arrowAngle)
          );
          ctx.moveTo(tempObject.x2!, tempObject.y2!);
          ctx.lineTo(
            tempObject.x2! - arrowLength * Math.cos(angle + arrowAngle),
            tempObject.y2! - arrowLength * Math.sin(angle + arrowAngle)
          );
          ctx.stroke();
        }
      }
      
      ctx.restore();
    }

    // Draw current path (while drawing)
    if (currentPath.length > 1 && isDrawing && currentTool === 'draw') {
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([]);
      
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
    }
  }, [objects, tempObject, isDrawing, currentPath, currentTool, color, strokeWidth, drawGrid, drawObjects, gridEnabled]);

  useEffect(() => {
    render();
  }, [render]);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setStartPos(pos);
    setIsDrawing(true);
    setCurrentPath([pos]);

    if (currentTool === 'select') {
      // Check if clicking on an object
      const clickedObject = objects
        .slice()
        .reverse()
        .find((obj) => {
          if (!obj.visible) return false;
          
          switch (obj.type) {
            case 'draw': {
              const drawObj = obj as DrawObject;
              return drawObj.points.some(
                (p) => Math.abs(p.x - pos.x) < 10 && Math.abs(p.y - pos.y) < 10
              );
            }
            case 'rectangle': {
              const shapeObj = obj as ShapeObject;
              return (
                pos.x >= shapeObj.x &&
                pos.x <= shapeObj.x + shapeObj.width &&
                pos.y >= shapeObj.y &&
                pos.y <= shapeObj.y + shapeObj.height
              );
            }
            case 'circle': {
              const shapeObj = obj as ShapeObject;
              const centerX = shapeObj.x + shapeObj.width / 2;
              const centerY = shapeObj.y + shapeObj.height / 2;
              const radius = Math.min(Math.abs(shapeObj.width), Math.abs(shapeObj.height)) / 2;
              const dist = Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2));
              return dist <= radius;
            }
            case 'line':
            case 'arrow': {
              const lineObj = obj as LineObject;
              const dist = distanceToLine(pos, { x: lineObj.x1, y: lineObj.y1 }, { x: lineObj.x2, y: lineObj.y2 });
              return dist < 10;
            }
            case 'text': {
              const textObj = obj as TextObject;
              // Simple bounding box check
              return Math.abs(pos.x - textObj.x) < 100 && Math.abs(pos.y - textObj.y) < 20;
            }
          }
        });

      if (clickedObject) {
        setSelectedObject(clickedObject.id);
      } else {
        setSelectedObject(null);
      }
    } else if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const textObj: TextObject = {
          id: `text-${Date.now()}`,
          type: 'text',
          x: pos.x,
          y: pos.y,
          text,
          fontSize,
          fontFamily,
          color,
          visible: true,
        };
        addObject(textObj);
      }
    } else if (currentTool === 'eraser') {
      // Erase objects at click position
      const objectToErase = objects
        .slice()
        .reverse()
        .find((obj) => {
          if (!obj.visible) return false;
          // Similar hit detection as select tool
          return isPointOnObject(pos, obj);
        });
      
      if (objectToErase) {
        deleteObject(objectToErase.id);
      }
    }
  };

  // Helper function to check if point is on object
  const isPointOnObject = (pos: { x: number; y: number }, obj: CanvasObject): boolean => {
    switch (obj.type) {
      case 'draw': {
        const drawObj = obj as DrawObject;
        return drawObj.points.some(
          (p) => Math.abs(p.x - pos.x) < 10 && Math.abs(p.y - pos.y) < 10
        );
      }
      case 'rectangle': {
        const shapeObj = obj as ShapeObject;
        return (
          pos.x >= shapeObj.x &&
          pos.x <= shapeObj.x + shapeObj.width &&
          pos.y >= shapeObj.y &&
          pos.y <= shapeObj.y + shapeObj.height
        );
      }
      case 'circle': {
        const shapeObj = obj as ShapeObject;
        const centerX = shapeObj.x + shapeObj.width / 2;
        const centerY = shapeObj.y + shapeObj.height / 2;
        const radius = Math.min(Math.abs(shapeObj.width), Math.abs(shapeObj.height)) / 2;
        const dist = Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2));
        return dist <= radius;
      }
      case 'line':
      case 'arrow': {
        const lineObj = obj as LineObject;
        const dist = distanceToLine(pos, { x: lineObj.x1, y: lineObj.y1 }, { x: lineObj.x2, y: lineObj.y2 });
        return dist < 10;
      }
      case 'text': {
        const textObj = obj as TextObject;
        return Math.abs(pos.x - textObj.x) < 100 && Math.abs(pos.y - textObj.y) < 20;
      }
    }
    return false;
  };

  // Helper function to calculate distance from point to line
  const distanceToLine = (
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number }
  ): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx: number, yy: number;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);

    if (currentTool === 'draw') {
      setCurrentPath((prev) => [...prev, pos]);
    } else if (currentTool === 'select' && selectedObjectId) {
      // Move selected object
      const selectedObj = objects.find((o) => o.id === selectedObjectId);
      if (selectedObj) {
        const deltaX = pos.x - startPos.x;
        const deltaY = pos.y - startPos.y;

        if (selectedObj.type === 'draw') {
          const drawObj = selectedObj as DrawObject;
          const newPoints = drawObj.points.map((p) => ({
            x: p.x + deltaX,
            y: p.y + deltaY,
          }));
          updateObject(selectedObjectId, { points: newPoints } as Partial<DrawObject>);
        } else if (selectedObj.type === 'rectangle' || selectedObj.type === 'circle') {
          const shapeObj = selectedObj as ShapeObject;
          updateObject(selectedObjectId, {
            x: shapeObj.x + deltaX,
            y: shapeObj.y + deltaY,
          } as Partial<ShapeObject>);
        } else if (selectedObj.type === 'line' || selectedObj.type === 'arrow') {
          const lineObj = selectedObj as LineObject;
          updateObject(selectedObjectId, {
            x1: lineObj.x1 + deltaX,
            y1: lineObj.y1 + deltaY,
            x2: lineObj.x2 + deltaX,
            y2: lineObj.y2 + deltaY,
          } as Partial<LineObject>);
        } else if (selectedObj.type === 'text') {
          const textObj = selectedObj as TextObject;
          updateObject(selectedObjectId, {
            x: textObj.x + deltaX,
            y: textObj.y + deltaY,
          } as Partial<TextObject>);
        }
      }
      setStartPos(pos);
    } else if (currentTool === 'rectangle' || currentTool === 'circle') {
      const width = pos.x - startPos.x;
      const height = pos.y - startPos.y;
      setTempObject({
        x: startPos.x,
        y: startPos.y,
        width,
        height,
      } as ShapeObject);
    } else if (currentTool === 'line' || currentTool === 'arrow') {
      setTempObject({
        x1: startPos.x,
        y1: startPos.y,
        x2: pos.x,
        y2: pos.y,
      } as LineObject);
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (!isDrawing) return;

    if (currentTool === 'draw' && currentPath.length > 0) {
      const drawObj: DrawObject = {
        id: `draw-${Date.now()}`,
        type: 'draw',
        points: currentPath,
        color,
        strokeWidth,
        visible: true,
      };
      addObject(drawObj);
      setCurrentPath([]);
    } else if (currentTool === 'rectangle' && tempObject && 'width' in tempObject) {
      const shapeObj: ShapeObject = {
        id: `rect-${Date.now()}`,
        type: 'rectangle',
        x: tempObject.x!,
        y: tempObject.y!,
        width: tempObject.width!,
        height: tempObject.height!,
        color,
        strokeWidth,
        visible: true,
      };
      addObject(shapeObj);
      setTempObject(null);
    } else if (currentTool === 'circle' && tempObject && 'width' in tempObject) {
      const shapeObj: ShapeObject = {
        id: `circle-${Date.now()}`,
        type: 'circle',
        x: tempObject.x!,
        y: tempObject.y!,
        width: tempObject.width!,
        height: tempObject.height!,
        color,
        strokeWidth,
        visible: true,
      };
      addObject(shapeObj);
      setTempObject(null);
    } else if ((currentTool === 'line' || currentTool === 'arrow') && tempObject && 'x1' in tempObject) {
      const lineObj: LineObject = {
        id: `${currentTool}-${Date.now()}`,
        type: currentTool,
        x1: tempObject.x1!,
        y1: tempObject.y1!,
        x2: tempObject.x2!,
        y2: tempObject.y2!,
        color,
        strokeWidth,
        visible: true,
      };
      addObject(lineObj);
      setTempObject(null);
    }

    setIsDrawing(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useStore.getState().undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        useStore.getState().redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObjectId) {
          deleteObject(selectedObjectId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId, deleteObject]);

  const getCursor = () => {
    switch (currentTool) {
      case 'select':
        return 'default';
      case 'draw':
        return 'crosshair';
      case 'eraser':
        return 'grab';
      case 'text':
        return 'text';
      default:
        return 'crosshair';
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ cursor: getCursor() }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}

