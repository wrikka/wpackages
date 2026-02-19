<script setup lang="ts">


interface Props {
  hover?: boolean
  clickable?: boolean
  padding?: 'sm' | 'md' | 'lg'
  role?: string
  ariaLabel?: string
}
const props = withDefaults(defineProps<Props>(), {
  hover: false,
  clickable: false,
  padding: 'md',
  role: undefined,
  ariaLabel: undefined,
})
const paddingClasses = computed(() => {
  const map = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }
  return map[props.padding]
})

</script>

<template>

  <div
    class="card bg-white border border-gray-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary-500"
    :class="[
      paddingClasses,
      hover && 'card-hover hover:shadow-md transition-shadow',
      clickable && 'cursor-pointer focus:outline-none'
    ]"
    :role="role"
    :aria-label="ariaLabel"
    :tabindex="clickable ? 0 : undefined"
  >
    <slot />
  </div>

</template>