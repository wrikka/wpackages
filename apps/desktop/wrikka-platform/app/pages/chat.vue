<template>
  <div class="mx-auto flex h-full max-w-5xl flex-col px-4 py-8">
    <div class="mb-6">
      <div class="text-sm font-semibold text-slate-100">Chat</div>
      <div class="text-xs text-slate-500">Mockup UI — chat input centered.</div>
    </div>

    <div class="flex flex-1 items-center justify-center">
      <div class="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
        <div class="mb-4 text-center">
          <div class="text-lg font-semibold text-slate-100">Ask anything</div>
          <div class="text-xs text-slate-500">This is a UI mockup. Wire it to your model later.</div>
        </div>

        <div class="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
          <input
            class="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
            placeholder="Type a message…"
          />
          <button class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Send</button>
        </div>

        <div class="mt-4 flex justify-center gap-2">
          <span class="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-300 ring-1 ring-slate-800">@terminal</span>
          <span class="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-300 ring-1 ring-slate-800">@pages</span>
          <span class="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-300 ring-1 ring-slate-800">@settings</span>
        </div>
      </div>
    </div>
  </div>
</template>
