import { useEffect, useState } from "react"

const STORAGE_KEY = "chatgpt_time"

function formatTime(ms) {
  if (ms === 0) return "0s"
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`)

  return parts.join(" ")
}

function IndexPopup() {
  const [timeSpent, setTimeSpent] = useState(0)

  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      setTimeSpent(result[STORAGE_KEY] || 0)
    })
  }, [])

  return (
    <div
      style={{
        padding: 24,
        width: 300,
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#1e1e1e",
        color: "#ffffff",
        textAlign: "center"
      }}>
      <h2 style={{ margin: "0 0 16px 0", fontSize: 20, fontWeight: 600 }}>
        ChatGPT Time Tracker
      </h2>
      <div
        style={{
          background: "#2d2d2d",
          padding: "20px",
          borderRadius: 8,
          marginBottom: 16
        }}>
        <p style={{ margin: 0, fontSize: 14, color: "#aaaaaa" }}>Total Time</p>
        <p
          style={{
            margin: "8px 0 0 0",
            fontSize: 28,
            fontWeight: 700,
            color: "#10a37f" // ChatGPT Green
          }}>
          {formatTime(timeSpent)}
        </p>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "#666666" }}>
        Timer updates when you leave the ChatGPT tab.
      </p>
    </div>
  )
}

export default IndexPopup
