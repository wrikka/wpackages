<script setup lang="ts">


interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray'
  size?: 'xs' | 'sm' | 'md'
}
const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'sm',
})
const badgeClasses = computed(() => {
  const base = 'inline-flex items-center font-medium rounded-full'
  const variants = {
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }
  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }
  return [base, variants[props.variant], sizes[props.size]].join(' ')
})

</script>

<template>

  <span
    :class="badgeClasses"
  >
    <slot />
  </span>

</template>