import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CanvasObject, Tool, CanvasState } from '@/types';

interface StoreState extends CanvasState {
  // Actions
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  addObject: (object: CanvasObject) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  deleteObject: (id: string) => void;
  setSelectedObject: (id: string | null) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  toggleObjectVisibility: (id: string) => void;
  addPage: () => void;
  switchPage: (pageIndex: number) => void;
  deletePage: (pageIndex: number) => void;
}

const MAX_HISTORY = 50;

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      objects: [],
      selectedObjectId: null,
      currentTool: 'draw',
      color: '#000000',
      strokeWidth: 3,
      fontSize: 16,
      fontFamily: 'Arial',
      history: [[]],
      historyIndex: 0,
      gridEnabled: false,
      snapToGrid: false,
      gridSize: 20,
      currentPage: 0,
      pages: [[]],

      // Actions
      setTool: (tool) => set({ currentTool: tool, selectedObjectId: null }),

      setColor: (color) => set({ color }),

      setStrokeWidth: (width) => set({ strokeWidth: width }),

      setFontSize: (size) => set({ fontSize: size }),

      setFontFamily: (family) => set({ fontFamily: family }),

      addObject: (object) => {
        const state = get();
        const newObjects = [...state.objects, object];
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newObjects);
        
        // Limit history size
        const limitedHistory = newHistory.slice(-MAX_HISTORY);
        
        set({
          objects: newObjects,
          history: limitedHistory,
          historyIndex: limitedHistory.length - 1,
        });
        
        // Update current page
        const pages = [...state.pages];
        pages[state.currentPage] = newObjects;
        set({ pages });
      },

      updateObject: (id, updates) => {
        const state = get();
        const newObjects = state.objects.map((obj) =>
          obj.id === id ? { ...obj, ...updates } : obj
        );
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newObjects);
        
        const limitedHistory = newHistory.slice(-MAX_HISTORY);
        
        set({
          objects: newObjects,
          history: limitedHistory,
          historyIndex: limitedHistory.length - 1,
        });
        
        const pages = [...state.pages];
        pages[state.currentPage] = newObjects;
        set({ pages });
      },

      deleteObject: (id) => {
        const state = get();
        const newObjects = state.objects.filter((obj) => obj.id !== id);
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newObjects);
        
        const limitedHistory = newHistory.slice(-MAX_HISTORY);
        
        set({
          objects: newObjects,
          selectedObjectId: null,
          history: limitedHistory,
          historyIndex: limitedHistory.length - 1,
        });
        
        const pages = [...state.pages];
        pages[state.currentPage] = newObjects;
        set({ pages });
      },

      setSelectedObject: (id) => set({ selectedObjectId: id }),

      clearCanvas: () => {
        const state = get();
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([]);
        
        const limitedHistory = newHistory.slice(-MAX_HISTORY);
        
        set({
          objects: [],
          selectedObjectId: null,
          history: limitedHistory,
          historyIndex: limitedHistory.length - 1,
        });
        
        const pages = [...state.pages];
        pages[state.currentPage] = [];
        set({ pages });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          const newObjects = state.history[newIndex];
          set({
            objects: newObjects,
            historyIndex: newIndex,
            selectedObjectId: null,
          });
          
          const pages = [...state.pages];
          pages[state.currentPage] = newObjects;
          set({ pages });
        }
      },

      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          const newObjects = state.history[newIndex];
          set({
            objects: newObjects,
            historyIndex: newIndex,
            selectedObjectId: null,
          });
          
          const pages = [...state.pages];
          pages[state.currentPage] = newObjects;
          set({ pages });
        }
      },

      toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),

      toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

      setGridSize: (size) => set({ gridSize: size }),

      toggleObjectVisibility: (id) => {
        const state = get();
        const obj = state.objects.find((o) => o.id === id);
        if (obj) {
          get().updateObject(id, { visible: !obj.visible });
        }
      },

      addPage: () => {
        const state = get();
        // Save current page before adding new one
        const pages = [...state.pages];
        pages[state.currentPage] = state.objects;
        const newPages = [...pages, []];
        set({ pages: newPages });
      },

      switchPage: (pageIndex) => {
        const state = get();
        if (pageIndex >= 0 && pageIndex < state.pages.length) {
          // Save current page
          const pages = [...state.pages];
          pages[state.currentPage] = state.objects;
          
          // Load new page and reset history for that page
          const newPageObjects = pages[pageIndex] || [];
          set({
            currentPage: pageIndex,
            objects: newPageObjects,
            selectedObjectId: null,
            pages,
            history: [newPageObjects],
            historyIndex: 0,
          });
        }
      },

      deletePage: (pageIndex) => {
        const state = get();
        if (state.pages.length > 1 && pageIndex !== state.currentPage) {
          const newPages = state.pages.filter((_, i) => i !== pageIndex);
          set({ pages: newPages });
        } else if (state.pages.length > 1 && pageIndex === state.currentPage) {
          const newPages = state.pages.filter((_, i) => i !== pageIndex);
          const newCurrentPage = Math.min(pageIndex, newPages.length - 1);
          set({
            pages: newPages,
            currentPage: newCurrentPage,
            objects: newPages[newCurrentPage] || [],
            selectedObjectId: null,
          });
        }
      },
    }),
    {
      name: 'drawsync-studio-storage',
      partialize: (state) => ({
        pages: state.pages,
        currentPage: state.currentPage,
        color: state.color,
        strokeWidth: state.strokeWidth,
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        gridEnabled: state.gridEnabled,
        snapToGrid: state.snapToGrid,
        gridSize: state.gridSize,
      }),
    }
  )
);

