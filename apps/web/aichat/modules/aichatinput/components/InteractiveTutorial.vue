<script setup lang="ts">

import { ref, computed } from 'vue';

const show = ref(true);
const currentStep = ref(0);
const steps = [
  { text: 'This is an interactive tutorial to guide you through our features.' },
  { text: 'You can type your questions in the input box below.' },
  { text: 'Try asking me about anything you can imagine!' },
  { text: 'You can also try our example prompts to get started.' },
];
const isLastStep = computed(() => currentStep.value === steps.length - 1);
const nextStep = () => {
  if (isLastStep.value) {
    show.value = false;
    // Here you might want to emit an event or set a flag in localStorage
  } else {
    currentStep.value++;
  }
};
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

</script>

<template>

  <div v-if="show" class="tutorial-overlay">
    <div class="tutorial-modal">
      <h2>Welcome to AI Chat!</h2>
      <p>{{ steps[currentStep].text }}</p>
      <div class="tutorial-actions">
        <button v-if="currentStep > 0" @click="prevStep">Back</button>
        <button @click="nextStep">{{ isLastStep ? 'Finish' : 'Next' }}</button>
      </div>
    </div>
  </div>

</template>

<style scoped>

.tutorial-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.tutorial-modal {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  text-align: center;
}

.tutorial-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  cursor: pointer;
}

</style>