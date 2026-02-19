export interface MermaidDiagram {
  id: string;
  messageId: string;
  type:
    | 'flowchart'
    | 'sequence'
    | 'class'
    | 'state'
    | 'er'
    | 'journey'
    | 'gantt'
    | 'pie'
    | 'mindmap';
  definition: string;
  svg?: string;
  error?: string;
  isDark: boolean;
}

export interface DiagramViewerSettings {
  defaultTheme: 'default' | 'dark' | 'forest' | 'neutral';
  autoRender: boolean;
  zoom: number;
  pan: { x: number; y: number };
}
