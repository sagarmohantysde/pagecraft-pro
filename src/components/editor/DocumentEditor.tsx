import React, { useState, useCallback, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  TextField,
  Slider,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Remove,
  Add,
  PictureAsPdf,
} from '@mui/icons-material';
import { EditorToolbar } from './EditorToolbar';
import { DocumentPage } from './DocumentPage';
import { DocumentTemplate } from '@/types/document';
import html2pdf from 'html2pdf.js';

interface DocumentEditorProps {
  template: DocumentTemplate;
  onSave: (template: DocumentTemplate) => void;
  onBack: () => void;
  headerFooterLocked?: boolean;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  template,
  onSave,
  onBack,
  headerFooterLocked = true, // Default: template creation mode (header/footer editable)
}) => {
  const [name, setName] = useState(template.name);
  const [headerContent, setHeaderContent] = useState(template.headerContent);
  const [bodyContent, setBodyContent] = useState(template.bodyContent);
  const [footerContent, setFooterContent] = useState(template.footerContent);
  const [headerHeight, setHeaderHeight] = useState(template.headerHeight);
  const [footerHeight, setFooterHeight] = useState(template.footerHeight);
  const [zoom, setZoom] = useState(80);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  
  const pageRef = useRef<HTMLDivElement>(null);

  const handleSave = useCallback(() => {
    onSave({
      ...template,
      name,
      headerContent,
      bodyContent,
      footerContent,
      headerHeight,
      footerHeight,
    });
  }, [template, name, headerContent, bodyContent, footerContent, headerHeight, footerHeight, onSave]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!activeEditor) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      activeEditor.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);
  }, [activeEditor]);

  const handleInsertSampleImage = useCallback(async () => {
    if (!activeEditor) return;
    
    try {
      // Fetch the sample image and convert to blob
      const response = await fetch(
        'https://images.unsplash.com/photo-1761839256547-0a1cd11b6dfb?q=80&w=400&auto=format&fit=crop'
      );
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        activeEditor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error inserting sample image:', error);
    }
  }, [activeEditor]);

  const handleExportPDF = useCallback(() => {
    if (!pageRef.current) return;

    const element = pageRef.current.querySelector('.MuiPaper-root') as HTMLElement | null;
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `${name || 'document'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };

    html2pdf().set(opt).from(element).save();
  }, [name]);

  const handleZoomChange = (_: Event, value: number | number[]) => {
    setZoom(value as number);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      {/* Top Bar */}
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2 }}>
          <IconButton onClick={onBack} edge="start">
            <ArrowBack />
          </IconButton>
          
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="standard"
            placeholder="Untitled Template"
            sx={{ flex: 1, maxWidth: 300 }}
            InputProps={{
              disableUnderline: true,
              sx: { fontWeight: 500 },
            }}
          />

          <Box sx={{ flex: 1 }} />

          <Typography variant="body2" color="text.secondary">
            Header: {headerHeight.toFixed(0)}% | Footer: {footerHeight.toFixed(0)}%
          </Typography>

          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={handleExportPDF}
            sx={{ ml: 2 }}
          >
            Download PDF
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={handleSave}
          >
            Save Template
          </Button>
        </Toolbar>
      </AppBar>

      {/* Editor Toolbar */}
      <EditorToolbar
        editor={activeEditor}
        onImageUpload={handleImageUpload}
        onInsertSampleImage={handleInsertSampleImage}
      />

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          backgroundColor: 'canvas',
          overflow: 'hidden',
        }}
      >
        {/* Document Canvas */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Box ref={pageRef}>
            <DocumentPage
              headerContent={headerContent}
              bodyContent={bodyContent}
              footerContent={footerContent}
              headerHeight={headerHeight}
              footerHeight={footerHeight}
              headerFooterLocked={headerFooterLocked}
              onHeaderChange={setHeaderContent}
              onBodyChange={setBodyContent}
              onFooterChange={setFooterContent}
              onHeaderHeightChange={setHeaderHeight}
              onFooterHeightChange={setFooterHeight}
              onHeaderEditorReady={(editor) => !headerFooterLocked && setActiveEditor(editor)}
              onBodyEditorReady={(editor) => headerFooterLocked && setActiveEditor(editor)}
              onFooterEditorReady={(editor) => !headerFooterLocked && setActiveEditor(editor)}
              zoom={zoom}
              pageNumber={1}
            />
          </Box>
        </Box>

        {/* Zoom Controls */}
        <Box
          sx={{
            position: 'fixed',
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            backgroundColor: 'background.paper',
            p: 1,
            borderRadius: 1,
            boxShadow: 2,
          }}
        >
          <Tooltip title="Zoom In" placement="left">
            <IconButton
              size="small"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
            >
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            {zoom}%
          </Typography>
          
          <Tooltip title="Zoom Out" placement="left">
            <IconButton
              size="small"
              onClick={() => setZoom(Math.max(25, zoom - 10))}
            >
              <Remove fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};
