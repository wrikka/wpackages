export interface Point {
  x: number;
  y: number;
}

export interface WorkflowNode {
  id: string;
  type: string; // e.g., 'Click', 'Type', 'Start', 'End'
  position: Point;
  inputs: string[]; // Names of input connectors
  outputs: string[]; // Names of output connectors
  data?: Record<string, any>; // Node-specific settings
}

export interface WorkflowEdge {
  id: string;
  fromNode: string; // ID of the source node
  fromOutput: string; // Name of the output connector on the source node
  toNode: string; // ID of the target node
  toInput: string; // Name of the input connector on the target node
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
