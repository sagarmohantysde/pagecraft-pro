import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DocumentTemplate } from '@/types/document';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'document_templates';

export function useTemplates() {
  const [templates, setTemplates] = useLocalStorage<DocumentTemplate[]>(STORAGE_KEY, []);

  const createTemplate = useCallback((name: string = 'Untitled Template'): DocumentTemplate => {
    const now = new Date().toISOString();
    const newTemplate: DocumentTemplate = {
      id: uuidv4(),
      name,
      createdAt: now,
      updatedAt: now,
      headerContent: '',
      bodyContent: '',
      footerContent: '',
      headerHeight: 15, // 15% default
      footerHeight: 10, // 10% default
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  }, [setTemplates]);

  const updateTemplate = useCallback((id: string, updates: Partial<DocumentTemplate>) => {
    setTemplates(prev => 
      prev.map(template => 
        template.id === id 
          ? { ...template, ...updates, updatedAt: new Date().toISOString() }
          : template
      )
    );
  }, [setTemplates]);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  }, [setTemplates]);

  const getTemplate = useCallback((id: string): DocumentTemplate | undefined => {
    return templates.find(template => template.id === id);
  }, [templates]);

  const duplicateTemplate = useCallback((id: string): DocumentTemplate | undefined => {
    const original = templates.find(t => t.id === id);
    if (!original) return undefined;

    const now = new Date().toISOString();
    const duplicate: DocumentTemplate = {
      ...original,
      id: uuidv4(),
      name: `${original.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };
    
    setTemplates(prev => [...prev, duplicate]);
    return duplicate;
  }, [templates, setTemplates]);

  return {
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    duplicateTemplate,
  };
}
