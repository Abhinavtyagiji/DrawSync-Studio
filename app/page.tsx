'use client';

import { useEffect, useState } from 'react';
import Canvas from '@/components/Canvas';
import Toolbar from '@/components/Toolbar';
import LayersPanel from '@/components/LayersPanel';
import RightPanel from '@/components/RightPanel';
import PageNavigator from '@/components/PageNavigator';
import { useStore } from '@/store/useStore';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const { currentPage, pages, objects } = useStore();

  // Ensure component only renders on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load current page on mount and when page changes
  useEffect(() => {
    if (!isMounted) return;
    
    const state = useStore.getState();
    if (state.pages.length > 0) {
      const currentPageObjects = state.pages[state.currentPage] || [];
      if (JSON.stringify(currentPageObjects) !== JSON.stringify(state.objects)) {
        useStore.setState({
          objects: currentPageObjects,
          history: [currentPageObjects],
          historyIndex: 0,
        });
      }
    }
  }, [currentPage, isMounted]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50 items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Left Sidebar - Toolbar */}
      <Toolbar />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar - Page Navigator */}
        <PageNavigator />

        {/* Canvas Container */}
        <div className="flex-1 relative overflow-hidden">
          <Canvas />
        </div>
      </div>

      {/* Right Sidebar - Layers */}
      <LayersPanel />

      {/* Right Panel - History, Properties, Grid */}
      <RightPanel />
    </div>
  );
}

