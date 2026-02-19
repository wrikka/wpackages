<script setup lang="ts">

definePageMeta({ layout: 'mobile' });

import MobileHeader from '~/components/mobile/MobileHeader.vue';
import QuickActionsGrid from '~/components/mobile/QuickActionsGrid.vue';
import NotificationFeed from '~/components/mobile/NotificationFeed.vue';

</script>

<template>

  <div class="bg-gray-900 text-white min-h-full">
    <MobileHeader />
    <main class="p-4">
      <QuickActionsGrid />
      <NotificationFeed />
    </main>
  </div>

</template>