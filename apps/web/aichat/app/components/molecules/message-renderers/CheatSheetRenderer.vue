<script setup lang="ts">


const props = defineProps<{
  content: string
}>()
const normalize = (value: string) => value.replace(/\r\n/g, '\n')
const splitByHeadings = (text: string, headings: string[]) => {
  const t = normalize(text)
  const out: Record<string, string> = {}
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i]
    const next = headings[i + 1]
    const re = new RegExp(`(^|\\n)#{1,6}\\s*${h}\\s*\\n`, 'i')
    const m = re.exec(t)
    if (!m) continue
    const start = m.index + m[0].length
    let end = t.length
    if (next) {
      const reNext = new RegExp(`(^|\\n)#{1,6}\\s*${next}\\s*\\n`, 'i')
      const nm = reNext.exec(t.slice(start))
      if (nm) end = start + nm.index
    }
    out[h] = t.slice(start, end).trim()
  }
  return out
}
const sections = computed(() => {
  return splitByHeadings(props.content, [
    'Overview',
    'Key concepts',
    'Cheat sheet',
    'Formulas',
    'Patterns',
    'Examples',
    'Common mistakes',
    'Quick tips',
    'Summary',
  ])
})
const hasStructured = computed(() => {
  const s = sections.value
  return Boolean(s['Cheat sheet'] || s['Key concepts'] || s['Quick tips'] || s['Examples'])
})

</script>

<template>

  <div class="space-y-2">
    <div class="text-xs font-semibold text-gray-500">Cheat Sheet</div>

    <div v-if="hasStructured" class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div v-if="sections['Overview']" class="rounded-lg border border-gray-300 bg-white p-3 md:col-span-2">
        <div class="text-xs font-semibold text-gray-500 mb-2">Overview</div>
        <MarkdownRenderer :content="sections['Overview']" />
      </div>

      <div v-if="sections['Key concepts']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Key concepts</div>
        <MarkdownRenderer :content="sections['Key concepts']" />
      </div>

      <div v-if="sections['Quick tips']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Quick tips</div>
        <MarkdownRenderer :content="sections['Quick tips']" />
      </div>

      <div v-if="sections['Cheat sheet']" class="rounded-lg border border-gray-300 bg-white p-3 md:col-span-2">
        <div class="text-xs font-semibold text-gray-500 mb-2">Cheat sheet</div>
        <MarkdownRenderer :content="sections['Cheat sheet']" />
      </div>

      <div v-if="sections['Formulas']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Formulas</div>
        <MarkdownRenderer :content="sections['Formulas']" />
      </div>

      <div v-if="sections['Patterns']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Patterns</div>
        <MarkdownRenderer :content="sections['Patterns']" />
      </div>

      <div v-if="sections['Examples']" class="rounded-lg border border-gray-300 bg-white p-3 md:col-span-2">
        <div class="text-xs font-semibold text-gray-500 mb-2">Examples</div>
        <MarkdownRenderer :content="sections['Examples']" />
      </div>

      <div v-if="sections['Common mistakes']" class="rounded-lg border border-gray-300 bg-white p-3 md:col-span-2">
        <div class="text-xs font-semibold text-gray-500 mb-2">Common mistakes</div>
        <MarkdownRenderer :content="sections['Common mistakes']" />
      </div>
    </div>

    <div v-else class="rounded-lg border border-gray-300 bg-white p-3">
      <MarkdownRenderer :content="content" />
    </div>
  </div>

</template>