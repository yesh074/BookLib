import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Download, Copy, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface MermaidDiagramProps {
  chart: string;
  description?: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, description }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'neutral',
      fontFamily: 'Inter, sans-serif',
      securityLevel: 'loose'
    });

    let isMounted = true;
    const renderDiagram = async () => {
      try {
        setError(null);
        const uniqueId = `mermaid-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const { svg } = await mermaid.render(uniqueId, chart);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.error('[Mermaid Render Error]:', err);
        if (isMounted) {
          setError('Failed to render diagram. Code syntax might be invalid.');
        }
      }
    };

    if (chart) {
      renderDiagram();
    }

    return () => {
      isMounted = false;
    };
  }, [chart, theme]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge_map_${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`notion-card p-4 flex flex-col justify-between transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl overflow-auto' : 'relative min-h-[400px]'
      }`}
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 dark:border-stone-800 text-xs">
        <span className="font-mono text-stone-500 dark:text-stone-400">Visual Knowledge Map</span>

        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
          <button
            onClick={() => setZoom(prev => Math.min(2, prev + 0.15))}
            className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-300"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.15))}
            className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-300"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />
          <button
            onClick={handleCopyCode}
            className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-300 flex items-center gap-1"
            title="Copy Mermaid Source Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownloadSVG}
            className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-300"
            title="Download SVG Diagram"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-300"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* SVG Container */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4 bg-stone-50/50 dark:bg-stone-900/30 rounded-lg min-h-[320px]">
        {error ? (
          <div className="text-center text-red-500 text-xs p-4">
            <p className="font-semibold mb-1">{error}</p>
            <pre className="text-[10px] text-stone-400 bg-stone-100 dark:bg-stone-800 p-2 rounded max-w-full overflow-x-auto text-left">
              {chart}
            </pre>
          </div>
        ) : svgContent ? (
          <div
            ref={containerRef}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            className="transition-transform duration-150 ease-out max-w-full"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Rendering diagram...</span>
          </div>
        )}
      </div>

      {description && (
        <p className="mt-3 text-xs text-stone-500 dark:text-stone-400 italic text-center">
          {description}
        </p>
      )}
    </div>
  );
};
