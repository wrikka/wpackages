<script setup lang="ts">

import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)

</script>

<template>

  <button @click="toggleDark()" class="btn-icon">
    <span v-if="isDark" class="i-carbon-moon"></span>
    <span v-else class="i-carbon-sun"></span>
  </button>

</template>