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
    'Executive Summary',
    'Problem',
    'Solution',
    'Target customers',
    'Market Analysis',
    'Competitive landscape',
    'Go-to-Market',
    'Pricing',
    'Revenue Model',
    'Operations',
    'Team',
    'Milestones',
    'Risks',
    'Financial Projections',
    'Ask',
  ])
})
const hasStructured = computed(() => {
  const s = sections.value
  return Boolean(s['Executive Summary'] || s['Go-to-Market'] || s['Revenue Model'] || s['Financial Projections'])
})

</script>

<template>

  <div class="space-y-2">
    <div class="text-xs font-semibold text-gray-500">Business Plan</div>

    <div v-if="hasStructured" class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div v-if="sections['Executive Summary']" class="rounded-lg border border-gray-300 bg-white p-3 md:col-span-2">
        <div class="text-xs font-semibold text-gray-500 mb-2">Executive Summary</div>
        <MarkdownRenderer :content="sections['Executive Summary']" />
      </div>

      <div v-if="sections['Problem']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Problem</div>
        <MarkdownRenderer :content="sections['Problem']" />
      </div>

      <div v-if="sections['Solution']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Solution</div>
        <MarkdownRenderer :content="sections['Solution']" />
      </div>

      <div v-if="sections['Market Analysis']" class="rounded-lg border border-gray-300 bg-white p-3 md:col-span-2">
        <div class="text-xs font-semibold text-gray-500 mb-2">Market Analysis</div>
        <MarkdownRenderer :content="sections['Market Analysis']" />
      </div>

      <div v-if="sections['Go-to-Market']" class="rounded-lg border border-gray-300 bg-white p-3 md:col-span-2">
        <div class="text-xs font-semibold text-gray-500 mb-2">Go-to-Market</div>
        <MarkdownRenderer :content="sections['Go-to-Market']" />
      </div>

      <div v-if="sections['Revenue Model']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Revenue Model</div>
        <MarkdownRenderer :content="sections['Revenue Model']" />
      </div>

      <div v-if="sections['Financial Projections']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Financial Projections</div>
        <MarkdownRenderer :content="sections['Financial Projections']" />
      </div>

      <div v-if="sections['Milestones']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Milestones</div>
        <MarkdownRenderer :content="sections['Milestones']" />
      </div>

      <div v-if="sections['Risks']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Risks</div>
        <MarkdownRenderer :content="sections['Risks']" />
      </div>

      <div v-if="sections['Ask']" class="rounded-lg border border-gray-300 bg-white p-3 md:col-span-2">
        <div class="text-xs font-semibold text-gray-500 mb-2">Ask</div>
        <MarkdownRenderer :content="sections['Ask']" />
      </div>
    </div>

    <div v-else class="rounded-lg border border-gray-300 bg-white p-3">
      <MarkdownRenderer :content="content" />
    </div>
  </div>

</template>