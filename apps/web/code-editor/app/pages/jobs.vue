<script setup lang="ts">

import JobTable from '~/components/JobTable.vue'
import LogViewer from '~/components/LogViewer.vue'
import NotificationCenter from '~/components/NotificationCenter.vue'
import ProgressBar from '~/components/ProgressBar.vue'
import { useFileOpsUi } from '~/composables/fileOpsUi'

const {
  state,
  selectedJob,
  selectJob,
  createJob,
  start,
  pause,
  resume,
  cancel,
  retry,
  ensureMockRunner,
  seedIfEmpty,
} = useFileOpsUi()

const jobs = computed(() => state.value.jobs)

onMounted(() => {
  ensureMockRunner()
})

function noop() {}

function createSampleJob() {
  const job = createJob({
    type: 'copy',
    title: `Copy: ./a.txt -> ./b.txt (${new Date().toLocaleTimeString()})`,
    input: { from: './a.txt', to: './b.txt' },
    options: { overwrite: true, backup: true },
  })
  selectJob(job.id)
}

function clearJobLogs(jobId: string) {
  const job = state.value.jobs.find((j) => j.id === jobId)
  if (!job) return
  job.logs = []
}

function formatJson(v: unknown) {
  return JSON.stringify(v, null, 2)
}

</script>

<template>

  <div class="p-4 h-full">
    <div class="flex items-start justify-between mb-4">
      <div>
        <h1 class="text-3xl font-bold">Jobs</h1>
        <p class="text-sm text-gray-500">UI-only mock for queue, progress, retry/pause/resume/cancel.</p>
      </div>

      <div class="flex gap-2">
        <button
          class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          @click="seedIfEmpty"
        >
          Seed
        </button>
        <button
          class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          @click="createSampleJob"
        >
          New Job
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100%-72px)]">
      <div class="lg:col-span-2 flex flex-col min-h-0">
        <JobTable
          :jobs="jobs"
          @create="createSampleJob"
          @refresh="noop"
          @select="selectJob"
          @start="start"
          @pause="pause"
          @resume="resume"
          @retry="retry"
          @cancel="cancel"
        />
      </div>

      <div class="lg:col-span-1 flex flex-col min-h-0">
        <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex-1 overflow-auto">
          <h2 class="text-lg font-bold mb-2">Job Details</h2>

          <div v-if="!selectedJob" class="text-sm text-gray-500">
            Select a job to view details.
          </div>

          <div v-else class="space-y-3">
            <div>
              <div class="text-xs text-gray-500">Title</div>
              <div class="font-semibold">{{ selectedJob.title }}</div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <div class="text-xs text-gray-500">Type</div>
                <div>{{ selectedJob.type }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-500">Status</div>
                <div>{{ selectedJob.status }}</div>
              </div>
            </div>

            <ProgressBar :value="selectedJob.progress.percent" label="Progress" />

            <div>
              <div class="text-xs text-gray-500">Input</div>
              <pre class="text-xs bg-gray-100 dark:bg-gray-900 rounded p-2 overflow-auto">{{ formatJson(selectedJob.input) }}</pre>
            </div>

            <div>
              <div class="text-xs text-gray-500">Options</div>
              <pre class="text-xs bg-gray-100 dark:bg-gray-900 rounded p-2 overflow-auto">{{ formatJson(selectedJob.options) }}</pre>
            </div>

            <div v-if="selectedJob.output">
              <div class="text-xs text-gray-500">Output</div>
              <pre class="text-xs bg-gray-100 dark:bg-gray-900 rounded p-2 overflow-auto">{{ formatJson(selectedJob.output) }}</pre>
            </div>

            <div v-if="selectedJob.error" class="p-2 rounded bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200">
              {{ selectedJob.error }}
            </div>

            <div class="h-56">
              <LogViewer
                :lines="selectedJob.logs"
                @clear="clearJobLogs(selectedJob.id)"
              />
            </div>
          </div>
        </div>

        <div class="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <NotificationCenter />
        </div>
      </div>
    </div>
  </div>

</template>