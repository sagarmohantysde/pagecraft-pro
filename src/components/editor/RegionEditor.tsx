import React, { useEffect, useCallback, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Box, Typography } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { RegionProps } from '@/types/document';
import { ResizableImageExtension } from './ResizableImageExtension';
import { FontSizeExtension } from './FontSizeExtension';
import { useRegionContentMinHeightPct } from './useRegionContentMinHeightPct';

interface RegionEditorProps extends RegionProps {
  type: 'header' | 'body' | 'footer';
  onEditorReady?: (editor: any) => void;
  onFocus?: () => void;
}

export const RegionEditor: React.FC<RegionEditorProps> = ({
  type,
  content,
  onChange,
  locked = false,
  height,
  onHeightChange,
  placeholder,
  showResizeHandle = false,
  handlePosition = 'bottom',
  onEditorReady,
  onFocus,
}) => {
  const lastEmittedHtmlRef = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      ResizableImageExtension,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontFamily,
      FontSizeExtension,
    ],
    content: content || '',
    editable: !locked,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedHtmlRef.current = html;
      onChange(html);
    },
    onFocus: () => {
      onFocus?.();
    },
    editorProps: {
      // Prevent dragging content between header/body/footer editors.
      handleDrop: (_view, _event, _slice, moved) => {
        if (!moved) return true;
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor) return;
    const incoming = content || '';

    // If this change originated from this editor instance, don't re-apply content
    // (prevents selection/position resets during image resize, etc.).
    if (lastEmittedHtmlRef.current && incoming === lastEmittedHtmlRef.current) return;

    const current = editor.getHTML();
    if (incoming !== current) {
      // Don't emit update events when syncing external content into the editor.
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!locked);
    }
  }, [locked, editor]);

  const headerFooterMinHeightPct = useRegionContentMinHeightPct({
    type,
    editor,
    a4HeightPx: 1123,
    minPx: 60,
    maxPct: 40,
    // matches the padding inside the content wrapper Box (p: 2)
    extraPx: 32,
  });

  const minResizeHeightPct = useMemo(() => {
    if (type === 'body') return 0;
    return Math.max(5, headerFooterMinHeightPct || 0);
  }, [headerFooterMinHeightPct, type]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (!onHeightChange) return;

    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height || 15;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      // Region heights are defined relative to the A4 page height, not viewport height.
      const a4Height = 1123;
      const deltaPercent = (deltaY / a4Height) * 100;

      let newHeight: number;
      const minPct = type === 'body' ? 5 : minResizeHeightPct;

      if (handlePosition === 'bottom') {
        newHeight = Math.max(minPct, Math.min(40, startHeight + deltaPercent));
      } else {
        newHeight = Math.max(minPct, Math.min(40, startHeight - deltaPercent));
      }

      onHeightChange(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [height, minResizeHeightPct, onHeightChange, handlePosition, type]);

  const clampedHeight = useMemo(() => {
    if (type === 'body') return height;
    const raw = height ?? 15;
    return Math.max(raw, headerFooterMinHeightPct || 0);
  }, [headerFooterMinHeightPct, height, type]);

  const getPlaceholderText = () => {
    if (placeholder) return placeholder;
    switch (type) {
      case 'header':
        return 'Click to edit header... Add your logo, clinic name, or letterhead';
      case 'footer':
        return 'Click to edit footer... Add contact info, page numbers, etc.';
      default:
        return 'Start typing your content here...';
    }
  };

  const regionStyles = {
    header: {
      borderBottom: '1px solid',
      borderColor: 'divider',
    },
    body: {},
    footer: {
      borderTop: '1px solid',
      borderColor: 'divider',
    },
  };

  // Calculate pixel height from percentage for header/footer
  const getRegionHeight = () => {
    if (type === 'body') return 'auto';
    // A4 height is 1123px, calculate percentage
    const a4Height = 1123;
    return `${(clampedHeight || 15) * a4Height / 100}px`;
  };

  return (
    <Box
      className="region-container"
      sx={{
        position: 'relative',
        height: getRegionHeight(),
        flex: type === 'body' ? 1 : 'none',
        minHeight: type === 'body' ? 0 : 60,
        overflow: 'hidden',
        ...regionStyles[type],
        ...(locked && {
          backgroundColor: 'action.disabledBackground',
          opacity: 0.7,
        }),
      }}
      onMouseDownCapture={() => {
        if (!locked) onFocus?.();
      }}
    >
      {/* Resize Handle */}
      {showResizeHandle && !locked && (
        <Box
          onMouseDown={handleResizeStart}
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            [handlePosition]: -4,
            width: 60,
            height: 8,
            backgroundColor: 'primary.main',
            borderRadius: 1,
            cursor: 'ns-resize',
            opacity: 0.5,
            zIndex: 10,
            '&:hover': {
              opacity: 1,
            },
          }}
        />
      )}

      {/* Locked Overlay */}
      {locked && type === 'body' && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            color: 'text.disabled',
            zIndex: 5,
          }}
        >
          <Lock sx={{ fontSize: 40 }} />
          <Typography variant="body2">
            Body is locked during template creation
          </Typography>
        </Box>
      )}

      {/* Editor Content */}
      <Box
        sx={{
          height: '100%',
          overflow: 'auto',
          p: 2,
          '& .ProseMirror': {
            outline: 'none',
            minHeight: '100%',
            '&:empty::before': {
              content: `"${getPlaceholderText()}"`,
              color: 'primary.main',
              fontStyle: 'normal',
              pointerEvents: 'none',
            },
          },
          '& .ProseMirror p.is-editor-empty:first-child::before': {
            content: `"${getPlaceholderText()}"`,
            color: 'primary.main',
            fontStyle: 'normal',
            pointerEvents: 'none',
            float: 'left',
            height: 0,
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
};
