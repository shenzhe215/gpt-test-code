import React, { useEffect, useState } from 'react'
import { api } from '../services/api.js'

export default function Review() {
  const [due, setDue] = useState([])
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [error, setError] = useState('')
  const [revealed, setRevealed] = useState({})

  const loadDue = async () => {
    setError('')
    try {
      const cards = await api.getDueCards()
      setDue(cards)
    } catch (e) {
      setError(String(e))
    }
  }

  useEffect(() => {
    loadDue()
  }, [])

  const addCard = async () => {
    setError('')
    if (!front.trim() || !back.trim()) return
    try {
      await api.addCard(front, back)
      setFront('')
      setBack('')
      loadDue()
    } catch (e) {
      setError(String(e))
    }
  }

  const grade = async (id, q) => {
    try {
      await api.gradeCard(id, q)
      setRevealed((r) => ({ ...r, [id]: false }))
      loadDue()
    } catch (e) {
      setError(String(e))
    }
  }

  return (
    <div>
      <p>每日复习（SM-2 间隔重复）。新增卡片或对到期卡片打分 (0-5)。</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input value={front} onChange={(e) => setFront(e.target.value)} placeholder="正面（问题/词汇）" style={{ flex: 1 }} />
        <input value={back} onChange={(e) => setBack(e.target.value)} placeholder="反面（答案/释义）" style={{ flex: 1 }} />
        <button onClick={addCard}>添加卡片</button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <h4>到期卡片</h4>
      {due.length === 0 && <div>今天没有需要复习的卡片。</div>}
      {due.map((card) => (
        <div key={card.id} style={{ border: '1px solid #ddd', borderRadius: 6, padding: 8, marginBottom: 8 }}>
          <div><strong>Q:</strong> {card.front}</div>
          {revealed[card.id] ? (
            <div style={{ marginTop: 6 }}><strong>A:</strong> {card.back}</div>
          ) : (
            <button style={{ marginTop: 6 }} onClick={() => setRevealed((r) => ({ ...r, [card.id]: true }))}>显示答案</button>
          )}
          <div style={{ marginTop: 8 }}>
            评分: {[0,1,2,3,4,5].map((q) => (
              <button key={q} onClick={() => grade(card.id, q)} style={{ marginRight: 4 }}>{q}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

