import { defineStore } from 'pinia';
import type { RecordedAction, RecorderStatus } from '~/shared/types/recorder';

interface RecorderState {
  status: RecorderStatus;
  recordedActions: RecordedAction[];
  startTime: number | null;
}

export const useTaskRecorderStore = defineStore('taskRecorder', {
  state: (): RecorderState => ({
    status: 'idle',
    recordedActions: [],
    startTime: null,
  }),
  actions: {
    startRecording() {
      if (this.status === 'idle') {
        this.recordedActions = [];
        this.startTime = Date.now();
      }
      this.status = 'recording';
      console.log('Task recording started.');
    },
    pauseRecording() {
      this.status = 'paused';
      console.log('Task recording paused.');
    },
    stopRecording() {
      this.status = 'idle';
      console.log('Task recording stopped.');
    },
    addAction(action: Omit<RecordedAction, 'id' | 'timestamp'>) {
      if (this.status !== 'recording') return;

      const newAction: RecordedAction = {
        ...action,
        id: `action-${Date.now()}`,
        timestamp: Date.now() - (this.startTime || Date.now()),
      };
      this.recordedActions.push(newAction);
    },
  },
});
