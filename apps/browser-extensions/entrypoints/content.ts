export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('Wai Browser Agent content script loaded')

    // Create floating action button
    const createFloatingButton = () => {
      const button = document.createElement('div')
      button.id = 'wai-agent-fab'
      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `

      // Style the floating button
      Object.assign(button.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '56px',
        height: '56px',
        backgroundColor: '#3b82f6',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '10000',
        transition: 'all 0.3s ease',
        color: 'white'
      })

      // Hover effects
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)'
        button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)'
      })

      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)'
        button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
      })

      // Click handler
      button.addEventListener('click', () => {
        browser.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' })
      })

      return button
    }

    // Add floating button to page
    const fab = createFloatingButton()
    document.body.appendChild(fab)

    // Page analysis functions
    const analyzePage = () => {
      const pageData = {
        url: window.location.href,
        title: document.title,
        text: document.body.innerText.substring(0, 5000), // First 5000 chars
        links: Array.from(document.querySelectorAll('a')).map(link => ({
          text: link.textContent?.substring(0, 100),
          href: link.href
        })).slice(0, 20), // First 20 links
        images: Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt
        })).slice(0, 10), // First 10 images
        forms: Array.from(document.querySelectorAll('form')).map(form => ({
          action: form.action,
          method: form.method,
          inputs: Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
            name: (input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).name,
            type: (input as HTMLInputElement).type || input.tagName.toLowerCase(),
            placeholder: (input as HTMLInputElement | HTMLTextAreaElement).placeholder || ''
          }))
        }))
      }

      return pageData
    }

    // Handle messages from background script
    browser.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
      switch (message.type) {
        case 'ANALYZE_PAGE': {
          const pageData = analyzePage()
          sendResponse({ data: pageData })
          break
        }

        case 'HIGHLIGHT_ELEMENTS':
          if (message.selectors) {
            message.selectors.forEach((selector: string) => {
              try {
                const elements = document.querySelectorAll(selector)
                elements.forEach((el: Element) => {
                  const htmlEl = el as HTMLElement
                  htmlEl.style.border = '2px solid #3b82f6'
                  htmlEl.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
                })
              } catch (error) {
                console.warn('Invalid selector:', selector)
              }
            })
          }
          sendResponse({ success: true })
          break

        case 'CLEAR_HIGHLIGHTS':
          document.querySelectorAll('[style*="border: 2px solid #3b82f6"]').forEach((el: Element) => {
            const htmlEl = el as HTMLElement
            htmlEl.style.border = ''
            htmlEl.style.backgroundColor = ''
          })
          sendResponse({ success: true })
          break

        case 'CLICK_ELEMENT':
          if (message.selector) {
            const element = document.querySelector(message.selector)
            if (element) {
              element.click()
              sendResponse({ success: true })
            } else {
              sendResponse({ success: false, error: 'Element not found' })
            }
          }
          break
      }
    })

    // Auto-hide FAB on certain pages
    const shouldHideFab = () => {
      const hideOnPatterns = [
        /chrome:\/\/.*/,
        /edge:\/\/.*/,
        /firefox:\/\/.*/,
        /about:.*/
      ]

      return hideOnPatterns.some(pattern => pattern.test(window.location.href))
    }

    if (shouldHideFab()) {
      fab.style.display = 'none'
    }

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      if (fab.parentNode) {
        fab.parentNode.removeChild(fab)
      }
    })
  }
})
