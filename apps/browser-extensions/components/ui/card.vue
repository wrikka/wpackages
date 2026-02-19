<script setup lang="ts">

import { computed } from 'vue'

interface CardProps {
  class?: string
}

interface CardHeaderProps {
  class?: string
}

interface CardFooterProps {
  class?: string
}

interface CardTitleProps {
  class?: string
}

interface CardContentProps {
  class?: string
}

const props = defineProps<CardProps>()

const cardClasses = computed(() => {
  return `card ${props.class || ''}`
})

const cardHeaderClasses = computed(() => {
  return 'card-header'
})

const cardTitleClasses = computed(() => {
  return 'card-title'
})

const cardContentClasses = computed(() => {
  return 'card-content'
})

const cardFooterClasses = computed(() => {
  return 'card-footer'
})

</script>

<template>

  <div :class="cardClasses">
    <slot />
  </div>

</template>