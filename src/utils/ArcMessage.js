import { createApp, nextTick } from 'vue'
import ExpDialog from '@/components/feedback/ExpDialog.vue'
import ErrorDialog from '@/components/feedback/ErrorDialog.vue'
import InfoDialog from '@/components/feedback/InfoDialog.vue'
import WarningDialog from '@/components/feedback/WarningDialog.vue'

// Notification manager to handle stacking
class NotificationManager {
  constructor() {
    this.notifications = {
      success: [],
      error: [],
      info: [],
      warning: []
    }
  }

  add(type, instance) {
    this.notifications[type].push(instance)
    // Use nextTick to ensure DOM is updated before positioning
    nextTick(() => {
      this.updatePositions(type)
    })
  }

  remove(type, instance) {
    const index = this.notifications[type].indexOf(instance)
    if (index > -1) {
      this.notifications[type].splice(index, 1)
      nextTick(() => {
        this.updatePositions(type)
      })
    }
  }

  updatePositions(type) {
    const notifications = this.notifications[type]
    const baseOffset = 20
    const gap = 10

    notifications.forEach((notification, index) => {
      if (!notification.container) return
      
      switch (type) {
        case 'success':
          // Vertical stacking for success notifications
          const successHeight = 60 // Adjusted to match ExpDialog actual height
          const successVerticalOffset = baseOffset + (index * (successHeight + gap))

          notification.container.style.top = `${successVerticalOffset}px`
          notification.container.style.right = '20px'
          notification.container.style.left = 'auto'
          notification.container.style.bottom = 'auto'
          notification.container.style.transform = 'none'
          break
          
        case 'error':
          // Horizontal layout for error notifications
          const errorWidth = 320
          const errorGap = 15
          const horizontalOffset = baseOffset + (index * (errorWidth + errorGap))
          notification.container.style.bottom = '20px'
          notification.container.style.right = `${horizontalOffset}px`
          notification.container.style.top = 'auto'
          notification.container.style.left = 'auto'
          break
          
        case 'info':
          // Vertical stacking for info notifications (center)
          const infoHeight = 90
          const infoVerticalOffset = baseOffset + (index * (infoHeight + gap))
          notification.container.style.top = `${infoVerticalOffset}px`
          notification.container.style.left = '50%'
          notification.container.style.transform = 'translateX(-50%)'
          notification.container.style.right = 'auto'
          notification.container.style.bottom = 'auto'
          break
          
        case 'warning':
          // Vertical stacking for warning notifications (center top)
          const warningHeight = 80
          const warningVerticalOffset = baseOffset + (index * (warningHeight + gap))
          notification.container.style.top = `${warningVerticalOffset}px`
          notification.container.style.left = '50%'
          notification.container.style.transform = 'translateX(-50%)'
          notification.container.style.right = 'auto'
          notification.container.style.bottom = 'auto'
          break
      }
    })
  }
}

const notificationManager = new NotificationManager()

const createNotification = (component, type, props, duration = 3000) => {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.zIndex = '9999'
  container.style.pointerEvents = 'auto'
  document.body.appendChild(container)

  const instance = {
    container,
    type,
    visible: true
  }

  let app = null
  let timeoutId = null

  const close = () => {
    if (instance.visible) {
      instance.visible = false
      // Trigger Vue transition by setting visible to false
      if (app && app._instance) {
        app._instance.props.visible = false
      }
      
      // Wait for transition to complete before cleanup
      setTimeout(() => {
        if (app) {
          app.unmount()
          app = null
        }
        if (container && container.parentNode) {
          container.parentNode.removeChild(container)
        }
        notificationManager.remove(type, instance)
      }, 400) // Match transition duration
    }
  }

  const componentProps = {
    ...props,
    visible: true,
    onClose: close
  }

  app = createApp(component, componentProps)
  app.mount(container)
  
  // Add to manager after mounting to ensure proper positioning
  notificationManager.add(type, instance)

  if (duration > 0) {
    timeoutId = setTimeout(() => {
      close()
    }, duration)
  }

  return { 
    close: () => {
      if (timeoutId) clearTimeout(timeoutId)
      close()
    }
  }
}

const ArcMessage = {
  success: (message, duration = 3000) => {
    return createNotification(ExpDialog, 'success', {
      title: message
    }, duration)
  },
  
  error: (title, messageOrMessages = '', persistent = false, duration = 5000) => {
    const props = {
      title: title
    }

    // Support both single message and array of messages
    if (Array.isArray(messageOrMessages)) {
      props.messages = messageOrMessages
    } else {
      props.message = messageOrMessages
    }

    // If persistent is true, set duration to 0 (no auto-dismiss)
    const finalDuration = persistent ? 0 : duration

    return createNotification(ErrorDialog, 'error', props, finalDuration)
  },
  
  info: (title, message = '', duration = 3000) => {
    return createNotification(InfoDialog, 'info', {
      title: title,
      message: message
    }, duration)
  },
  
  warning: (title, message = '', duration = 4000) => {
    return createNotification(WarningDialog, 'warning', {
      title: title,
      message: message
    }, duration)
  }
}

export default ArcMessage
