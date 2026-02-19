<script setup lang="ts">

import { ref } from "vue";
import Button from "@/components/ui/button.vue";
import Textarea from "@/components/ui/textarea.vue";
import Select from "@/components/ui/select.vue";
import Card from "@/components/ui/card.vue";
import { Send, Trash2 } from "lucide-vue-next";
import { useBookmarks } from "@/composables/useBookmarks";
import { useNotes } from "@/composables/useNotes";
import { useCustomPrompts } from "@/composables/useCustomPrompts";
import { useTaskAutomation } from "@/composables/useTaskAutomation";
import { useTranslation } from "@/composables/useTranslation";

const props = defineProps<{
  bookmarks: any[];
  notes: any[];
  customPrompts: any[];
  saveBookmarks: () => Promise<void>;
  saveNotes: () => Promise<void>;
  saveCustomPrompts: () => Promise<void>;
  inputMessage: any;
  activeTab: any;
}>();

const emit = defineEmits<{
  "add-bookmark": [];
  "remove-bookmark": [id: string];
}>();

const bookmarksRef = ref(props.bookmarks);
const notesRef = ref(props.notes);
const customPromptsRef = ref(props.customPrompts);

const { addBookmark, removeBookmark } = useBookmarks(
  bookmarksRef,
  props.saveBookmarks,
);
const { noteInput, addNote } = useNotes(notesRef, props.saveNotes);

const { newPromptName, newPromptTemplate, addPrompt, deletePrompt, usePrompt } =
  useCustomPrompts(
    customPromptsRef,
    props.saveCustomPrompts,
    props.inputMessage,
    props.activeTab,
  );

const {
  isRecording,
  recordedActions,
  hasRecordedActions,
  startRecording,
  stopRecording,
  replayActions,
} = useTaskAutomation();

const { translateInput, translateTarget, translateResult, translateText } =
  useTranslation();

</script>

<template>

  <div class="flex-1 p-4 overflow-y-auto">
    <div class="space-y-4">
      <Card>
        <div class="flex flex-col space-y-1.5 p-6">
          <h3 class="text-2xl font-semibold leading-none tracking-tight">Translation</h3>
        </div>
        <div class="p-6 pt-0">
          <Textarea v-model="translateInput" placeholder="Enter text to translate..." class="mb-2" />
          <Select v-model="translateTarget">
            <div class="relative">
              <div class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                <span class="block truncate">{{ translateTarget || 'Select language' }}</span>
                <svg class="ml-2 h-4 w-4 shrink-0 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </Select>
          <Button @click="translateText" class="mt-2 w-full">Translate</Button>
          <div v-if="translateResult" class="mt-2 p-2 bg-muted rounded">
            {{ translateResult }}
          </div>
        </div>
      </Card>
      
      <Card>
        <div class="flex flex-col space-y-1.5 p-6">
          <h3 class="text-2xl font-semibold leading-none tracking-tight">Bookmarks</h3>
        </div>
        <div class="p-6 pt-0">
          <Button @click="$emit('add-bookmark')" class="w-full mb-2">Bookmark Current Page</Button>
          <div class="space-y-2">
            <div v-for="bookmark in bookmarks" :key="bookmark.id" class="flex items-center justify-between p-2 bg-muted rounded">
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{{ bookmark.title }}</div>
                <div class="text-sm text-muted-foreground truncate">{{ bookmark.url }}</div>
              </div>
              <Button variant="ghost" size="icon" @click="$emit('remove-bookmark', bookmark.id)">
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <div class="flex flex-col space-y-1.5 p-6">
          <h3 class="text-2xl font-semibold leading-none tracking-tight">Notes</h3>
        </div>
        <div class="p-6 pt-0">
          <Textarea v-model="noteInput" placeholder="Add a note..." class="mb-2" />
          <Button @click="addNote" class="w-full mb-2">Add Note</Button>
          <div class="space-y-2">
            <div v-for="note in notes" :key="note.id" class="p-2 bg-muted rounded">
              <div class="text-sm">{{ note.content }}</div>
              <div class="text-xs text-muted-foreground mt-1">{{ new Date(note.createdAt).toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <div class="flex flex-col space-y-1.5 p-6">
          <h3 class="text-2xl font-semibold leading-none tracking-tight">Custom Prompts</h3>
        </div>
        <div class="p-6 pt-0">
          <div class="space-y-2 mb-2">
            <div v-for="prompt in customPrompts" :key="prompt.id" class="flex items-center justify-between p-2 bg-muted rounded">
              <div class="flex-1">
                <div class="font-medium">{{ prompt.name }}</div>
                <div class="text-xs text-muted-foreground truncate">{{ prompt.template }}</div>
              </div>
              <div class="flex gap-1">
                <Button variant="ghost" size="icon" @click="usePrompt(prompt)">
                  <Send class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" @click="deletePrompt(prompt.id)">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <input v-model="newPromptName" placeholder="Prompt name" class="w-full p-2 border rounded text-sm" />
            <Textarea v-model="newPromptTemplate" placeholder="Prompt template (use {text} for selected text)" class="mb-2" />
            <Button @click="addPrompt" class="w-full">Add Prompt</Button>
          </div>
        </div>
      </Card>
      
      <Card>
        <div class="flex flex-col space-y-1.5 p-6">
          <h3 class="text-2xl font-semibold leading-none tracking-tight">Task Automation</h3>
        </div>
        <div class="p-6 pt-0">
          <div class="flex gap-2 mb-2">
            <Button @click="startRecording" :disabled="isRecording" variant="destructive">
              {{ isRecording ? "Recording..." : "Start Recording" }}
            </Button>
            <Button @click="stopRecording" :disabled="!isRecording" variant="outline">
              Stop
            </Button>
            <Button @click="replayActions" :disabled="!hasRecordedActions" variant="outline">
              Replay
            </Button>
          </div>
          <div v-if="recordedActions.length > 0" class="text-sm text-muted-foreground">
            {{ recordedActions.length }} actions recorded
          </div>
        </div>
      </Card>
    </div>
  </div>

</template>