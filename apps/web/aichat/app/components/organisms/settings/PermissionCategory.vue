<script setup lang="ts">

import type { PermissionCategory } from '~/shared/types/permissions';
import PermissionRow from './PermissionRow.vue';

const props = defineProps<{ category: PermissionCategory }>();

</script>

<template>

  <section class="bg-gray-800 p-6 rounded-lg">
    <h2 class="text-2xl font-semibold mb-4">{{ category.name }}</h2>
    <div class="space-y-4">
      <PermissionRow 
        v-for="permission in category.permissions"
        :key="permission.id"
        :permission="permission"
      />
    </div>
  </section>

</template>