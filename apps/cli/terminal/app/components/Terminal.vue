<script setup lang="ts">

interface Props {
  id: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
})

const {
  canvasRef,
  containerRef,
  handleKeyDown,
} = useTerminalRendering(props)

</script>

<template>

  <div
    ref="containerRef"
    class="h-full w-full overflow-hidden bg-terminal-bg"
    :class="className"
    @keydown="handleKeyDown"
    tabindex="0"
  >
    <canvas
      ref="canvasRef"
      class="h-full w-full"
      style="image-rendering: pixelated"
    />
  </div>

</template>