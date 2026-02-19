<script setup lang="ts">

import { computed } from 'vue'

interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  class?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'default',
  size: 'default'
})

const buttonClasses = computed(() => {
  const variants = {
    default: 'btn-primary',
    destructive: 'btn-destructive',
    outline: 'btn-outline',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    link: 'text-primary underline-offset-4 hover:underline'
  }
  
  const sizes = {
    default: 'h-10',
    sm: 'h-9 rounded-md px-3 text-xs',
    lg: 'h-11 rounded-md px-8 text-base',
    icon: 'h-10 w-10'
  }
  
  return `${variants[props.variant]} ${sizes[props.size]} ${props.class || ''}`
})

</script>

<template>

  <button :class="buttonClasses" :disabled="disabled">
    <slot />
  </button>

</template>