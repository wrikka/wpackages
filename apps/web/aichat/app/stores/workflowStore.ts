import { defineStore } from 'pinia';
import type { Point, Workflow, WorkflowNode } from '~/shared/types/workflow';

interface WorkflowState {
  currentWorkflow: Workflow | null;
}

export const useWorkflowStore = defineStore('workflow', {
  state: (): WorkflowState => ({
    currentWorkflow: null,
  }),
  actions: {
    loadWorkflow(id: string) {
      // Mock loading a workflow
      this.currentWorkflow = {
        id,
        name: `My Awesome Workflow ${id}`,
        nodes: [
          {
            id: 'node-1',
            type: 'Start',
            position: { x: 50, y: 150 },
            inputs: [],
            outputs: ['out1'],
          },
          {
            id: 'node-2',
            type: 'Click',
            position: { x: 300, y: 100 },
            inputs: ['in1'],
            outputs: ['out1'],
          },
        ],
        edges: [
          {
            id: 'edge-1',
            fromNode: 'node-1',
            fromOutput: 'out1',
            toNode: 'node-2',
            toInput: 'in1',
          },
        ],
      };
    },
    addNode(payload: { type: string; position: Point }) {
      if (!this.currentWorkflow) return;
      const newNode: WorkflowNode = {
        id: `node-${Date.now()}`,
        type: payload.type,
        position: payload.position,
        inputs: ['in1'],
        outputs: ['out1'],
      };
      this.currentWorkflow.nodes.push(newNode);
    },
    updateNodePosition(nodeId: string, newPosition: Point) {
      const node = this.currentWorkflow?.nodes.find(n => n.id === nodeId);
      if (node) {
        node.position = newPosition;
      }
    },
  },
});
