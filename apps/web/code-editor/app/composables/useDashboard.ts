export const useDashboard = () => {
  const { data, pending, error, refresh } = useFetch('/api/dashboard')

  const stats = computed(() => data.value?.data?.stats || {
    users: 0,
    projects: 0,
    activities: 0,
  })

  const recentActivities = computed(() => data.value?.data?.recentActivities || [])
  const recentProjects = computed(() => data.value?.data?.recentProjects || [])

  return {
    data,
    pending,
    error,
    refresh,
    stats,
    recentActivities,
    recentProjects,
  }
}
