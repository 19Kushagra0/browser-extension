export { }

const STORAGE_KEY = "chatgpt_time"

let trackingTabId = null
let startTime = null

function isChatGPTUrl(url) {
  if (!url) return false
  return url.includes("chatgpt.com")
}

function startTracking(tabId) {
  if (startTime) return // Already tracking
  startTime = Date.now()
  trackingTabId = tabId
  console.log("Started tracking ChatGPT")
}

function stopTracking() {
  if (!startTime) return // Not tracking

  const timeSpent = Date.now() - startTime
  startTime = null
  trackingTabId = null

  console.log(`Stopped tracking. Added ${timeSpent}ms`)

  // Save to storage
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const previousTime = result[STORAGE_KEY] || 0
    const newTime = previousTime + timeSpent
    chrome.storage.local.set({ [STORAGE_KEY]: newTime })

    // Push the updated time to the local Next.js MCP server
    // fetch("http://localhost:3000/api/chatgpt-time", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     totalTimeSpentMs: newTime
    //   })
    // }).catch((err) => console.log("Next.js server is off or unreachable", err))
  })
}

// 1. Tab updated (URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    if (isChatGPTUrl(changeInfo.url)) {
      // If it's the active tab, start tracking
      if (tab.active) {
        startTracking(tabId)
      }
    } else {
      if (trackingTabId === tabId) {
        stopTracking()
      }
    }
  }
})

// 2. Tab switched
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId)
  if (isChatGPTUrl(tab.url)) {
    startTracking(activeInfo.tabId)
  } else {
    stopTracking()
  }
})

// 3. Tab closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (trackingTabId === tabId) {
    stopTracking()
  }
})

// 4. Window focus changed
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Chrome lost focus completely
    stopTracking()
  } else {
    // Check the active tab of the newly focused window
    chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
      if (tabs.length > 0 && isChatGPTUrl(tabs[0].url)) {
        startTracking(tabs[0].id)
      } else {
        stopTracking()
      }
    })
  }
})
