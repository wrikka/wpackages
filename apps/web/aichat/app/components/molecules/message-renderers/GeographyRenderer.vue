<script setup lang="ts">


const props = defineProps<{
  content: string
}>()
const normalize = (value: string) => value.replace(/\r\n/g, '\n')
type Fact = {
  key: string
  value: string
}
const parseFacts = (text: string): Fact[] => {
  const t = normalize(text)
  // 1) Try key/value list lines e.g. "Capital: Bangkok"
  const lines = t.split('\n').map(l => l.trim())
  const kv: Fact[] = []
  for (const line of lines) {
    const m = /^([A-Za-z][A-Za-z\s/-]{1,30})\s*:\s*(.+)$/.exec(line)
    if (m) {
      kv.push({ key: m[1].trim(), value: m[2].trim() })
    }
  }
  if (kv.length >= 3) return kv
  // 2) Fallback: bullets "- Key: Value"
  const bulletFacts: Fact[] = []
  for (const line of lines) {
    const m = /^-\s*([^:]{2,40})\s*:\s*(.+)$/.exec(line)
    if (m) {
      bulletFacts.push({ key: m[1].trim(), value: m[2].trim() })
    }
  }
  return bulletFacts
}
const facts = computed(() => parseFacts(props.content))
const hasFacts = computed(() => facts.value.length >= 3)

</script>

<template>

  <div class="space-y-2">
    <div class="text-xs font-semibold text-gray-500">Geography</div>

    <div v-if="hasFacts" class="rounded-lg border border-gray-300 bg-white overflow-hidden">
      <div class="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500">
        Quick Facts
      </div>
      <div class="divide-y divide-gray-100">
        <div v-for="(f, idx) in facts" :key="idx" class="grid grid-cols-3 gap-3 px-3 py-2">
          <div class="text-sm font-semibold text-gray-700 col-span-1">{{ f.key }}</div>
          <div class="text-sm text-gray-800 col-span-2">{{ f.value }}</div>
        </div>
      </div>
    </div>

    <div v-else class="rounded-lg border border-gray-300 bg-white p-3">
      <MarkdownRenderer :content="content" />
    </div>
  </div>

</template>