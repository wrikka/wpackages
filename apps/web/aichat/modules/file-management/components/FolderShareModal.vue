<script setup lang="ts">

import { useFolderShareStore } from '~/stores/folderShare';

const folderShareStore = useFolderShareStore();
const members = ref<any[]>([]);
watch(() => folderShareStore.sharingFolder, async (folder) => {
  if (folder) {
    const data = await $fetch(`/api/folders/${folder.id}/members`);
    members.value = data;
  } else {
    members.value = [];
  }
});
const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const selectedUser = ref<any | null>(null);
watchDebounced(searchQuery, async (query) => {
  if (!query) {
    searchResults.value = [];
    return;
  }
  searchResults.value = await $fetch(`/api/users/search?q=${query}`);
}, { debounce: 300 });
const onAddMember = async () => {
  const folderId = folderShareStore.sharingFolder?.id;
  if (!folderId || !selectedUser.value) return;
  await $fetch(`/api/folders/${folderId}/members`, {
    method: 'POST',
    body: { userId: selectedUser.value.id, role: 'viewer' }, // Default to 'viewer'
  });
  // Add to local list if not already present
  if (!members.value.some(m => m.userId === selectedUser.value.id)) {
    members.value.push({ ...selectedUser.value, role: 'viewer' });
  }
  searchQuery.value = '';
  selectedUser.value = null;
};
const onRemoveMember = async (userId: string) => {
  const folderId = folderShareStore.sharingFolder?.id;
  if (!folderId) return;
  await $fetch(`/api/folders/${folderId}/members/${userId}`, {
    method: 'DELETE',
  });
  members.value = members.value.filter(member => member.userId !== userId);
};
const onUpdateRole = async (userId: string, role: 'editor' | 'viewer') => {
  const folderId = folderShareStore.sharingFolder?.id;
  if (!folderId) return;
  await $fetch(`/api/folders/${folderId}/members`, {
    method: 'POST',
    body: { userId, role },
  });
  const member = members.value.find(m => m.userId === userId);
  if (member) {
    member.role = role;
  }
};

</script>

<template>

  <UModal v-model="folderShareStore.isModalOpen" @close="folderShareStore.closeShareModal">
    <UCard v-if="folderShareStore.sharingFolder">
      <template #header>
        <h3 class="text-lg font-semibold">Share "{{ folderShareStore.sharingFolder.name }}"</h3>
      
</template>