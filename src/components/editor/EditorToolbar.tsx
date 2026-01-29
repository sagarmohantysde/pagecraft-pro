import React, { useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import {
  Box,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Divider,
  Tooltip,
  SelectChangeEvent,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  Undo,
  Redo,
  Image as ImageIcon,
} from '@mui/icons-material';

interface EditorToolbarProps {
  editor: Editor | null;
  onImageUpload?: (file: File) => void;
  onInsertSampleImage?: () => void;
}

const fontFamilies = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
];

const fontSizeOptions = [
  { value: '12px', label: '12' },
  { value: '14px', label: '14' },
  { value: '16px', label: '16' },
  { value: '18px', label: '18' },
  { value: '20px', label: '20' },
  { value: '24px', label: '24' },
  { value: '28px', label: '28' },
  { value: '32px', label: '32' },
  { value: '36px', label: '36' },
  { value: '48px', label: '48' },
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  onImageUpload,
  onInsertSampleImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFontFamilyChange = useCallback((e: SelectChangeEvent<string>) => {
    const family = e.target.value;
    if (editor) {
      editor.chain().focus().setFontFamily(family).run();
    }
  }, [editor]);

  const handleFontSizeChange = useCallback((e: SelectChangeEvent<string>) => {
    const size = e.target.value;
    if (editor) {
      editor.chain().focus().setFontSize(size).run();
    }
  }, [editor]);

  if (!editor) return null;

  const currentFontFamily = editor.getAttributes('textStyle').fontFamily || 'Arial';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
    e.target.value = '';
  };

  const ToolbarButton = ({ 
    icon, 
    onClick, 
    active = false, 
    tooltip 
  }: {
    icon: React.ReactNode; 
    onClick: () => void; 
    active?: boolean;
    tooltip: string;
  }) => (
    <Tooltip title={tooltip}>
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          color: active ? 'primary.main' : 'text.secondary',
          backgroundColor: active ? 'action.selected' : 'transparent',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        p: 1,
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        flexWrap: 'wrap',
      }}
    >
      {/* Undo/Redo */}
      <ToolbarButton
        icon={<Undo fontSize="small" />}
        onClick={() => editor.chain().focus().undo().run()}
        tooltip="Undo"
      />
      <ToolbarButton
        icon={<Redo fontSize="small" />}
        onClick={() => editor.chain().focus().redo().run()}
        tooltip="Redo"
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      {/* Font Family */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={currentFontFamily}
          onChange={handleFontFamilyChange}
          sx={{ fontSize: '0.875rem' }}
        >
          {fontFamilies.map((font) => (
            <MenuItem key={font.value} value={font.value} sx={{ fontFamily: font.value }}>
              {font.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Font Size */}
      <FormControl size="small" sx={{ minWidth: 70 }}>
        <Select
          value={editor.getAttributes('textStyle').fontSize || '16px'}
          onChange={handleFontSizeChange}
          sx={{ fontSize: '0.875rem' }}
        >
          {fontSizeOptions.map((size) => (
            <MenuItem key={size.value} value={size.value}>
              {size.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      {/* Text Formatting */}
      <ToolbarButton
        icon={<FormatBold fontSize="small" />}
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        tooltip="Bold"
      />
      <ToolbarButton
        icon={<FormatItalic fontSize="small" />}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        tooltip="Italic"
      />
      <ToolbarButton
        icon={<FormatUnderlined fontSize="small" />}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        tooltip="Underline"
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      {/* Lists */}
      <ToolbarButton
        icon={<FormatListBulleted fontSize="small" />}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        tooltip="Bullet List"
      />
      <ToolbarButton
        icon={<FormatListNumbered fontSize="small" />}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        tooltip="Numbered List"
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      {/* Alignment */}
      <ToolbarButton
        icon={<FormatAlignLeft fontSize="small" />}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        tooltip="Align Left"
      />
      <ToolbarButton
        icon={<FormatAlignCenter fontSize="small" />}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        tooltip="Align Center"
      />
      <ToolbarButton
        icon={<FormatAlignRight fontSize="small" />}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        tooltip="Align Right"
      />
      <ToolbarButton
        icon={<FormatAlignJustify fontSize="small" />}
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        active={editor.isActive({ textAlign: 'justify' })}
        tooltip="Justify"
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      {/* Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Tooltip title="Insert Image from File">
        <IconButton
          size="small"
          onClick={() => fileInputRef.current?.click()}
          sx={{ color: 'text.secondary' }}
        >
          <ImageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {onInsertSampleImage && (
        <Tooltip title="Insert Sample Image">
          <IconButton
            size="small"
            onClick={onInsertSampleImage}
            sx={{ color: 'primary.main' }}
          >
            <ImageIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};
