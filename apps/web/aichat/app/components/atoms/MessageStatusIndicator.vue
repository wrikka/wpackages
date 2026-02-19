<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export type MessageStatus = 'processing' | 'streaming' | 'completed' | 'error' | 'retrying' | 'timeout'

interface MessageStatusIndicatorProps {
  status: MessageStatus
  message?: string
  progress?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  position?: 'inline' | 'overlay' | 'sidebar'
}

const props = withDefaults(defineProps<MessageStatusIndicatorProps>(), {
  showLabel: true,
  size: 'md',
  position: 'inline'
})

// State
const animationFrame = ref(0)
const pulseAnimation = ref(false)

// Computed
const statusConfig = computed(() => {
  const configs = {
    processing: {
      icon: 'i-heroicons-arrow-path',
      color: 'blue',
      label: 'Processing',
      description: 'AI is thinking...',
      animated: true
    },
    streaming: {
      icon: 'i-heroicons-sparkles',
      color: 'green', 
      label: 'Streaming',
      description: 'AI is typing...',
      animated: true
    },
    completed: {
      icon: 'i-heroicons-check-circle',
      color: 'green',
      label: 'Completed',
      description: 'Response complete',
      animated: false
    },
    error: {
      icon: 'i-heroicons-exclamation-triangle',
      color: 'red',
      label: 'Error',
      description: 'Something went wrong',
      animated: false
    },
    retrying: {
      icon: 'i-heroicons-arrow-path',
      color: 'yellow',
      label: 'Retrying',
      description: 'Trying again...',
      animated: true
    },
    timeout: {
      icon: 'i-heroicons-clock',
      color: 'orange',
      label: 'Timeout',
      description: 'Request timed out',
      animated: false
    }
  }
  
  return configs[props.status] || configs.processing
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm', 
    lg: 'w-6 h-6 text-base'
  }
  return sizes[props.size]
})

const colorClasses = computed(() => {
  const colors = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    orange: 'text-orange-500'
  }
  return colors[statusConfig.value.color as keyof typeof colors]
})

const bgColorClasses = computed(() => {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200', 
    yellow: 'bg-yellow-50 border-yellow-200',
    orange: 'bg-orange-50 border-orange-200'
  }
  return colors[statusConfig.value.color as keyof typeof colors]
})

const progressPercentage = computed(() => {
  return Math.min(Math.max(props.progress || 0, 0), 100)
})

const shouldShowProgress = computed(() => {
  return (props.status === 'processing' || props.status === 'streaming') && props.progress !== undefined
})

// Methods
const getAriaLabel = () => {
  return `${statusConfig.value.label}: ${statusConfig.value.description}`
}

// Watchers
watch(() => props.status, (newStatus) => {
  if (newStatus === 'processing' || newStatus === 'streaming') {
    pulseAnimation.value = true
  } else {
    pulseAnimation.value = false
  }
}, { immediate: true })

// Animation loop for continuous rotation
if (statusConfig.value.animated) {
  const animate = () => {
    animationFrame.value = requestAnimationFrame(animate)
  }
  animate()
}
</script>

<template>
  <div 
    class="message-status-indicator"
    :class="[
      `position-${position}`,
      `size-${size}`,
      bgColorClasses
    ]"
    :aria-label="getAriaLabel()"
    :aria-busy="status === 'processing' || status === 'streaming'"
  >
    <!-- Inline Status -->
    <div v-if="position === 'inline'" class="inline-status">
      <div class="flex items-center gap-2">
        <!-- Status Icon -->
        <div 
          class="status-icon"
          :class="[
            sizeClasses,
            colorClasses,
            { 'animate-spin': statusConfig.animated }
          ]"
        >
          <UIcon :name="statusConfig.icon" />
        </div>
        
        <!-- Status Label -->
        <div v-if="showLabel" class="status-label">
          <span class="font-medium">{{ statusConfig.label }}</span>
          <span v-if="message" class="text-xs opacity-75 ml-1">{{ message }}</span>
        </div>
        
        <!-- Progress Bar -->
        <div v-if="shouldShowProgress" class="progress-container">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ progressPercentage }}%</span>
        </div>
      </div>
    </div>

    <!-- Overlay Status -->
    <div v-else-if="position === 'overlay'" class="overlay-status">
      <div class="status-overlay">
        <!-- Animated Background -->
        <div v-if="statusConfig.animated" class="animated-background">
          <div class="pulse-ring"></div>
          <div class="pulse-ring delay-1"></div>
          <div class="pulse-ring delay-2"></div>
        </div>
        
        <!-- Status Icon -->
        <div 
          class="status-icon-large"
          :class="[
            sizeClasses,
            colorClasses,
            { 'animate-pulse': statusConfig.animated }
          ]"
        >
          <UIcon :name="statusConfig.icon" />
        </div>
        
        <!-- Status Text -->
        <div v-if="showLabel" class="status-text">
          <div class="status-title">{{ statusConfig.label }}</div>
          <div class="status-description">{{ statusConfig.description }}</div>
          <div v-if="message" class="status-message">{{ message }}</div>
        </div>
        
        <!-- Progress Ring -->
        <div v-if="shouldShowProgress" class="progress-ring">
          <svg class="progress-svg" viewBox="0 0 36 36">
            <path
              class="progress-background"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              class="progress-circle"
              :stroke-dasharray="`${progressPercentage}, 100`"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div class="progress-percentage">{{ progressPercentage }}%</div>
        </div>
      </div>
    </div>

    <!-- Sidebar Status -->
    <div v-else-if="position === 'sidebar'" class="sidebar-status">
      <div class="sidebar-item">
        <!-- Status Indicator -->
        <div class="status-indicator-dot">
          <div 
            class="dot"
            :class="[
              colorClasses,
              { 'animate-pulse': statusConfig.animated }
            ]"
          ></div>
        </div>
        
        <!-- Status Info -->
        <div class="sidebar-info">
          <div class="sidebar-title">{{ statusConfig.label }}</div>
          <div v-if="message" class="sidebar-message">{{ message }}</div>
          
          <!-- Mini Progress -->
          <div v-if="shouldShowProgress" class="mini-progress">
            <div class="mini-progress-bar">
              <div 
                class="mini-progress-fill"
                :style="{ width: `${progressPercentage}%` }"
              ></div>
            </div>
          </div>
        </div>
        
        <!-- Status Icon -->
        <div 
          class="sidebar-icon"
          :class="[
            sizeClasses,
            colorClasses,
            { 'animate-spin': statusConfig.animated }
          ]"
        >
          <UIcon :name="statusConfig.icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-status-indicator {
  display: flex;
  align-items: center;
  border-radius: 0.5rem;
  border: 1px solid;
  transition: all 0.2s ease;
}

/* Inline Status */
.inline-status {
  padding: 0.5rem 0.75rem;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-label {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.progress-bar {
  width: 60px;
  height: 4px;
  background: rgba(229, 231, 235, 1);
  border-radius: 2px;
  overflow: hidden;
}

.dark .progress-bar {
  background: rgba(55, 65, 81, 1);
}

.progress-fill {
  height: 100%;
  background: currentColor;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 500;
  min-width: 3rem;
  text-align: right;
}

/* Overlay Status */
.overlay-status {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  text-align: center;
}

.status-overlay {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.animated-background {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border: 2px solid currentColor;
  border-radius: 50%;
  opacity: 0;
  animation: pulse 2s infinite;
}

.pulse-ring.delay-1 {
  animation-delay: 0.5s;
}

.pulse-ring.delay-2 {
  animation-delay: 1s;
}

.status-icon-large {
  position: relative;
  z-index: 1;
}

.status-text {
  text-align: center;
}

.status-title {
  font-weight: 600;
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.status-description {
  color: rgba(107, 114, 128, 1);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.dark .status-description {
  color: rgba(156, 163, 175, 1);
}

.status-message {
  font-size: 0.875rem;
  color: rgba(55, 65, 81, 1);
  padding: 0.5rem;
  background: rgba(243, 244, 246, 1);
  border-radius: 0.375rem;
  margin-top: 0.5rem;
}

.dark .status-message {
  color: rgba(209, 213, 219, 1);
  background: rgba(55, 65, 81, 1);
}

.progress-ring {
  position: relative;
  width: 60px;
  height: 60px;
}

.progress-svg {
  transform: rotate(-90deg);
}

.progress-background {
  fill: none;
  stroke: rgba(229, 231, 235, 1);
  stroke-width: 3;
}

.dark .progress-background {
  stroke: rgba(55, 65, 81, 1);
}

.progress-circle {
  fill: none;
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
}

.progress-percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.875rem;
  font-weight: 600;
}

/* Sidebar Status */
.sidebar-status {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(229, 231, 235, 1);
}

.dark .sidebar-status {
  border-bottom-color: rgba(55, 65, 81, 1);
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-indicator-dot {
  flex-shrink: 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.sidebar-info {
  flex: 1;
  min-width: 0;
}

.sidebar-title {
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.sidebar-message {
  font-size: 0.75rem;
  color: rgba(107, 114, 128, 1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .sidebar-message {
  color: rgba(156, 163, 175, 1);
}

.mini-progress {
  margin-top: 0.5rem;
}

.mini-progress-bar {
  height: 2px;
  background: rgba(229, 231, 235, 1);
  border-radius: 1px;
  overflow: hidden;
}

.dark .mini-progress-bar {
  background: rgba(55, 65, 81, 1);
}

.mini-progress-fill {
  height: 100%;
  background: currentColor;
  transition: width 0.3s ease;
}

.sidebar-icon {
  flex-shrink: 0;
}

/* Size Variants */
.size-sm .inline-status {
  padding: 0.25rem 0.5rem;
}

.size-lg .inline-status {
  padding: 0.75rem 1rem;
}

/* Animations */
@keyframes pulse {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

/* Dark mode adjustments */
.dark .message-status-indicator {
  background: rgba(31, 41, 55, 1);
}

.dark .status-title {
  color: rgba(243, 244, 246, 1);
}

.dark .sidebar-title {
  color: rgba(243, 244, 246, 1);
}
</style>
