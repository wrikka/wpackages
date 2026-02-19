<script setup lang="ts">


const props = defineProps<{
  sessionId: string
}>()
type WorkspaceFile = {
  path: string
  content: string
}
type WorkspaceState = {
  files: WorkspaceFile[]
  selectedPath: string
}
const storageKey = computed(() => `aichat:code-workspace:${props.sessionId}`)
function getDefaultState(): WorkspaceState {
  const files: WorkspaceFile[] = [
    { path: 'index.html', content: '<!doctype html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>Preview</title>\n    <style>body{font-family:system-ui;margin:24px} code{background:#f3f4f6;padding:2px 6px;border-radius:6px}</style>\n  </head>\n  <body>\n    <h1>Hello</h1>\n    <p>Edit <code>index.html</code> then click Preview.</p>\n  </body>\n</html>\n' },
    { path: 'main.js', content: "console.log('hello')\n" },
    { path: 'styles.css', content: 'body { color: #111827; }\n' },
  ]
  return {
    files,
    selectedPath: files[0]!.path,
  }
}
function loadState(): WorkspaceState {
  if (typeof window === 'undefined') return getDefaultState()
  try {
    const raw = localStorage.getItem(storageKey.value)
    if (!raw) return getDefaultState()
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>
    const files = Array.isArray(parsed.files) ? parsed.files.filter(Boolean) as WorkspaceFile[] : []
    const selectedPath = typeof parsed.selectedPath === 'string' ? parsed.selectedPath : (files[0]?.path ?? 'index.html')
    if (files.length === 0) return getDefaultState()
    return { files, selectedPath }
  } catch {
    return getDefaultState()
  }
}
const state = ref<WorkspaceState>(loadState())
watch(
  () => props.sessionId,
  () => {
    state.value = loadState()
  },
)
watch(
  state,
  (v) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(storageKey.value, JSON.stringify(v))
    } catch {
      // ignore
    }
  },
  { deep: true },
)
const fileList = computed(() => [...state.value.files].sort((a, b) => a.path.localeCompare(b.path)))
const selectedFile = computed(() => state.value.files.find(f => f.path === state.value.selectedPath) || null)
function selectFile(path: string) {
  state.value.selectedPath = path
}
const newFilePath = ref('')
function addFile() {
  const path = newFilePath.value.trim()
  if (!path) return
  if (state.value.files.some(f => f.path === path)) return
  state.value.files.push({ path, content: '' })
  state.value.selectedPath = path
  newFilePath.value = ''
}
function removeSelectedFile() {
  const path = state.value.selectedPath
  const idx = state.value.files.findIndex(f => f.path === path)
  if (idx === -1) return
  state.value.files.splice(idx, 1)
  state.value.selectedPath = state.value.files[0]?.path ?? 'index.html'
}
const previewUrl = ref<string>('')
function buildPreviewDocument() {
  const byPath = new Map(state.value.files.map(f => [f.path, f.content]))
  const html = byPath.get('index.html') ?? '<!doctype html><html><body><h1>No index.html</h1></body></html>'
  const css = byPath.get('styles.css')
  const js = byPath.get('main.js')
  const scriptClose = '</scr' + 'ipt>'
  const injected = html.replace(
    /<\/head>/i,
    `${css ? `<style>\n${css}\n</style>` : ''}</head>`,
  ).replace(
    /<\/body>/i,
    `${js ? `<script>\n${js}\n${scriptClose}` : ''}</body>`,
  )
  return injected
}
function refreshPreview() {
  const doc = buildPreviewDocument()
  previewUrl.value = `data:text/html;charset=utf-8,${encodeURIComponent(doc)}`
}
function downloadWorkspace() {
  const payload = {
    sessionId: props.sessionId,
    exportedAt: new Date().toISOString(),
    files: state.value.files,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `code-workspace-${props.sessionId}.json`
  a.click()
  URL.revokeObjectURL(url)
}
function applyFile(path: string, content: string) {
  const existing = state.value.files.find(f => f.path === path)
  if (existing) {
    existing.content = content
  } else {
    state.value.files.push({ path, content })
  }
  state.value.selectedPath = path
  refreshPreview()
}
defineExpose({
  applyFile,
})
onMounted(() => {
  refreshPreview()
})

</script>

<template>

  <div class="h-full flex flex-col overflow-hidden bg-gray-950 text-gray-100">
    <div class="flex items-center justify-between border-b border-gray-800 px-4 py-2">
      <div class="flex items-center gap-2 text-sm">
        <span class="font-semibold">Code</span>
        <span class="text-gray-400">Workspace</span>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-secondary" @click="refreshPreview">Preview</button>
        <button class="btn-secondary" @click="downloadWorkspace">Download</button>
      </div>
    </div>

    <div class="flex-1 grid grid-cols-12 overflow-hidden">
      <div class="col-span-3 border-r border-gray-800 overflow-y-auto">
        <div class="p-3 text-xs font-bold text-gray-300">Files</div>
        <div class="px-3 pb-3 space-y-2">
          <div class="flex items-center gap-2">
            <input v-model="newFilePath" class="input w-full" placeholder="e.g. foo.js" />
            <button class="btn-primary" @click="addFile">+</button>
          </div>
          <div class="space-y-1 text-sm">
            <button
              v-for="f in fileList"
              :key="f.path"
              type="button"
              class="w-full text-left px-2 py-1 rounded"
              :class="state.selectedPath === f.path ? 'bg-gray-900' : 'hover:bg-gray-900'"
              @click="selectFile(f.path)"
            >
              {{ f.path }}
            </button>
          </div>
          <button class="btn-secondary w-full" @click="removeSelectedFile">Remove selected</button>
        </div>
      </div>

      <div class="col-span-5 flex flex-col overflow-hidden">
        <div class="border-b border-gray-800 px-4 py-2 text-xs text-gray-300">
          {{ state.selectedPath }}
        </div>
        <textarea
          v-if="selectedFile"
          :value="selectedFile.content"
          class="flex-1 w-full resize-none bg-black/40 p-4 font-mono text-xs leading-5 outline-none"
          spellcheck="false"
          @input="selectedFile.content = ($event.target as HTMLTextAreaElement).value"
        />
        <div v-else class="p-4 text-sm text-gray-400">No file selected.</div>
      </div>

      <div class="col-span-4 flex flex-col overflow-hidden border-l border-gray-800">
        <div class="border-b border-gray-800 px-4 py-2 text-xs text-gray-300">Preview</div>
        <iframe :src="previewUrl" class="flex-1 w-full bg-white" />
      </div>
    </div>
  </div>

</template>