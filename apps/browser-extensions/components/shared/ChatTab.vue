<script setup lang="ts">

import Button from "@/components/ui/button.vue";
import Textarea from "@/components/ui/textarea.vue";
import { Send } from "lucide-vue-next";
import { useChat } from "@/composables/useChat";

const props = defineProps<{
  chatMessages: any[];
  saveChatHistory: () => void;
  inputMessage?: any;
}>();

const {
	inputMessage: localInputMessage,
	isStreaming,
	renderMarkdown,
	sendMessage,
} = useChat(ref(props.chatMessages), async () => props.saveChatHistory());
const inputMessage = props.inputMessage || localInputMessage;

</script>

<template>

  <div class="flex-1 flex flex-col p-4 overflow-hidden">
    <div class="flex-1 overflow-y-auto mb-4 space-y-4">
      <div
        v-for="message in chatMessages"
        :key="message.id"
        :class="[
          'flex',
          message.role === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <div
          :class="[
            'max-w-[80%] rounded-lg p-3',
            message.role === 'user'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          ]"
        >
          <div v-if="message.role === 'assistant'" class="prose prose-sm max-w-none" v-html="renderMarkdown(message.content)"></div>
          <div v-else class="whitespace-pre-wrap">{{ message.content }}</div>
        </div>
      </div>
      <div v-if="isStreaming" class="flex justify-start">
        <div class="bg-muted rounded-lg p-3">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-foreground rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-foreground rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex gap-2">
      <Textarea
        v-model="inputMessage"
        placeholder="Type your message..."
        @keydown.ctrl.enter="sendMessage"
        class="flex-1 resize-none"
        rows="2"
      />
      <Button @click="sendMessage" :disabled="isStreaming">
        <Send class="h-4 w-4" />
      </Button>
    </div>
  </div>

</template>