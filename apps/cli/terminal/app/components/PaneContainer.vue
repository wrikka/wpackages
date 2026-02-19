<script setup lang="ts">

interface Props {
  pane: {
    id: string
    parentId: string | null
    children: string[]
    splitDirection: 'horizontal' | 'vertical' | null
    splitRatio: number
    terminalId: string | null
    active: boolean
  }
}

const props = defineProps<Props>()
const paneStore = usePaneStore()

const children = computed(() => {
  return props.pane.children.map(id => paneStore.getPane(id)).filter(Boolean)
})

const isLeaf = computed(() => props.pane.children.length === 0)

</script>

<template>

  <div
    v-if="isLeaf"
    class="flex h-full w-full"
  >
    <Terminal :id="pane.terminalId || pane.id" />
  </div>
  <div
    v-else
    class="flex h-full w-full"
    :class="pane.splitDirection === 'horizontal' ? 'flex-row' : 'flex-col'"
  >
    <PaneContainer
      v-for="child in children"
      :key="child.id"
      :pane="child"
      :style="{
        flex: pane.splitRatio,
      }"
    />
  </div>

</template>