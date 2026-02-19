<script setup lang="ts">

// Page metadata
definePageMeta({
  title: 'Dashboard',
  description: 'Overview of your workspace',
})

// Use dashboard composable
const { stats, recentActivities, recentProjects, pending } = useDashboard()

// Use editor composable for code editor button
const { executeAction } = useEditor()

// Handle code editor navigation
const openCodeEditor = () => {
  navigateTo('/editor')
}

// Handle new project creation
const createNewProject = () => {
  console.log('Creating new project...')
  // TODO: Implement project creation logic
}

// Utility function for formatting dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

</script>

<template>

  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="container flex-between h-16">
        <h1 class="text-xl font-semibold text-gray-900">Dashboard</h1>
        <div class="flex gap-4">
          <button class="btn btn-soft" @click="openCodeEditor">
            <div class="i-heroicons-code-bracket w-4 h-4 mr-2"></div>
            Code Editor
          </button>
          <button class="btn btn-soft" @click="createNewProject">
            <div class="i-heroicons-plus w-4 h-4 mr-2"></div>
            New Project
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container py-8">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <div class="i-heroicons-users w-6 h-6 text-blue-600"></div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Users</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.users }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <div class="i-heroicons-folder w-6 h-6 text-green-600"></div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Projects</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.projects }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-lg">
              <div class="i-heroicons-bell w-6 h-6 text-purple-600"></div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Activities</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.activities }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activities and Projects -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Activities -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-medium text-gray-900">Recent Activities</h2>
          </div>
          
          <div v-if="pending" class="flex-center py-8">
            <div class="i-heroicons-arrow-path w-8 h-8 animate-spin text-gray-400"></div>
          </div>
          
          <div v-else-if="recentActivities.length === 0" class="text-center py-8 text-gray-500">
            No recent activities
          </div>
          
          <div v-else class="space-y-4">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <div class="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900">{{ activity.description }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(activity.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Projects -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-medium text-gray-900">Recent Projects</h2>
          </div>
          
          <div v-if="pending" class="flex-center py-8">
            <div class="i-heroicons-arrow-path w-8 h-8 animate-spin text-gray-400"></div>
          </div>
          
          <div v-else-if="recentProjects.length === 0" class="text-center py-8 text-gray-500">
            No recent projects
          </div>
          
          <div v-else class="space-y-4">
            <div v-for="project in recentProjects" :key="project.id" class="border border-gray-200 rounded-lg p-4">
              <div class="flex-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">{{ project.name }}</h3>
                  <p class="text-xs text-gray-500">{{ formatDate(project.createdAt) }}</p>
                </div>
                <span :class="project.status === 'active' ? 'badge-success' : 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800'" class="text-xs font-medium rounded-full px-2 py-1">
                  {{ project.status }}
                </span>
              </div>
              <p v-if="project.description" class="text-sm text-gray-600 mt-2">{{ project.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

</template>