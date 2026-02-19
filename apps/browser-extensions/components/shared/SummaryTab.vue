<script setup lang="ts">

import { ref } from "vue";
import { Copy, Check } from "lucide-vue-next";
import Button from "@/components/ui/button.vue";
import Card from "@/components/ui/card.vue";

const props = defineProps<{
	pageContent: string;
}>();

const emit = defineEmits<{
	summarize: [length: "short" | "medium" | "long"];
	clear: [];
}>();

const isCopied = ref(false);

const copyContent = async () => {
	await navigator.clipboard.writeText(props.pageContent);
	isCopied.value = true;
	setTimeout(() => {
		isCopied.value = false;
	}, 2000);
};

</script>

<template>

  <div class="flex-1 p-4 overflow-y-auto">
    <Card v-if="pageContent">
      <div class="flex flex-col space-y-1.5 p-6">
        <h3 class="text-2xl font-semibold leading-none tracking-tight">Page Summary</h3>
      </div>
      <div class="p-6 pt-0">
        <pre class="text-sm whitespace-pre-wrap break-words">{{ pageContent }}</pre>
      </div>
      <div class="flex items-center justify-between p-6 pt-0">
        <Button variant="ghost" size="icon" @click="copyContent">
          <component :is="isCopied ? Check : Copy" class="h-4 w-4" />
        </Button>
        <div class="flex gap-2">
          <Button variant="outline" @click="$emit('summarize', 'short')">Short</Button>
          <Button variant="outline" @click="$emit('summarize', 'medium')">Medium</Button>
          <Button variant="outline" @click="$emit('summarize', 'long')">Long</Button>
          <Button variant="destructive" @click="$emit('clear')">Clear</Button>
        </div>
      </div>
    </Card>
    <div v-else class="flex items-center justify-center h-full">
      <p class="text-muted-foreground">Right-click on a page and select "Summarize this page" to see content here.</p>
    </div>
  </div>

</template>