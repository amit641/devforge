import { ReactNode, useEffect, useRef, useState } from 'react';

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  initial?: number;
  min?: number;
  max?: number;
}

export function SplitPane({ left, right, initial = 50, min = 20, max = 80 }: SplitPaneProps) {
  const [pct, setPct] = useState(initial);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const next = ((e.clientX - rect.left) / rect.width) * 100;
      setPct(Math.max(min, Math.min(max, next)));
    }
    function onUp() {
      draggingRef.current = false;
      document.body.style.cursor = '';
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [min, max]);

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      <div style={{ width: `${pct}%` }} className="overflow-hidden">
        {left}
      </div>
      <div
        className="splitter-v shrink-0"
        onMouseDown={() => {
          draggingRef.current = true;
          document.body.style.cursor = 'col-resize';
        }}
      />
      <div style={{ width: `${100 - pct}%` }} className="overflow-hidden">
        {right}
      </div>
    </div>
  );
}
