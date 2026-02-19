<script setup lang="ts">

import type { ChatScreenMode } from '#shared/types/common';
import type { ThreadedMessage } from '../composables/chat/useThreadedMessages';
import { useContentShapeDetection } from '../composables/chat/useContentShapeDetection';
import BusinessPlanRenderer from './message-renderers/BusinessPlanRenderer.vue';
import CheatSheetRenderer from './message-renderers/CheatSheetRenderer.vue';
import DataAnalystRenderer from './message-renderers/DataAnalystRenderer.vue';
import DecisionMatrixRenderer from './message-renderers/DecisionMatrixRenderer.vue';
import GeographyRenderer from './message-renderers/GeographyRenderer.vue';
import MeetingNotesRenderer from './message-renderers/MeetingNotesRenderer.vue';
import PresentRenderer from './message-renderers/PresentRenderer.vue';
import QuizRenderer from './message-renderers/QuizRenderer.vue';
import ResumeRenderer from './message-renderers/ResumeRenderer.vue';
import StoryboardRenderer from './message-renderers/StoryboardRenderer.vue';
import SummarizeRenderer from './message-renderers/SummarizeRenderer.vue';
import TranslateRenderer from './message-renderers/TranslateRenderer.vue';
import VocabularyRenderer from './message-renderers/VocabularyRenderer.vue';

const props = defineProps<{
  message: ThreadedMessage
  screenMode: ChatScreenMode
}>()

const content = computed(() => props.message.content || '')

// Use content shape detection composable
const {
  hasDecisionMatrixShape,
  hasMeetingNotesShape,
  hasResumeShape,
  hasDataAnalystShape,
  hasBusinessPlanShape,
  hasStoryboardShape,
  hasCheatSheetShape,
  hasGeographyShape,
  hasVocabularyShape,
} = useContentShapeDetection(content)


const isAssistant = computed(() => props.message.role === 'assistant')
const effectiveMode = computed(() => props.screenMode)

</script>

<template>

  <div v-if="!isAssistant">
    <MarkdownRenderer v-if="message.content" :content="message.content" />
  </div>

  <div v-else>
    <SummarizeRenderer v-if="effectiveMode === 'summarize'" :content="content" />
    <TranslateRenderer v-else-if="effectiveMode === 'translate'" :content="content" />
    <QuizRenderer v-else-if="effectiveMode === 'quiz'" :content="content" />
    <PresentRenderer v-else-if="effectiveMode === 'present'" :content="content" />

    <BusinessPlanRenderer v-else-if="hasBusinessPlanShape" :content="content" />
    <DataAnalystRenderer v-else-if="hasDataAnalystShape" :content="content" />
    <StoryboardRenderer v-else-if="hasStoryboardShape" :content="content" />
    <CheatSheetRenderer v-else-if="hasCheatSheetShape" :content="content" />
    <GeographyRenderer v-else-if="hasGeographyShape" :content="content" />
    <VocabularyRenderer v-else-if="hasVocabularyShape" :content="content" />

    <DecisionMatrixRenderer v-else-if="hasDecisionMatrixShape" :content="content" />
    <MeetingNotesRenderer v-else-if="hasMeetingNotesShape" :content="content" />
    <ResumeRenderer v-else-if="hasResumeShape" :content="content" />

    <MarkdownRenderer v-else-if="message.content" :content="message.content" />
  </div>

</template>