import { ref } from 'vue'

interface Toast {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    }
    
    toasts.value.push(newToast)
    
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
    
    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (title: string, description?: string) => {
    return addToast({ title, description, type: 'success' })
  }

  const error = (title: string, description?: string) => {
    return addToast({ title, description, type: 'error', duration: 8000 })
  }

  const info = (title: string, description?: string) => {
    return addToast({ title, description, type: 'info' })
  }

  const warning = (title: string, description?: string) => {
    return addToast({ title, description, type: 'warning' })
  }

  const clear = () => {
    toasts.value = []
  }

  return {
    toasts,
    success,
    error,
    info,
    warning,
    clear,
    addToast,
    removeToast
  }
}
