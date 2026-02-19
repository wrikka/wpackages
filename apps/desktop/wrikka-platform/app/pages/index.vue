<script setup lang="ts">

const { open } = usePageUpsertModal();

</script>

<template>

  <div class="grid h-full place-items-center">
    <button class="grid h-24 w-24 place-items-center rounded-full bg-slate-900 text-slate-400 ring-1 ring-slate-800 hover:bg-slate-800 hover:text-slate-200" @click="open()">
      <Icon name="heroicons:plus" class="h-8 w-8" />
    </button>
  </div>

</template>