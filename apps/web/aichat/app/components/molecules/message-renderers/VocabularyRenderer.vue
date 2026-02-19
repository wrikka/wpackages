<script setup lang="ts">


const props = defineProps<{
  content: string
}>()
const normalize = (value: string) => value.replace(/\r\n/g, '\n')
type Card = {
  term: string
  definition: string
  example?: string
}
const parseCards = (text: string): Card[] => {
  const t = normalize(text)
  // Prefer structured blocks: Term: / Definition: / Example:
  const blocks = t.split(/\n{2,}/).map(b => b.trim()).filter(Boolean)
  const cards: Card[] = []
  for (const b of blocks) {
    const termMatch = /^\s*(?:\*\*)?\s*term\s*:\s*(.+)$/im.exec(b)
    const defMatch = /^\s*(?:\*\*)?\s*definition\s*:\s*([\s\S]+?)(?:\n\s*(?:\*\*)?\s*example\s*:\s*|$)/im.exec(b)
    const exMatch = /^\s*(?:\*\*)?\s*example\s*:\s*([\s\S]+)$/im.exec(b)
    if (termMatch && defMatch) {
      cards.push({
        term: termMatch[1].trim(),
        definition: defMatch[1].trim(),
        example: exMatch?.[1]?.trim(),
      })
      continue
    }
    // Fallback: bullet format "- term: definition"
    const bullet = /^-\s*([^:]{2,40})\s*:\s*(.+)$/m.exec(b)
    if (bullet) {
      cards.push({ term: bullet[1].trim(), definition: bullet[2].trim() })
    }
  }
  return cards
}
const cards = computed(() => parseCards(props.content))
const hasCards = computed(() => cards.value.length > 0)

</script>

<template>

  <div class="space-y-2">
    <div class="text-xs font-semibold text-gray-500">Vocabulary</div>

    <div v-if="hasCards" class="space-y-2">
      <details
        v-for="(c, idx) in cards"
        :key="idx"
        class="rounded-lg border border-gray-300 bg-white"
        :open="idx === 0"
      >
        <summary class="cursor-pointer select-none px-3 py-2 text-sm font-semibold">
          {{ c.term }}
        </summary>
        <div class="px-3 pb-3 space-y-2">
          <div class="text-xs font-semibold text-gray-500">Definition</div>
          <MarkdownRenderer :content="c.definition" />

          <div v-if="c.example" class="pt-2">
            <div class="text-xs font-semibold text-gray-500">Example</div>
            <MarkdownRenderer :content="c.example" />
          </div>
        </div>
      </details>
    </div>

    <div v-else class="rounded-lg border border-gray-300 bg-white p-3">
      <MarkdownRenderer :content="content" />
    </div>
  </div>

</template>