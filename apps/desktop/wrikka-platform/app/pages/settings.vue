<script setup lang="ts">

const { isDark, toggleDark } = useTheme();

</script>

<template>

  <div class="mx-auto max-w-5xl px-4 py-8">
    <div class="mb-6">
      <div class="text-sm font-semibold text-slate-100">Settings</div>
      <div class="text-xs text-slate-500">Mockup page — style & preferences.</div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div class="mb-1 text-sm font-semibold text-slate-100">Appearance</div>
        <div class="mb-4 text-xs text-slate-500">Theme & density</div>

        <div class="space-y-3">
          <div class="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
            <div>
              <div class="text-sm text-slate-200">Theme</div>
              <div class="text-xs text-slate-500">{{ isDark ? 'Dark' : 'Light' }}</div>
            </div>
            <button class="rounded-xl bg-slate-900 px-3 py-2 text-xs text-slate-200 ring-1 ring-slate-800 hover:bg-slate-800" @click="toggleDark()">Change</button>
          </div>

          <div class="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
            <div>
              <div class="text-sm text-slate-200">Sidebar</div>
              <div class="text-xs text-slate-500">Compact</div>
            </div>
            <button class="rounded-xl bg-slate-900 px-3 py-2 text-xs text-slate-200 ring-1 ring-slate-800 hover:bg-slate-800">Toggle</button>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div class="mb-1 text-sm font-semibold text-slate-100">Tauri</div>
        <div class="mb-4 text-xs text-slate-500">IPC & runtime</div>

        
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
            <div>
              <div class="text-sm text-slate-200">Toggle Window</div>
              <div class="text-xs text-slate-500">Ctrl+H</div>
            </div>
            <button class="rounded-xl bg-slate-900 px-3 py-2 text-xs text-slate-200 ring-1 ring-slate-800 hover:bg-slate-800">Change</button>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>