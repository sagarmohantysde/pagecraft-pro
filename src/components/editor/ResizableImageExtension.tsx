import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React, { useState, useRef, useCallback, useEffect } from 'react';

const ResizableImageComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const { src, alt, width, height } = node.attrs;
  const [dimensions, setDimensions] = useState({
    width: width || 300,
    height: height || 200,
  });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const aspectRatio = useRef(1);

  useEffect(() => {
    if (width && height) {
      setDimensions({ width, height });
      aspectRatio.current = width / height;
    }
  }, [width, height]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!width && !height) {
      const naturalWidth = Math.min(img.naturalWidth, 500);
      const ratio = img.naturalWidth / img.naturalHeight;
      const naturalHeight = naturalWidth / ratio;
      setDimensions({ width: naturalWidth, height: naturalHeight });
      aspectRatio.current = ratio;
      updateAttributes({ width: naturalWidth, height: naturalHeight });
    } else {
      aspectRatio.current = (width || img.naturalWidth) / (height || img.naturalHeight);
    }
  }, [width, height, updateAttributes]);

  // Use ref to track current dimensions during resize to avoid stale closure
  const currentDimensions = useRef(dimensions);
  useEffect(() => {
    currentDimensions.current = dimensions;
  }, [dimensions]);

  const handleResizeStart = useCallback((e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { ...currentDimensions.current };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startPos.current.x;
      
      let newWidth: number;
      if (corner.includes('e')) {
        newWidth = Math.max(50, Math.min(700, startSize.current.width + deltaX));
      } else {
        newWidth = Math.max(50, Math.min(700, startSize.current.width - deltaX));
      }
      
      const newHeight = newWidth / aspectRatio.current;
      
      setDimensions({ width: newWidth, height: newHeight });
      currentDimensions.current = { width: newWidth, height: newHeight };
    };

    const handleMouseUp = () => {
      // Use the ref to get the latest dimensions
      updateAttributes({ width: currentDimensions.current.width, height: currentDimensions.current.height });
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [updateAttributes]);

  // Update attributes when dimensions change
  useEffect(() => {
    if (dimensions.width !== width || dimensions.height !== height) {
      updateAttributes({ width: dimensions.width, height: dimensions.height });
    }
  }, [dimensions, width, height, updateAttributes]);

  return (
    <NodeViewWrapper className="resizable-image-wrapper" style={{ display: 'inline-block' }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          display: 'inline-block',
          width: dimensions.width,
          height: dimensions.height,
          outline: selected ? '2px solid #1976d2' : 'none',
          outlineOffset: '2px',
        }}
      >
        {/* Drag handle (enables reliable dragging inside the editor) */}
        {selected && (
          <div
            data-drag-handle
            contentEditable={false}
            style={{
              position: 'absolute',
              left: 6,
              top: 6,
              width: 26,
              height: 14,
              borderRadius: 999,
              background: '#1976d2',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              cursor: 'grab',
              zIndex: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              padding: '0 6px',
            }}
            title="Drag to move"
          >
            <span
              style={{
                width: 3,
                height: 3,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.9)',
              }}
            />
            <span
              style={{
                width: 3,
                height: 3,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.9)',
              }}
            />
            <span
              style={{
                width: 3,
                height: 3,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.9)',
              }}
            />
          </div>
        )}

        <img
          ref={imageRef}
          src={src}
          alt={alt || 'Document image'}
          onLoad={handleImageLoad}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            borderRadius: '4px',
          }}
          draggable={false}
        />
        {selected && (
          <>
            {/* Corner resize handles */}
            <div
              onMouseDown={(e) => handleResizeStart(e, 'se')}
              style={{
                position: 'absolute',
                right: -6,
                bottom: -6,
                width: 12,
                height: 12,
                backgroundColor: '#1976d2',
                border: '2px solid white',
                borderRadius: '50%',
                cursor: 'se-resize',
                zIndex: 10,
              }}
            />
            <div
              onMouseDown={(e) => handleResizeStart(e, 'sw')}
              style={{
                position: 'absolute',
                left: -6,
                bottom: -6,
                width: 12,
                height: 12,
                backgroundColor: '#1976d2',
                border: '2px solid white',
                borderRadius: '50%',
                cursor: 'sw-resize',
                zIndex: 10,
              }}
            />
            <div
              onMouseDown={(e) => handleResizeStart(e, 'ne')}
              style={{
                position: 'absolute',
                right: -6,
                top: -6,
                width: 12,
                height: 12,
                backgroundColor: '#1976d2',
                border: '2px solid white',
                borderRadius: '50%',
                cursor: 'ne-resize',
                zIndex: 10,
              }}
            />
            <div
              onMouseDown={(e) => handleResizeStart(e, 'nw')}
              style={{
                position: 'absolute',
                left: -6,
                top: -6,
                width: 12,
                height: 12,
                backgroundColor: '#1976d2',
                border: '2px solid white',
                borderRadius: '50%',
                cursor: 'nw-resize',
                zIndex: 10,
              }}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (options: { src: string; alt?: string; width?: number; height?: number }) => ReturnType;
    };
  }
}

export const ResizableImageExtension = Node.create({
  name: 'resizableImage',

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },

  addCommands() {
    return {
      setResizableImage:
        (options: { src: string; alt?: string; width?: number; height?: number }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
