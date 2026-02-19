<script setup lang="ts">


const availableActions = [
  { type: 'Click', icon: 'IconCursorText', description: 'Clicks an element' },
  { type: 'Type', icon: 'IconKeyboard', description: 'Types text into a field' },
  { type: 'Navigate', icon: 'IconWorld', description: 'Goes to a URL' },
  { type: 'Wait', icon: 'IconClock', description: 'Pauses for a duration' },
  { type: 'Loop', icon: 'IconRepeat', description: 'Repeats a set of actions' },
  { type: 'Condition', icon: 'IconGitFork', description: 'If/Else logic' },
];
const handleDragStart = (event: DragEvent, actionType: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify({ type: 'new-node', actionType }));
    event.dataTransfer.effectAllowed = 'copy';
  }
};

</script>

<template>

  <aside class="w-64 bg-gray-800 p-4 border-r border-gray-700 overflow-y-auto">
    <h2 class="text-md font-semibold mb-4">Actions</h2>
    <div class="space-y-2">
      <div
        v-for="action in availableActions"
        :key="action.type"
        class="p-3 bg-gray-700 rounded-md cursor-grab flex items-center hover:bg-gray-600"
        draggable="true"
        @dragstart="handleDragStart($event, action.type)"
      >
        <!-- Icon placeholder -->
        <div class="w-6 h-6 bg-gray-500 rounded mr-3"></div>
        <div>
          <p class="font-bold">{{ action.type }}</p>
          <p class="text-xs text-gray-400">{{ action.description }}</p>
        </div>
      </div>
    </div>
  </aside>

</template>