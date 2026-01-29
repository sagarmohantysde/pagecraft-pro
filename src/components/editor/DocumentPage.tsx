import React from 'react';
import { Box, Paper } from '@mui/material';
import { RegionEditor } from './RegionEditor';
import { Editor } from '@tiptap/react';

interface DocumentPageProps {
  headerContent: string;
  bodyContent: string;
  footerContent: string;
  headerHeight: number;
  footerHeight: number;
  headerFooterLocked: boolean;
  onHeaderChange: (content: string) => void;
  onBodyChange: (content: string) => void;
  onFooterChange: (content: string) => void;
  onHeaderHeightChange: (height: number) => void;
  onFooterHeightChange: (height: number) => void;
  onHeaderEditorReady?: (editor: Editor) => void;
  onBodyEditorReady?: (editor: Editor) => void;
  onFooterEditorReady?: (editor: Editor) => void;
  onHeaderFocus?: () => void;
  onBodyFocus?: () => void;
  onFooterFocus?: () => void;
  zoom: number;
  pageNumber?: number;
}

// A4 dimensions at 96 DPI
const A4_WIDTH = 794; // ~210mm at 96 DPI
const A4_HEIGHT = 1123; // ~297mm at 96 DPI

export const DocumentPage: React.FC<DocumentPageProps> = ({
  headerContent,
  bodyContent,
  footerContent,
  headerHeight,
  footerHeight,
  headerFooterLocked,
  onHeaderChange,
  onBodyChange,
  onFooterChange,
  onHeaderHeightChange,
  onFooterHeightChange,
  onHeaderEditorReady,
  onBodyEditorReady,
  onFooterEditorReady,
  onHeaderFocus,
  onBodyFocus,
  onFooterFocus,
  zoom,
  pageNumber = 1,
}) => {
  // When headerFooterLocked = true: header/footer are locked, body is editable
  // When headerFooterLocked = false: header/footer are editable, body shows locked overlay
  const bodyLocked = !headerFooterLocked;

  return (
    <Box
      sx={{
        position: 'relative',
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'top center',
      }}
    >
      {/* Page Number */}
      <Box
        sx={{
          position: 'absolute',
          right: -40,
          top: 8,
          color: 'primary.main',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        {pageNumber}
      </Box>

      <Paper
        elevation={3}
        sx={{
          width: A4_WIDTH,
          minHeight: A4_HEIGHT,
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header Region */}
        <RegionEditor
          type="header"
          content={headerContent}
          onChange={onHeaderChange}
          locked={headerFooterLocked}
          height={headerHeight}
          onHeightChange={onHeaderHeightChange}
          showResizeHandle={!headerFooterLocked}
          handlePosition="bottom"
          onEditorReady={onHeaderEditorReady}
          onFocus={onHeaderFocus}
        />

        {/* Body Region */}
        <RegionEditor
          type="body"
          content={bodyContent}
          onChange={onBodyChange}
          locked={bodyLocked}
          onEditorReady={onBodyEditorReady}
          onFocus={onBodyFocus}
        />

        {/* Footer Region */}
        <RegionEditor
          type="footer"
          content={footerContent}
          onChange={onFooterChange}
          locked={headerFooterLocked}
          height={footerHeight}
          onHeightChange={onFooterHeightChange}
          showResizeHandle={!headerFooterLocked}
          handlePosition="top"
          onEditorReady={onFooterEditorReady}
          onFocus={onFooterFocus}
        />
      </Paper>
    </Box>
  );
};
