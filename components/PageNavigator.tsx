'use client';

import { useStore } from '@/store/useStore';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PageNavigator() {
  const { pages, currentPage, addPage, switchPage, deletePage } = useStore();

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-800">DrawSync Studio</h2>
        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
          Page {currentPage + 1} of {pages.length}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => switchPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Previous Page"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-1 px-2">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => switchPage(index)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                index === currentPage
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => switchPage(Math.min(pages.length - 1, currentPage + 1))}
          disabled={currentPage === pages.length - 1}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === pages.length - 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Next Page"
        >
          <ChevronRight size={20} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button
          onClick={addPage}
          className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          title="Add New Page"
        >
          <Plus size={20} />
        </button>

        {pages.length > 1 && (
          <button
            onClick={() => {
              if (confirm(`Delete page ${currentPage + 1}?`)) {
                deletePage(currentPage);
              }
            }}
            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            title="Delete Current Page"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

