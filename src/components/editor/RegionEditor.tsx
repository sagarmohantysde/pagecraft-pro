import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Box, Typography } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { RegionProps } from '@/types/document';
import { ResizableImageExtension } from './ResizableImageExtension';
import { FontSizeExtension } from './FontSizeExtension';

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
      Underline,
      TextStyle,
      FontFamily,
      FontSizeExtension,
    ],
    content: content || '',
    editable: !locked,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => {
      onFocus?.();
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!locked);
    }
  }, [locked, editor]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (!onHeightChange) return;
    
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height || 15;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const containerHeight = window.innerHeight;
      const deltaPercent = (deltaY / containerHeight) * 100;
      
      let newHeight: number;
      if (handlePosition === 'bottom') {
        newHeight = Math.max(5, Math.min(40, startHeight + deltaPercent));
      } else {
        newHeight = Math.max(5, Math.min(40, startHeight - deltaPercent));
      }
      
      onHeightChange(newHeight);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [height, onHeightChange, handlePosition]);

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

  return (
    <Box
      className="region-container"
      sx={{
        position: 'relative',
        height: type === 'body' ? 'auto' : `${height}%`,
        flex: type === 'body' ? 1 : 'none',
        minHeight: type === 'body' ? 0 : 60,
        overflow: 'hidden',
        ...regionStyles[type],
        ...(locked && {
          backgroundColor: 'action.disabledBackground',
          opacity: 0.7,
        }),
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
