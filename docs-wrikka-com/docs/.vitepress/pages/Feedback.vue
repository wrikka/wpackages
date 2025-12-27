<script setup lang="ts">
import { ref } from "vue";

const feedbackText = ref("");
const email = ref("");
const isSubmitting = ref(false);
const showSuccess = ref(false);

const submitFeedback = () => {
	if (!feedbackText.value.trim() || !email.value.trim()) return;

	isSubmitting.value = true;

	// Simulate API call
	setTimeout(() => {
		isSubmitting.value = false;
		showSuccess.value = true;
		feedbackText.value = "";
		email.value = "";

		// Hide success message after 3 seconds
		setTimeout(() => {
			showSuccess.value = false;
		}, 3000);
	}, 1000);
};
</script>

<template>
  <div class="container mx-auto p-4 max-w-3xl">
    <div class="py-6 px-4">
      <div class="animate-fade-in">
        <div class="p-8 border border-gray rounded-lg shadow-sm bg-background-block">
          <h3 class="text-xl font-semibold mb-6 text-text">Share Your Feedback</h3>
          
          <div v-if="showSuccess" class="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg text-success-700">
            <div class="flex items-center gap-2">
              <div class="i-mdi-check-circle text-lg"></div>
              <span>Thank you for your feedback! We appreciate your input.</span>
            </div>
          </div>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">Email</label>
              <input 
                v-model="email"
                type="email"
                class="w-full p-4 border border-gray rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-colors duration-200"
                placeholder="Your email address" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">Your thoughts</label>
              <textarea 
                v-model="feedbackText"
                class="w-full p-4 border border-gray rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-colors duration-200"
                rows="5"
                placeholder="Tell us what you think..."></textarea>
            </div>
            
            <div class="flex justify-end">
              <button 
                @click="submitFeedback"
                :disabled="isSubmitting || !feedbackText.trim() || !email.trim()"
                class="px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                <div v-if="isSubmitting" class="i-mdi-loading animate-spin text-lg"></div>
                <span>{{ isSubmitting ? 'Submitting...' : 'Submit Feedback' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
