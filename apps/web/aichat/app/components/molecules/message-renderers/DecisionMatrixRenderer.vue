<script setup lang="ts">


const props = defineProps<{
  content: string
}>()
const normalize = (value: string) => value.replace(/\r\n/g, '\n')
type Table = { headers: string[]; rows: string[][] }
const parseMarkdownTable = (text: string): Table | null => {
  const lines = normalize(text)
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
  for (let i = 0; i < lines.length - 2; i++) {
    const headerLine = lines[i]
    const sepLine = lines[i + 1]
    if (!headerLine.includes('|')) continue
    if (!/\|\s*:?[-]{3,}:?\s*\|/i.test(sepLine) && !/^-{3,}/.test(sepLine)) continue
    const block: string[] = [headerLine, sepLine]
    let j = i + 2
    while (j < lines.length && lines[j].includes('|')) {
      block.push(lines[j])
      j++
    }
    const splitRow = (line: string) =>
      line
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(c => c.trim())
    const headers = splitRow(block[0])
    const rows = block
      .slice(2)
      .map(splitRow)
      .filter(r => r.length > 0)
    if (headers.length >= 2 && rows.length >= 1) {
      return { headers, rows }
    }
  }
  return null
}
const decisionMatrixTable = computed(() => parseMarkdownTable(props.content))

</script>

<template>

  <div class="space-y-2">
    <div class="text-xs font-semibold text-gray-500">Decision Matrix</div>

    <div v-if="decisionMatrixTable" class="rounded-lg border border-gray-300 bg-white overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="(h, idx) in decisionMatrixTable.headers"
              :key="idx"
              class="text-left px-3 py-2 font-semibold text-gray-700 border-b border-gray-200"
            >
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rIdx) in decisionMatrixTable.rows" :key="rIdx" class="odd:bg-white even:bg-gray-50">
            <td
              v-for="(cell, cIdx) in row"
              :key="cIdx"
              class="px-3 py-2 align-top border-b border-gray-100 text-gray-800"
            >
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="rounded-lg border border-gray-300 bg-white p-3">
      <MarkdownRenderer :content="content" />
    </div>
  </div>

</template>