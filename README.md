# DrawSync Studio

A collaborative whiteboard application with real-time drawing, shapes, text, and export features - perfect for remote teams and brainstorming sessions.

## Features

### Drawing Tools
- **Freehand Drawing** - Draw with adjustable brush sizes (1-20px) and colors
- **Shapes** - Rectangle and circle tools with customizable stroke and fill colors
- **Lines & Arrows** - Draw straight lines and arrows
- **Text Tool** - Add text with customizable fonts and sizes
- **Eraser** - Remove objects by clicking on them
- **Selection Tool** - Select and move objects around the canvas

### Canvas Features
- **Multiple Pages/Slides** - Create and navigate between multiple canvas pages
- **Layers Panel** - View all objects with visibility toggles
- **Undo/Redo** - Full history support with 50+ steps (Ctrl+Z / Ctrl+Y)
- **Grid System** - Toggle grid visibility and snap-to-grid functionality
- **Responsive Design** - Canvas adapts to screen size while maintaining aspect ratio

### Export Options
- **PNG Export** - Download canvas as PNG image
- **SVG Export** - Export as scalable vector graphics

### Keyboard Shortcuts
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Y` - Redo
- `Delete` / `Backspace` - Delete selected object

### UI Features
- **Toolbar** - Quick access to all tools, colors, and settings
- **Properties Panel** - Edit object properties when selected
- **History Timeline** - View drawing history
- **Grid Controls** - Configure grid settings
- **Local Storage** - Automatically saves your work

## Tech Stack

- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Canvas API** - Drawing functionality
- **Tailwind CSS** - Styling
- **Zustand** - State management with persistence

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Usage

1. **Select a Tool** - Click on any tool in the left toolbar
2. **Choose Color** - Use the color picker or preset colors
3. **Adjust Size** - Use the brush size slider
4. **Draw** - Click and drag on the canvas to draw
5. **Select Objects** - Use the select tool to move or edit objects
6. **Manage Layers** - Use the layers panel to toggle visibility or delete objects
7. **Export** - Click the download button to export as PNG or SVG

## Project Structure

```
DrawSync-Studio/
├── app/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/
│   ├── Canvas.tsx        # Main canvas component
│   ├── Toolbar.tsx       # Left toolbar
│   ├── LayersPanel.tsx   # Layers sidebar
│   ├── RightPanel.tsx    # Properties/history/grid panel
│   └── PageNavigator.tsx # Page navigation
├── store/
│   └── useStore.ts       # Zustand store with persistence
├── types/
│   └── index.ts          # TypeScript type definitions
└── package.json
```

## Features in Detail

### Drawing Tools
- All drawing operations are optimized for performance
- Smooth freehand drawing with path optimization
- Real-time preview while drawing shapes

### State Management
- Zustand store with localStorage persistence
- Separate history for each page
- Efficient state updates

### Canvas Rendering
- High-DPI support with device pixel ratio
- Optimized rendering with requestAnimationFrame
- Grid overlay with customizable size

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

