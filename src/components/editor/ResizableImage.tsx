import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ResizableImageProps {
  src: string;
  alt?: string;
  initialWidth?: number;
  initialHeight?: number;
  maxWidth?: number;
  onResize?: (width: number, height: number) => void;
  selected?: boolean;
  onSelect?: () => void;
  alignment?: 'left' | 'center' | 'right';
}

export const ResizableImage: React.FC<ResizableImageProps> = ({
  src,
  alt = 'Document image',
  initialWidth,
  initialHeight,
  maxWidth = 600,
  onResize,
  selected = false,
  onSelect,
  alignment = 'left',
}) => {
  const [dimensions, setDimensions] = useState({
    width: initialWidth || 200,
    height: initialHeight || 150,
  });
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const aspectRatio = useRef(dimensions.width / dimensions.height);

  const handleMouseDown = useCallback((e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { ...dimensions };
    aspectRatio.current = dimensions.width / dimensions.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startPos.current.x;
      const deltaY = moveEvent.clientY - startPos.current.y;
      
      let newWidth = startSize.current.width;
      let newHeight = startSize.current.height;

      if (corner.includes('e')) {
        newWidth = Math.max(50, Math.min(maxWidth, startSize.current.width + deltaX));
        newHeight = newWidth / aspectRatio.current;
      } else if (corner.includes('w')) {
        newWidth = Math.max(50, Math.min(maxWidth, startSize.current.width - deltaX));
        newHeight = newWidth / aspectRatio.current;
      }

      setDimensions({ width: newWidth, height: newHeight });
      onResize?.(newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dimensions, maxWidth, onResize]);

  useEffect(() => {
    if (initialWidth && initialHeight) {
      setDimensions({ width: initialWidth, height: initialHeight });
      aspectRatio.current = initialWidth / initialHeight;
    }
  }, [initialWidth, initialHeight]);

  const alignmentClasses = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  };

  return (
    <div
      ref={imageRef}
      className={`relative inline-block ${alignmentClasses[alignment]} ${selected ? 'ring-2 ring-primary' : ''}`}
      style={{ width: dimensions.width, height: dimensions.height }}
      onClick={onSelect}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover rounded"
        draggable={false}
      />
      {selected && (
        <>
          <div
            className="resize-handle se"
            onMouseDown={(e) => handleMouseDown(e, 'se')}
          />
          <div
            className="resize-handle sw"
            onMouseDown={(e) => handleMouseDown(e, 'sw')}
          />
          <div
            className="resize-handle ne"
            onMouseDown={(e) => handleMouseDown(e, 'ne')}
          />
          <div
            className="resize-handle nw"
            onMouseDown={(e) => handleMouseDown(e, 'nw')}
          />
        </>
      )}
    </div>
  );
};
