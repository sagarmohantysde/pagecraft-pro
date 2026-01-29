export interface DocumentTemplate {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  headerContent: string;
  bodyContent: string;
  footerContent: string;
  headerHeight: number; // percentage 0-50
  footerHeight: number; // percentage 0-50
}

export interface DocumentRegion {
  type: 'header' | 'body' | 'footer';
  content: string;
  height?: number; // percentage for header/footer
}

export interface EditorProps {
  header_footer_locked: boolean;
  template?: DocumentTemplate;
  onSave?: (template: DocumentTemplate) => void;
}

export interface RegionProps {
  content: string;
  onChange: (content: string) => void;
  locked?: boolean;
  height?: number;
  onHeightChange?: (height: number) => void;
  placeholder?: string;
  showResizeHandle?: boolean;
  handlePosition?: 'top' | 'bottom';
}
