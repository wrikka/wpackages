<script setup lang="ts">


const props = defineProps<{
  content: string
}>()
const normalize = (value: string) => value.replace(/\r\n/g, '\n')
type Scene = {
  title: string
  body: string
}
const scenes = computed<Scene[]>(() => {
  const text = normalize(props.content)
  const lines = text.split('\n')
  const out: Scene[] = []
  let current: { title: string; body: string[] } | null = null
  const isSceneHeader = (line: string) => {
    const l = line.trim()
    return (
      /^#{1,6}\s*(scene|shot|panel|frame)\b/i.test(l) ||
      /^(scene|shot|panel|frame)\s*\d+\b/i.test(l)
    )
  }
  for (const line of lines) {
    if (isSceneHeader(line)) {
      if (current) {
        out.push({ title: current.title, body: current.body.join('\n').trim() })
      }
      current = { title: line.replace(/^#{1,6}\s*/, '').trim(), body: [] }
      continue
    }
    if (!current) continue
    current.body.push(line)
  }
  if (current) {
    out.push({ title: current.title, body: current.body.join('\n').trim() })
  }
  return out
})
const hasScenes = computed(() => scenes.value.length > 0)

</script>

<template>

  <div class="space-y-2">
    <div class="text-xs font-semibold text-gray-500">Storyboard</div>

    <div v-if="hasScenes" class="space-y-2">
      <div
        v-for="(scene, idx) in scenes"
        :key="idx"
        class="rounded-lg border border-gray-300 bg-white overflow-hidden"
      >
        <div class="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
          <div class="text-sm font-semibold text-gray-800">
            {{ scene.title || `Scene ${idx + 1}` }}
          </div>
          <div class="text-xs text-gray-500">#{{ idx + 1 }}</div>
        </div>
        <div class="p-3">
          <MarkdownRenderer :content="scene.body" />
        </div>
      </div>
    </div>

    <div v-else class="rounded-lg border border-gray-300 bg-white p-3">
      <MarkdownRenderer :content="content" />
    </div>
  </div>

</template>