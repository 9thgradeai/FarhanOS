import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Undo2, Redo2, Trash2, Download, Brush,
  Sparkles, Check, Eraser
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  isEraser: boolean;
}

interface WhiteboardProps {
  theme: 'dark' | 'cyberpunk' | 'ai' | 'terminal' | 'light';
  triggerSound?: (freq?: number, dur?: number) => void;
}

export default function Whiteboard({ theme, triggerSound }: WhiteboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#6366f1'); // Default Indigo
  const [brushWidth, setBrushWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [paletteType, setPaletteType] = useState<'theme' | 'classic'>('theme');
  
  // Undo/Redo histories
  const [history, setHistory] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);

  // Live brush settings mirrored into a ref so incremental segment drawing
  // never depends on stale closures.
  const brushRef = useRef({ color: '#6366f1', width: 4, isEraser: false });
  useEffect(() => {
    brushRef.current = { color: currentColor, width: brushWidth, isEraser };
  }, [currentColor, brushWidth, isEraser]);

  // In-flight stroke lives in a ref: appending points must NOT trigger React
  // re-renders (the previous implementation fully re-drew every stroke on
  // each pointermove via state updates).
  const currentStrokeRef = useRef<Point[]>([]);

  // Scale tracking for proportion restoration on resizing (optional, but absolute rendering is highly robust)
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

  // Custom theme colors for drawing choices
  const getThemeColors = () => {
    switch (theme) {
      case 'cyberpunk':
        return [
          { name: 'Neon Pink', value: '#ff007f' },
          { name: 'Matrix Green', value: '#39ff14' },
          { name: 'Neon Blue', value: '#00ffff' },
          { name: 'Cyber Purple', value: '#9d00ff' },
          { name: 'Hot Orange', value: '#ff5e00' },
          { name: 'Pure White', value: '#ffffff' }
        ];
      case 'terminal':
        return [
          { name: 'Classic Green', value: '#33ff33' },
          { name: 'Amber Glow', value: '#ffb000' },
          { name: 'Terminal White', value: '#e5e5e5' },
          { name: 'Phosphor Green', value: '#00ff66' },
          { name: 'Dim Gray', value: '#7f7f7f' }
        ];
      case 'ai':
        return [
          { name: 'Deep Cosmic', value: '#4f46e5' },
          { name: 'Quantum Cyan', value: '#06b6d4' },
          { name: 'Neural Violet', value: '#d946ef' },
          { name: 'Supernova', value: '#f43f5e' },
          { name: 'Logic White', value: '#fafafa' }
        ];
      case 'light':
        return [
          { name: 'Royal Blue', value: '#2563eb' },
          { name: 'Rose Red', value: '#dc2626' },
          { name: 'Forest Green', value: '#16a34a' },
          { name: 'Vibrant Orange', value: '#ea580c' },
          { name: 'Slate Gray', value: '#475569' },
          { name: 'Deep Charcoal', value: '#0f172a' }
        ];
      default: // dark mode
        return [
          { name: 'Indigo Aura', value: '#818cf8' },
          { name: 'Nebula Pink', value: '#f472b6' },
          { name: 'Aurora Teal', value: '#2dd4bf' },
          { name: 'Solar Yellow', value: '#fbbf24' },
          { name: 'Coral Rose', value: '#fb7185' },
          { name: 'Pure White', value: '#ffffff' }
        ];
    }
  };

  const getStandardColors = () => [
    { name: 'Pure Black', value: '#000000' },
    { name: 'Crimson Red', value: '#ef4444' },
    { name: 'Cobalt Blue', value: '#3b82f6' },
    { name: 'Emerald Green', value: '#22c55e' },
    { name: 'Amber Yellow', value: '#eab308' },
    { name: 'Pure White', value: '#ffffff' }
  ];

  const colors = useMemo(
    () => (paletteType === 'theme' ? getThemeColors() : getStandardColors()),
    [paletteType, theme]
  );

  // Pick first color as active brush when theme or palette type switches
  useEffect(() => {
    setCurrentColor(colors[0].value);
    setIsEraser(false);
  }, [theme, paletteType]);

  // Handle ResizeObserver as per precise canvas-resizing guideline rules
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      
      // Keep canvas drawing buffer sized correctly without blowing up coordinates
      const cleanWidth = Math.floor(width || 600);
      const cleanHeight = Math.floor(height || 400);

      setCanvasSize({ width: cleanWidth, height: cleanHeight });
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Update canvas properties and redraw everything when canvas size changes
  // or a stroke is committed/undone/redone/cleared. Live drawing does NOT go
  // through this path — segments are painted incrementally in paintSegment.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set actual canvas drawing surface coordinates to match current bounding container
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    redrawAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize, history]);

  // Redraw helper function
  const redrawAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background layout stylings subtly to align with transparent look
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawStroke = (stroke: Stroke | { points: Point[]; color: string; width: number; isEraser: boolean }) => {
      if (stroke.points.length < 1) return;
      
      ctx.beginPath();
      
      if (stroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
      }
      
      ctx.lineWidth = stroke.width;

      if (stroke.points.length === 1) {
        const pt = stroke.points[0];
        ctx.arc(pt.x, pt.y, stroke.width / 2, 0, 2 * Math.PI);
        ctx.fillStyle = stroke.isEraser ? 'rgba(0,0,0,1)' : stroke.color;
        ctx.fill();
      } else {
        const pt0 = stroke.points[0];
        ctx.moveTo(pt0.x, pt0.y);
        for (let i = 1; i < stroke.points.length; i++) {
          const pt = stroke.points[i];
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }
    };

    // Draw all fully finished strokes in historical timeline sequence
    history.forEach((stroke) => {
      drawStroke(stroke);
    });

    // Reset composite operation to default
    ctx.globalCompositeOperation = 'source-over';
  };

  // Paint a single new segment (or the initial dot) of an in-flight stroke.
  // This is the incremental hot path used on every pointermove.
  const paintSegment = (from: Point | null, to: Point) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const brush = brushRef.current;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = brush.isEraser ? 'destination-out' : 'source-over';
    ctx.lineWidth = brush.width;

    ctx.beginPath();
    if (!from) {
      ctx.arc(to.x, to.y, brush.width / 2, 0, 2 * Math.PI);
      ctx.fillStyle = brush.isEraser ? 'rgba(0,0,0,1)' : brush.color;
      ctx.fill();
    } else {
      if (!brush.isEraser) ctx.strokeStyle = brush.color;
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
  };

  // Convert client coordinate down to canvas relative local point
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Proportional coordinate calculation with respect to elements visual bounding box
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  // Start stroke drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setRedoStack([]); // Clear redo timeline once user starts alternative ideation pathway
    currentStrokeRef.current = [coords];
    paintSegment(null, coords);
  };

  // Draw process — appends a point to the in-flight stroke and paints only
  // the new segment directly on the canvas. No React state updates here.
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const coords = getCoordinates(e);
    if (!coords) return;

    const pts = currentStrokeRef.current;
    const prev = pts[pts.length - 1] ?? null;
    pts.push(coords);
    paintSegment(prev, coords);
  };

  // End dynamic drawing action — commit the finished stroke to history.
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const points = currentStrokeRef.current;
    currentStrokeRef.current = [];
    if (points.length > 0) {
      const brush = brushRef.current;
      setHistory(prev => [...prev, { points, color: brush.color, width: brush.width, isEraser: brush.isEraser }]);
    }
  };

  // Undo operational trigger
  const handleUndo = () => {
    if (history.length === 0) return;
    const trackingStack = [...history];
    const undone = trackingStack.pop();
    if (undone) {
      setRedoStack(prev => [...prev, undone]);
      setHistory(trackingStack);
    }
  };

  // Redo operational trigger
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const trackingStack = [...redoStack];
    const redone = trackingStack.pop();
    if (redone) {
      setHistory(prev => [...prev, redone]);
      setRedoStack(trackingStack);
    }
  };

  // Clear workspace operations
  const handleClear = () => {
    if (history.length === 0) return;
    if (confirm('Clear the entire ideation sketch pad?')) {
      setHistory([]);
      setRedoStack([]);
      currentStrokeRef.current = [];
    }
  };

  // Keyboard shortcuts promised by the button tooltips: Ctrl/Cmd+Z undo,
  // Ctrl/Cmd+Y (or Cmd+Shift+Z) redo. Skips when typing in form fields.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      const key = e.key.toLowerCase();
      if (key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo(); else handleUndo();
      } else if (key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Download drawn canvas content locally as high quality PNG image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a virtual canvas to burn an attractive solid dark backdrop, keeping transparency clean
    const backupCanvas = document.createElement('canvas');
    backupCanvas.width = canvas.width;
    backupCanvas.height = canvas.height;
    const backupCtx = backupCanvas.getContext('2d');
    if (!backupCtx) return;

    // Fill styled tech background sequence based on theme
    if (theme === 'light') {
      backupCtx.fillStyle = '#f8fafc'; // light slate
    } else if (theme === 'cyberpunk') {
      backupCtx.fillStyle = '#010206'; // pure cyber darkness
    } else if (theme === 'terminal') {
      backupCtx.fillStyle = '#050705'; // dark phospho cathode
    } else {
      backupCtx.fillStyle = '#090a12'; // deep cosmic obsidian
    }
    backupCtx.fillRect(0, 0, backupCanvas.width, backupCanvas.height);

    // Draw some subtle graph grid lines to make the ideation sketches look organic and professional!
    backupCtx.strokeStyle = theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.03)';
    backupCtx.lineWidth = 1;
    const gridSpacing = 30;
    for (let x = 0; x < backupCanvas.width; x += gridSpacing) {
      backupCtx.beginPath();
      backupCtx.moveTo(x, 0);
      backupCtx.lineTo(x, backupCanvas.height);
      backupCtx.stroke();
    }
    for (let y = 0; y < backupCanvas.height; y += gridSpacing) {
      backupCtx.beginPath();
      backupCtx.moveTo(0, y);
      backupCtx.lineTo(backupCanvas.width, y);
      backupCtx.stroke();
    }

    // Layer the user visual drawing over the grid backdrop
    backupCtx.drawImage(canvas, 0, 0);

    // Add high fidelity watermarking logo mapping FarhanOS system
    backupCtx.font = '10px monospace';
    backupCtx.fillStyle = theme === 'light' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.3)';
    backupCtx.textAlign = 'right';
    backupCtx.fillText('FARHAN KABIR CORE OS v2.4 // VISUAL IDEATION UNIT', backupCanvas.width - 20, backupCanvas.height - 20);

    // Generate down URI
    const dataUrl = backupCanvas.toDataURL('image/png');
    
    // Mock native anchor node triggers safely
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = `FarhanOS_Whiteboard_${Date.now()}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

  };

  const activeThemeClass = 
    theme === 'cyberpunk' ? 'border-[#ff007f]/40 text-pink-400 font-mono' :
    theme === 'terminal' ? 'border-[#33ff33]/40 text-[#33ff33] font-mono' :
    theme === 'ai' ? 'border-indigo-500/40 text-indigo-400 font-sans' :
    theme === 'light' ? 'border-slate-300 text-slate-800 font-sans' :
    'border-zinc-800 text-slate-200 font-sans';

  const selectColorHandler = (val: string) => {
    setCurrentColor(val);
    setIsEraser(false);
  };

  return (
    <div className="flex flex-col h-full gap-3 select-none">
      
      {/* Header controls sidebar wrapper */}
      <div className={`p-2 rounded-lg border flex flex-wrap items-center justify-between gap-3 bg-black/35 backdrop-blur-md ${activeThemeClass}`}>
        
        {/* Undo/Redo & Utility Action Set */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className={`p-1.5 rounded transition-all duration-200 ${history.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 hover:scale-110 active:scale-90 text-zinc-350 hover:text-white'}`}
            title="Undo stroke (Ctrl+Z)"
            aria-label="Undo stroke"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className={`p-1.5 rounded transition-all duration-200 ${redoStack.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 hover:scale-110 active:scale-90 text-zinc-350 hover:text-white'}`}
            title="Redo stroke (Ctrl+Y)"
            aria-label="Redo stroke"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <span className="h-4 w-px bg-zinc-850 mx-1" />

          {/* Draw/Eraser Selector Mode */}
          <button
            onClick={() => setIsEraser(false)}
            className={`p-1.5 rounded transition-all duration-200 flex items-center gap-1 cursor-pointer ${!isEraser ? 'bg-indigo-600/30 font-bold border border-indigo-500/35 text-indigo-300' : 'hover:bg-white/10 hover:scale-105 active:scale-95 text-zinc-400 hover:text-zinc-200'}`}
            title="Paint Brush Mode"
          >
            <Brush className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[9px] uppercase tracking-wider">Paint</span>
          </button>

          <button
            onClick={() => setIsEraser(true)}
            className={`p-1.5 rounded transition-all duration-200 flex items-center gap-1 cursor-pointer ${isEraser ? 'bg-indigo-600/30 font-bold border border-indigo-500/35 text-indigo-300' : 'hover:bg-white/10 hover:scale-105 active:scale-95 text-zinc-400 hover:text-zinc-200'}`}
            title="Eraser tool"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[9px] uppercase tracking-wider">Eraser</span>
          </button>
        </div>

        {/* Dynamic Color Palette Options */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-md border border-zinc-900/80 text-[9px] font-mono">
            <button
              onClick={() => setPaletteType('theme')}
              className={`px-1.5 py-0.5 rounded transition uppercase font-bold tracking-tight cursor-pointer ${paletteType === 'theme' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Switch to Theme-specific colors"
            >
              OS Aura
            </button>
            <button
              onClick={() => setPaletteType('classic')}
              className={`px-1.5 py-0.5 rounded transition uppercase font-bold tracking-tight cursor-pointer ${paletteType === 'classic' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Switch to classic drawing colors (Black, Red, Blue, Green, etc.)"
            >
              Classic
            </button>
          </div>

          <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-md border border-zinc-900">
            {colors.map((c) => {
              const isSelected = currentColor === c.value && !isEraser;
              return (
                <button
                  key={c.value}
                  onClick={() => selectColorHandler(c.value)}
                  className="relative group w-4 h-4 rounded-full transition duration-300 border border-black/50"
                  style={{ backgroundColor: c.value }}
                  title={`${c.name}`}
                >
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center scale-75 text-white filter drop-shadow">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" style={{ mixBlendMode: 'difference' }} />
                    </span>
                  )}
                  {/* Subtle color label tooltips */}
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 px-1.5 py-0.5 text-[10px] bg-zinc-950 text-white rounded opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                    {c.name}
                  </span>
                </button>
              );
            })}

            {/* Custom Spectrum Picker Option */}
            <span className="h-3 w-px bg-zinc-800 mx-1" />
            <div className="relative group w-4 h-4 rounded-full overflow-hidden border border-zinc-700/50 flex items-center justify-center bg-gradient-to-tr from-rose-500 via-emerald-500 to-sky-500 shadow-sm" title="Choose custom color spectrum">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => selectColorHandler(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="text-[10px] font-black text-white pointer-events-none filter drop-shadow-sm">+</span>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 px-1.5 py-0.5 text-[10px] bg-zinc-950 text-white rounded opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                Custom Color
              </span>
            </div>
          </div>
        </div>

        {/* Brush scale size adjustment range sliders & buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-md border border-zinc-900">
            <span className="text-[9px] text-zinc-500 font-mono select-none uppercase tracking-tight hidden xs:inline">Width: {brushWidth}px</span>
            <input
              type="range"
              min="1"
              max="40"
              value={brushWidth}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setBrushWidth(val);
              }}
              className="w-16 sm:w-20 md:w-24 accent-indigo-500 bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer"
              title="Slide to adjust brush thickness"
            />
          </div>

          <div className="flex items-center gap-1">
            {[2, 4, 8, 16].map((sz) => (
              <button
                key={sz}
                onClick={() => setBrushWidth(sz)}
                className={`w-5 h-5 rounded flex items-center justify-center transition cursor-pointer border ${brushWidth === sz ? 'bg-white/10 border-indigo-500/50 text-indigo-400' : 'border-transparent hover:bg-white/5 text-zinc-400'}`}
                title={`Brush size ${sz}px`}
              >
                <span className="relative flex items-center justify-center">
                  <span 
                    className="rounded-full bg-current" 
                    style={{ width: `${Math.max(2, sz / 1.5)}px`, height: `${Math.max(2, sz / 1.5)}px` }} 
                  />
                </span>
              </button>
            ))}
          </div>

          <span className="h-4 w-px bg-zinc-850" />

          {/* Action workspace outputs: Clear / Download Output */}
          <button
            onClick={handleClear}
            className="p-1.5 rounded transition-all duration-200 hover:bg-rose-500/20 hover:scale-110 active:scale-90 text-rose-400 hover:text-rose-300"
            title="Clear canvas"
            aria-label="Clear canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded transition-all duration-200 hover:bg-emerald-500/20 hover:scale-110 active:scale-90 text-emerald-400 hover:text-emerald-300"
            title="Download visual sketch (.png)"
            aria-label="Download sketch"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* HTML5 drawing canvas wrapper viewport */}
      <div 
        ref={containerRef}
        className={`whiteboard-canvas-container flex-1 min-h-[280px] max-h-[50vh] rounded-lg border-2 border-dashed flex relative overflow-hidden bg-black/45 shadow-inner transition-colors duration-350 cursor-crosshair ${
          theme === 'cyberpunk' ? 'border-pink-500/25 shadow-pink-500/5 bg-[#000]' :
          theme === 'terminal' ? 'border-[#33ff33]/25 shadow-emerald-500/5' :
          'border-zinc-800/80 shadow-sky-500/5'
        }`}
      >
        {/* Floating 'Clear' button at the top right of the whiteboard-canvas-container */}
        <button
          onClick={handleClear}
          disabled={history.length === 0}
          className={`absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 text-[9px] uppercase tracking-wider font-bold rounded border shadow-lg transition-all duration-200 select-none ${
            history.length === 0 
              ? 'opacity-40 cursor-not-allowed bg-zinc-900/40 text-zinc-500 border-zinc-800/40' 
              : 'hover:scale-105 active:scale-95 ' + (theme === 'cyberpunk' 
                ? 'bg-black/90 hover:bg-pink-500/20 text-pink-400 hover:text-pink-300 border-pink-500/30 hover:border-pink-500/50'
                : theme === 'terminal'
                  ? 'bg-black/90 hover:bg-[#33ff33]/20 text-[#33ff33] border-[#33ff33]/30 hover:border-[#33ff33]/50 font-mono'
                  : theme === 'light'
                    ? 'bg-white/90 hover:bg-slate-100 text-slate-800 hover:text-slate-900 border-slate-200 hover:border-slate-300'
                    : 'bg-zinc-950/90 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border-indigo-500/25 hover:border-indigo-500/45')
          }`}
          title="Clear canvas to a blank state"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear Board</span>
        </button>

        {/* Graph background grids overlay simulating a retro drafting coordinate viewport */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-screen overflow-hidden">
          <div className="w-full h-full" style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            color: theme === 'terminal' ? '#33ff33' : theme === 'cyberpunk' ? '#ff007f' : '#6366f1'
          }} />
        </div>

        {/* Empty state hint watermark */}
        {history.length === 0 && !isDrawing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
            <div className="p-3 rounded-full bg-indigo-500/5 border border-indigo-500/10 mb-2">
              <Brush className="w-6 h-6 text-indigo-400/55 animate-pulse" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-550">Visual Ideation Pad</span>
            <span className="text-[9px] text-zinc-600 mt-1">Press and drag anywhere on this sandbox grid canvas to sketch plans</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full select-none touch-none bg-transparent"
        />

        {/* Bottom coordinate indicators representing sandbox positioning info */}
        <div className="absolute bottom-2 left-2 pointer-events-none flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 border border-zinc-900/50 text-[10px] font-mono text-zinc-500">
          <span>COORDS: {canvasSize.width}x{canvasSize.height}</span>
          <span>•</span>
          <span>STROKESTACK: {history.length}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>IDEATION UNIT DEPLOYED SECURELY WITHIN THE OPERATING SYSTEM ENVIRONMENT</span>
        </div>
        <div className="text-[9px] font-mono text-zinc-500">
          v2.4.6_canvas
        </div>
      </div>

    </div>
  );
}
