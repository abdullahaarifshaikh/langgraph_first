import React, { useEffect, useRef, useState } from 'react'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([]) // { sender: 'user'|'bot', text }
  const [loading, setLoading] = useState(false)
  const messagesRef = useRef(null)
  const API_URL = (import.meta.env.VITE_API_URL ?? "https://langgraph-first.onrender.com") + "/chat";


  // auto-scroll on new messages
  useEffect(() => {
    const el = messagesRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  async function sendMessage(e) {
    e?.preventDefault()
    if (!input.trim()) return

    const text = input.trim()
    // Show user message immediately
    setMessages(prev => [...prev, { sender: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Server error ${res.status}: ${body}`)
      }

      const data = await res.json()
      const botText = data.response ?? '(no response)'
      setMessages(prev => [...prev, { sender: 'bot', text: botText }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error: ' + err.message }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="chat-window">
        <div className="header">Simple Chat</div>

        <div className="messages" ref={messagesRef}>
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.sender}`}>
              <div className="bubble">{m.text}</div>
            </div>
          ))}

          {loading && (
            <div className="message bot">
              <div className="bubble">...</div>
            </div>
          )}
        </div>

        <form className="input-area" onSubmit={sendMessage}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
