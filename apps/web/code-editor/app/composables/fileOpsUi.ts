import { computed } from 'vue'

export type FileOpsJobType =
  | 'copy'
  | 'move'
  | 'delete'
  | 'checksum'
  | 'compress'
  | 'decompress'
  | 'watch'
  | 'cloud_upload'
  | 'cloud_download'

export type FileOpsJobStatus = 'queued' | 'running' | 'paused' | 'succeeded' | 'failed' | 'cancelled'

export interface FileOpsJob {
  id: string
  type: FileOpsJobType
  title: string
  status: FileOpsJobStatus
  createdAt: number
  updatedAt: number
  progress: {
    totalBytes?: number
    transferredBytes?: number
    percent: number
  }
  options: Record<string, unknown>
  input: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  logs: string[]
}

export interface FileOpsHistoryEvent {
  id: string
  at: number
  level: 'info' | 'warn' | 'error'
  message: string
  jobId?: string
}

export interface FileOpsNotification {
  id: string
  at: number
  level: 'info' | 'success' | 'warn' | 'error'
  title: string
  message?: string
}

interface FileOpsUiState {
  jobs: FileOpsJob[]
  history: FileOpsHistoryEvent[]
  notifications: FileOpsNotification[]
  selectedJobId: string | null
}

function now() {
  return Date.now()
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export function useFileOpsUiState() {
  return useState<FileOpsUiState>('file-ops-ui', () => ({
    jobs: [],
    history: [],
    notifications: [],
    selectedJobId: null,
  }))
}

export function useFileOpsUi() {
  const state = useFileOpsUiState()

  const selectedJob = computed(() => {
    if (!state.value.selectedJobId) return null
    return state.value.jobs.find((j) => j.id === state.value.selectedJobId) ?? null
  })

  function addHistory(level: FileOpsHistoryEvent['level'], message: string, jobId?: string) {
    state.value.history.unshift({
      id: uid('evt'),
      at: now(),
      level,
      message,
      jobId,
    })
  }

  function notify(level: FileOpsNotification['level'], title: string, message?: string) {
    state.value.notifications.unshift({
      id: uid('ntf'),
      at: now(),
      level,
      title,
      message,
    })
  }

  function appendJobLog(jobId: string, line: string) {
    const job = state.value.jobs.find((j) => j.id === jobId)
    if (!job) return
    job.logs.push(line)
    job.updatedAt = now()
  }

  function createJob(params: {
    type: FileOpsJobType
    title: string
    input?: Record<string, unknown>
    options?: Record<string, unknown>
  }) {
    const id = uid('job')
    const job: FileOpsJob = {
      id,
      type: params.type,
      title: params.title,
      status: 'queued',
      createdAt: now(),
      updatedAt: now(),
      progress: { percent: 0 },
      options: params.options ?? {},
      input: params.input ?? {},
      logs: [],
    }

    state.value.jobs.unshift(job)
    addHistory('info', `Job created: ${job.title}`, job.id)
    notify('info', 'Job created', job.title)
    return job
  }

  function selectJob(jobId: string | null) {
    state.value.selectedJobId = jobId
  }

  function updateJob(jobId: string, patch: Partial<FileOpsJob>) {
    const job = state.value.jobs.find((j) => j.id === jobId)
    if (!job) return
    Object.assign(job, patch)
    job.updatedAt = now()
  }

  function start(jobId: string) {
    const job = state.value.jobs.find((j) => j.id === jobId)
    if (!job) return
    if (job.status === 'succeeded' || job.status === 'failed' || job.status === 'cancelled') return

    updateJob(jobId, { status: 'running' })
    appendJobLog(jobId, `[${new Date().toISOString()}] started`)
    addHistory('info', `Job started: ${job.title}`, jobId)
  }

  function pause(jobId: string) {
    const job = state.value.jobs.find((j) => j.id === jobId)
    if (!job) return
    if (job.status !== 'running') return

    updateJob(jobId, { status: 'paused' })
    appendJobLog(jobId, `[${new Date().toISOString()}] paused`)
    addHistory('warn', `Job paused: ${job.title}`, jobId)
    notify('warn', 'Job paused', job.title)
  }

  function resume(jobId: string) {
    const job = state.value.jobs.find((j) => j.id === jobId)
    if (!job) return
    if (job.status !== 'paused') return

    updateJob(jobId, { status: 'running' })
    appendJobLog(jobId, `[${new Date().toISOString()}] resumed`)
    addHistory('info', `Job resumed: ${job.title}`, jobId)
  }

  function cancel(jobId: string) {
    const job = state.value.jobs.find((j) => j.id === jobId)
    if (!job) return
    if (job.status === 'succeeded' || job.status === 'failed' || job.status === 'cancelled') return

    updateJob(jobId, { status: 'cancelled' })
    appendJobLog(jobId, `[${new Date().toISOString()}] cancelled`)
    addHistory('warn', `Job cancelled: ${job.title}`, jobId)
    notify('warn', 'Job cancelled', job.title)
  }

  function retry(jobId: string) {
    const job = state.value.jobs.find((j) => j.id === jobId)
    if (!job) return

    updateJob(jobId, {
      status: 'queued',
      progress: { ...job.progress, percent: 0 },
      error: undefined,
      output: undefined,
    })

    appendJobLog(jobId, `[${new Date().toISOString()}] retry queued`)
    addHistory('info', `Job retry queued: ${job.title}`, jobId)
    notify('info', 'Job retry queued', job.title)
  }

  function dismissNotification(id: string) {
    state.value.notifications = state.value.notifications.filter((n) => n.id !== id)
  }

  function clearNotifications() {
    state.value.notifications = []
  }

  function tickMockRunner() {
    const running = state.value.jobs.filter((j) => j.status === 'running')
    for (const job of running) {
      const next = Math.min(100, Math.round(job.progress.percent + 5 + Math.random() * 10))
      job.progress.percent = next
      job.updatedAt = now()

      if (next >= 100) {
        job.status = 'succeeded'
        job.output = { message: 'Mock completed' }
        appendJobLog(job.id, `[${new Date().toISOString()}] succeeded`)
        addHistory('info', `Job succeeded: ${job.title}`, job.id)
        notify('success', 'Job succeeded', job.title)
      }
    }
  }

  let startedRunner = false
  function ensureMockRunner() {
    if (!process.client) return
    if (startedRunner) return
    startedRunner = true
    setInterval(() => tickMockRunner(), 700)
  }

  function seedIfEmpty() {
    if (state.value.jobs.length > 0) return
    const j1 = createJob({
      type: 'copy',
      title: 'Copy: ./from.bin -> ./to.bin',
      input: { from: './from.bin', to: './to.bin' },
      options: { overwrite: true, backup: true },
    })
    const j2 = createJob({
      type: 'checksum',
      title: 'Checksum: ./big.iso (sha256)',
      input: { path: './big.iso', algo: 'sha256' },
    })
    start(j1.id)
    start(j2.id)
  }

  return {
    state,
    selectedJob,
    selectJob,
    createJob,
    start,
    pause,
    resume,
    cancel,
    retry,
    dismissNotification,
    clearNotifications,
    addHistory,
    notify,
    appendJobLog,
    ensureMockRunner,
    seedIfEmpty,
  }
}
