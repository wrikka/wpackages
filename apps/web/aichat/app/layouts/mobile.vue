<template>
  <div class="bg-gray-700 min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-sm h-[800px] bg-black rounded-[40px] border-[10px] border-gray-900 shadow-2xl overflow-hidden relative">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl"></div>
      <div class="h-full w-full overflow-y-auto">
        <slot />
      </div>
    </div>
  </div>
</template>
