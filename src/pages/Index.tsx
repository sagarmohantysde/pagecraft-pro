import React, { useState, useCallback } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { TemplateList } from '@/components/templates/TemplateList';
import { DocumentEditor } from '@/components/editor/DocumentEditor';
import { useTemplates } from '@/hooks/useTemplates';
import { DocumentTemplate } from '@/types/document';

// MUI Theme matching our Tailwind design system
const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6', // Blue matching our primary
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f3f4f6', // canvas color
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    },
    divider: '#e5e7eb',
    action: {
      hover: 'rgba(59, 130, 246, 0.08)',
      selected: 'rgba(59, 130, 246, 0.12)',
      disabledBackground: 'rgba(0, 0, 0, 0.04)',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

type ViewState = 
  | { type: 'list' }
  | { type: 'editor'; templateId: string; headerFooterLocked: boolean };

const Index: React.FC = () => {
  const [view, setView] = useState<ViewState>({ type: 'list' });
  const { templates, createTemplate, updateTemplate, deleteTemplate, getTemplate, duplicateTemplate } = useTemplates();

  const handleCreateTemplate = useCallback(() => {
    const newTemplate = createTemplate();
    setView({ 
      type: 'editor', 
      templateId: newTemplate.id, 
      headerFooterLocked: false // Template creation mode: header/footer editable, body shows lock
    });
  }, [createTemplate]);

  const handleEditTemplate = useCallback((id: string) => {
    setView({ 
      type: 'editor', 
      templateId: id, 
      headerFooterLocked: false // Edit mode: header/footer editable
    });
  }, []);

  const handleDeleteTemplate = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
    }
  }, [deleteTemplate]);

  const handleDuplicateTemplate = useCallback((id: string) => {
    const duplicate = duplicateTemplate(id);
    if (duplicate) {
      setView({ 
        type: 'editor', 
        templateId: duplicate.id, 
        headerFooterLocked: false 
      });
    }
  }, [duplicateTemplate]);

  const handleSaveTemplate = useCallback((template: DocumentTemplate) => {
    updateTemplate(template.id, template);
    setView({ type: 'list' });
  }, [updateTemplate]);

  const handleBack = useCallback(() => {
    setView({ type: 'list' });
  }, []);

  const currentTemplate = view.type === 'editor' ? getTemplate(view.templateId) : null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {view.type === 'list' ? (
        <TemplateList
          templates={templates}
          onCreateTemplate={handleCreateTemplate}
          onEditTemplate={handleEditTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onDuplicateTemplate={handleDuplicateTemplate}
        />
      ) : currentTemplate ? (
        <DocumentEditor
          template={currentTemplate}
          onSave={handleSaveTemplate}
          onBack={handleBack}
          headerFooterLocked={view.headerFooterLocked}
        />
      ) : null}
    </ThemeProvider>
  );
};

export default Index;
