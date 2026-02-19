<script setup lang="ts">


const user = useUser();
const toast = useToast();
const nickname = ref(user.value?.aiNickname || '');
const isLoading = ref(false);
watch(() => user.value?.aiNickname, (newNickname) => {
  nickname.value = newNickname || '';
});
const saveNickname = async () => {
  isLoading.value = true;
  try {
    const updatedUser = await $fetch('/api/user', {
      method: 'PUT',
      body: { aiNickname: nickname.value },
    });
    user.value = updatedUser;
    toast.add({ title: 'Nickname saved!', color: 'green' });
  } catch (error) {
    console.error('Failed to save nickname', error);
    toast.add({ title: 'Error saving nickname', description: 'Please try again later.', color: 'red' });
  } finally {
    isLoading.value = false;
  }
};

</script>

<template>

  <div class="p-4 border border-gray-700 rounded-lg">
    <h2 class="text-2xl font-semibold mb-4">AI Nickname</h2>
    <p class="text-gray-400 mb-4">Give your AI a custom name to make it feel more personal.</p>
    <div class="flex items-center space-x-2">
      <UInput
        v-model="nickname"
        placeholder="e.g., Jarvis, Friday"
        class="flex-1"
      />
      <UButton @click="saveNickname" :loading="isLoading">Save</UButton>
    </div>
  </div>

</template>