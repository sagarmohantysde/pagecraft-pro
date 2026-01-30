import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Stack, Typography } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { DocumentPage } from './DocumentPage';
import { Editor } from '@tiptap/react';

interface PageData {
  id: string;
  bodyContent: string;
}

interface MultiPageDocumentProps {
  headerContent: string;
  footerContent: string;
  headerHeight: number;
  footerHeight: number;
  headerFooterLocked: boolean;
  onHeaderChange: (content: string) => void;
  onFooterChange: (content: string) => void;
  onHeaderHeightChange: (height: number) => void;
  onFooterHeightChange: (height: number) => void;
  onHeaderEditorReady?: (editor: Editor) => void;
  onFooterEditorReady?: (editor: Editor) => void;
  onHeaderFocus?: () => void;
  onFooterFocus?: () => void;
  onBodyEditorReady?: (editor: Editor, pageIndex: number) => void;
  onBodyFocus?: (pageIndex: number) => void;
  onPagesChange?: (pages: PageData[]) => void;
  zoom: number;
  initialPages?: PageData[];
}

export const MultiPageDocument: React.FC<MultiPageDocumentProps> = ({
  headerContent,
  footerContent,
  headerHeight,
  footerHeight,
  headerFooterLocked,
  onHeaderChange,
  onFooterChange,
  onHeaderHeightChange,
  onFooterHeightChange,
  onHeaderEditorReady,
  onFooterEditorReady,
  onHeaderFocus,
  onFooterFocus,
  onBodyEditorReady,
  onBodyFocus,
  onPagesChange,
  zoom,
  initialPages,
}) => {
  const [pages, setPages] = useState<PageData[]>(
    initialPages || [{ id: crypto.randomUUID(), bodyContent: '' }]
  );

  const addPage = () => {
    const newPages = [...pages, { id: crypto.randomUUID(), bodyContent: '' }];
    setPages(newPages);
    onPagesChange?.(newPages);
  };

  const deletePage = (pageId: string) => {
    if (pages.length <= 1) return;
    const newPages = pages.filter(p => p.id !== pageId);
    setPages(newPages);
    onPagesChange?.(newPages);
  };

  const updatePageContent = (pageId: string, content: string) => {
    const newPages = pages.map(p => 
      p.id === pageId ? { ...p, bodyContent: content } : p
    );
    setPages(newPages);
    onPagesChange?.(newPages);
  };

  return (
    <Stack spacing={4} alignItems="center">
      {pages.map((page, index) => (
        <Box key={page.id} sx={{ position: 'relative' }}>
          {/* Page Controls */}
          <Box
            sx={{
              position: 'absolute',
              right: -60,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              zIndex: 10,
            }}
          >
            <Tooltip title="Add Page After" placement="right">
              <IconButton
                size="small"
                onClick={addPage}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Tooltip>
            {pages.length > 1 && (
              <Tooltip title="Delete Page" placement="right">
                <IconButton
                  size="small"
                  onClick={() => deletePage(page.id)}
                  sx={{
                    backgroundColor: 'error.main',
                    color: 'error.contrastText',
                    '&:hover': {
                      backgroundColor: 'error.dark',
                    },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <DocumentPage
            headerContent={headerContent}
            bodyContent={page.bodyContent}
            footerContent={footerContent}
            headerHeight={headerHeight}
            footerHeight={footerHeight}
            headerFooterLocked={headerFooterLocked}
            onHeaderChange={onHeaderChange}
            onBodyChange={(content) => updatePageContent(page.id, content)}
            onFooterChange={onFooterChange}
            onHeaderHeightChange={onHeaderHeightChange}
            onFooterHeightChange={onFooterHeightChange}
            onHeaderEditorReady={index === 0 ? onHeaderEditorReady : undefined}
            onBodyEditorReady={(editor) => onBodyEditorReady?.(editor, index)}
            onFooterEditorReady={index === 0 ? onFooterEditorReady : undefined}
            onHeaderFocus={onHeaderFocus}
            onBodyFocus={() => onBodyFocus?.(index)}
            onFooterFocus={onFooterFocus}
            zoom={zoom}
            pageNumber={index + 1}
          />
        </Box>
      ))}

      {/* Add Page Button at Bottom */}
      <Tooltip title="Add New Page">
        <IconButton
          onClick={addPage}
          sx={{
            backgroundColor: 'background.paper',
            border: '2px dashed',
            borderColor: 'divider',
            width: 60,
            height: 60,
            '&:hover': {
              backgroundColor: 'action.hover',
              borderColor: 'primary.main',
            },
          }}
        >
          <Add />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};
